/* eslint-disable no-await-in-loop */
import { UserFromGetMe } from "@grammyjs/types";
import { Prisma } from "@prisma/client";
import { Job, Queue, WaitingChildrenError, Worker } from "bullmq";
import type Redis from "ioredis";
import { broadcastFlowProgressHandler } from "~/bot/handlers/progress.handler";
import { config } from "~/config";
import type { Container } from "~/container";
import type { PrismaClientX } from "~/prisma";

// eslint-disable-next-line no-shadow
enum Step {
  Initial,
  Second,
  Third,
  Finish,
}

export type BroadcastFlowsData = {
  botInfo: UserFromGetMe;
  chatId: number;
  statusMessageId: number;
  step: Step;
  token: string;
  totalCount: number;
  doneCount: number;
  cursor: number;
  post: Prisma.PostGetPayload<{
    select: {
      postId: true;
      text: true;
      type: true;
      fileId: true;
      postOptions: true;
    };
  }>;
};

const queueName = "broadcast-flows";

export function createBroadcastFlowsQueue({
  connection,
}: {
  connection: Redis;
}) {
  return new Queue<BroadcastFlowsData>(queueName, {
    connection,
  });
}

export function createBroadcastFlowsWorker({
  connection,
  prisma,
  handleError,
  container,
}: {
  connection: Redis;
  prisma: PrismaClientX;
  handleError: (job: Job<BroadcastFlowsData> | undefined, error: Error) => void;
  container: Container;
}) {
  return new Worker<BroadcastFlowsData>(
    queueName,
    async (job, saidToken) => {
      if (!saidToken) return new Error("saidToken is required!");
      if (!job.id) return new Error("job has no Id!");

      const { id: botId, username: botUsername } = job.data.botInfo;
      const { token, post, totalCount, doneCount } = job.data;

      let { step } = job.data;
      while (step !== Step.Finish) {
        switch (step) {
          case Step.Initial: {
            const chats = await prisma.botChat.findMany({
              where: { botId, ...prisma.botChat.canSend() },
              orderBy: {
                id: "asc",
              },
              take: config.BATCH_SIZE,
            });
            const lastChat = chats.at(-1);
            const cursor = lastChat ? lastChat.id : 0; // Use the last chat's ID as the new cursor

            // eslint-disable-next-line no-loop-func
            const children = chats.map((chat) => {
              return {
                name: `BC:${botUsername}:${chat.chatId}`,
                data: {
                  chatId: Number(chat.chatId),
                  token,
                  serialId: chat.id,
                  cursor,
                  post: {
                    postId: post.postId,
                    type: post.type,
                    text: post.text,
                    fileId: post.fileId,
                    postOptions: post.postOptions,
                  },
                },
                opts: {
                  delay: 100 * chats.indexOf(chat),
                  parent: {
                    id: job.id || "!!!!!!!!!!!!!!!!!!!",
                    queue: job.queueQualifiedName,
                  },
                  removeOnComplete: false,
                },
              };
            });
            await container.queues.broadcast.addBulk(children);
            await job.update({
              ...job.data,
              step: Step.Second,
            });
            step = Step.Second;
            break;
          }
          case Step.Second: {
            const { cursor } = job.data;
            const chats = await prisma.botChat.findMany({
              take: config.BATCH_SIZE,
              skip: 1,
              cursor: {
                id: cursor,
              },
              where: { botId },
              orderBy: {
                id: "asc",
              },
            });
            const lastChat = chats.at(-1);
            const newCursor = lastChat ? lastChat.id : 0; // Use the last chat's ID as the new cursor
            for (const chat of chats) {
              container.queues.broadcast.add(
                `chatActionTyping`,
                {
                  chatId: Number(chat.chatId),
                  serialId: chat.id,
                  cursor: newCursor,
                  token: job.data.token,
                  post: job.data.post,
                },
                {
                  delay: 100 * chats.indexOf(chat),
                  parent: {
                    id: job.id || "!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
                    queue: job.queueQualifiedName,
                  },
                  removeOnComplete: false,
                },
              );
            }
            await job.update({
              ...job.data,
              step: Step.Third,
              cursor: newCursor, // Update the cursor for the next iteration
            });
            step = Step.Third;
            break;
          }
          case Step.Third: {
            const shouldWait = await job.moveToWaitingChildren(saidToken);
            if (!shouldWait) {
              job.updateProgress({ ok: true, finished: true });
              await job.update({
                ...job.data,
                step: Step.Finish,
              });
              step = Step.Finish;
              return Step.Finish;
            }
            await job.update({
              ...job.data,
              doneCount: doneCount + config.BATCH_SIZE,
              step: Step.Second,
            });
            job.updateProgress({
              ok: true,
              finished: false,
              doneCount: job.data.doneCount,
              totalCount,
            });
            step = Step.Second;
            throw new WaitingChildrenError();
          }
          default: {
            throw new Error("invalid step");
          }
        }
      }
    },
    {
      connection,
    },
  )
    .on("failed", handleError)
    .on("progress", broadcastFlowProgressHandler);
}
