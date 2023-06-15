/* eslint-disable no-await-in-loop */
import { UserFromGetMe } from "@grammyjs/types";
import { Prisma } from "@prisma/client";
import { Job, Queue, WaitingChildrenError, Worker } from "bullmq";
import { Bot } from "grammy";
import type Redis from "ioredis";
import { progressBar } from "~/bot/helpers/progress-bar";
import { getRandomEmojiString } from "~/bot/helpers/random-emojis";
import { tokenToBotId } from "~/bot/helpers/token-to-id";
import { broadcastCancelKeyboard } from "~/bot/keyboards";
import { broadcastStatusKeyboard } from "~/bot/keyboards/broadcast-status.keyboard";
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

type progressData = {
  ok: boolean;
  finished?: boolean;
  doneCount?: number;
  totalCount?: number;
};

export type ListFlowData = {
  botInfo: UserFromGetMe;
  chatId: number;
  statusMessageId: number;
  languageCode?: string;
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

const queueName = "list-flow";

export function createListFlowQueue({ connection }: { connection: Redis }) {
  return new Queue<ListFlowData>(queueName, {
    connection,
  });
}

export function createListFlowWorker({
  connection,
  prisma,
  handleError,
  container,
}: {
  connection: Redis;
  prisma: PrismaClientX;
  handleError: (job: Job<ListFlowData> | undefined, error: Error) => void;
  container: Container;
}) {
  return new Worker<ListFlowData>(
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
            const chats = await prisma.list.findMany({
              where: { botId },
              orderBy: {
                id: "asc",
              },
              take: config.BATCH_SIZE,
            });
            const cursor = chats[chats.length - 1]
              ? chats[chats.length - 1].id
              : 0; // Use the last chat's ID as the new cursor

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
            const chats = await prisma.list.findMany({
              take: config.BATCH_SIZE,
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
              job.updateProgress({ ok: true, finished: true });
              await job.update({
                ...job.data,
                step: Step.Finish,
              });
              await prisma.flow.updateMany({
                // TODO: don't use update many
                where: {
                  jobId: job.id,
                },
                data: {
                  finished: true,
                },
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
    }
  )
    .on("failed", handleError)
    .on(
      "progress",
      async (job: Job<ListFlowData>, progress: object | number) => {
        const jobId = job.id;
        if (!jobId) throw new Error("job has no Id!");
        if (typeof progress !== "object")
          throw new Error("progress is not object!");
        const pgs = progress as progressData;
        const {
          chatId,
          doneCount,
          totalCount,
          token,
          statusMessageId,
          languageCode,
        } = job.data;
        const botId = tokenToBotId(token);

        const keyboard = pgs.finished
          ? await broadcastStatusKeyboard(jobId, languageCode)
          : await broadcastCancelKeyboard(jobId, languageCode);

        const jobBot = new Bot(token, {
          botInfo: { id: botId } as UserFromGetMe,
        });
        // const pb = progressBar(doneCount, totalCount, 20);
        let pb = "";
        pb =
          // Array(pb.length).fill("\b").join("") +
          progressBar({
            value: doneCount,
            length: 20,
            vmin: 0,
            vmax: totalCount,
            progressive: false,
          });
        const statusMessageText = `Broadcasting to ${totalCount}\n\n${pb}\n\n${getRandomEmojiString()} `;
        jobBot.api
          .editMessageText(chatId, statusMessageId, statusMessageText, {
            parse_mode: "HTML",
            reply_markup: keyboard,
          })
          .catch(async (e) => {
            // eslint-disable-next-line no-console
            if (e.error_code === 400) {
              const statusMessage = await jobBot.api.sendMessage(
                chatId,
                statusMessageText,
                {
                  parse_mode: "HTML",
                  reply_markup: keyboard,
                }
              );
              job.update({
                ...job.data,
                statusMessageId: statusMessage.message_id,
              });
            } else console.error(e);
          });
        container.logger.info(`${pb} progress ${JSON.stringify(progress)}`);
      }
    );
}
