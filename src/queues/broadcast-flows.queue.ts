/* eslint-disable no-await-in-loop */
import { UserFromGetMe } from "@grammyjs/types";
import { Prisma } from "@prisma/client";
import { Job, Queue, WaitingChildrenError, Worker } from "bullmq";
import type Redis from "ioredis";
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
  step: Step;
  token: string;
  batchSize: number;
  cursor: number;
  post: Prisma.PostGetPayload<{
    select: {
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
      const { token, post } = job.data;
      const batchSize = 20;

      let { step } = job.data;
      while (step !== Step.Finish) {
        switch (step) {
          case Step.Initial: {
            const chats = await prisma.botChat.findMany({
              where: { botId, ...prisma.botChat.canSend() },
              orderBy: {
                id: "asc",
              },
              take: batchSize,
            });
            const cursor = chats[batchSize - 1].id;

            // eslint-disable-next-line no-loop-func
            const children = chats.map((chat) => {
              return {
                name: `BC:${botUsername}:${chat.chatId}`,
                data: {
                  chatId: Number(chat.chatId),
                  token,
                  serialId: chat.id,
                  cursor,
                  batchSize,
                  post: {
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
                  removeOnComplete: true,
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
            const chats = await prisma.botChat.findMany({
              take: job.data.batchSize,
              skip: 1,
              cursor: {
                id: job.data.cursor,
              },
              where: { botId },
              orderBy: {
                id: "asc",
              },
            });

            const newCursor = chats[chats.length - 1]
              ? chats[chats.length - 1].id
              : 0; // Use the last chat's ID as the new cursor
            chats.forEach((chat) => {
              container.queues.broadcast.add(
                `chatActionTyping`,
                {
                  chatId: Number(chat.chatId),
                  serialId: chat.id,
                  cursor: newCursor,
                  batchSize: job.data.batchSize,
                  token: job.data.token,
                  post: job.data.post,
                },
                {
                  delay: 100 * chats.indexOf(chat),
                  parent: {
                    id: job.id || "!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
                    queue: job.queueQualifiedName,
                  },
                  removeOnComplete: true,
                }
              );
            });
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
              await job.update({
                ...job.data,
                step: Step.Finish,
              });
              step = Step.Finish;
              return Step.Finish;
            }
            await job.update({
              ...job.data,
              step: Step.Second,
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
    }
  ).on("failed", handleError);
}
