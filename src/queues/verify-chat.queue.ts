import { UserFromGetMe } from "@grammyjs/types";
import { Job, Queue, Worker } from "bullmq";
import { Bot, GrammyError } from "grammy";
import type Redis from "ioredis";
import { errorMappings } from "~/bot/helpers/error-mapping";
import { groupErrors } from "~/bot/helpers/group-errors";
import { progressBar } from "~/bot/helpers/progress-bar";
import { getRandomEmojiString } from "~/bot/helpers/random-emojis";
import { tokenToBotId } from "~/bot/helpers/token-to-id";
import type { Container } from "~/container";
import type { PrismaClientX } from "~/prisma";

const sendBroadcast = async (jobBot: Bot, chatId: number) => {
  return jobBot.api.getChat(chatId);
};
type progressData = {
  ok: boolean;
  chatId: number;
  errorDescription?: string;
};
export type verifyChatData = {
  chatId: number;
  token: string;
  totalCount: number;
  doneCount: number;
  statusMessageId: number;
  statusMessageChatId: number;
  username?: string;
};

const queueName = "verify-chat";

export function createVerifyChatQueue({ connection }: { connection: Redis }) {
  return new Queue<verifyChatData>(queueName, {
    connection,
  });
}

export function createVerifyChatWorker({
  connection,
  prisma,
  handleError,
  container,
}: {
  connection: Redis;
  prisma: PrismaClientX;
  handleError: (job: Job<verifyChatData> | undefined, error: Error) => void;
  container: Container;
}) {
  return new Worker<verifyChatData>(
    queueName,
    async (job) => {
      const { token, chatId, username } = job.data;
      const botId = tokenToBotId(token);

      const jobBot = new Bot(token, {
        botInfo: { id: botId } as UserFromGetMe,
      });
      const commonData = {
        where: prisma.botChat.byBotIdChatId(botId, chatId),
      };
      await sendBroadcast(jobBot, chatId)
        .catch(async (err: GrammyError) => {
          const errorDescription = err.description;
          const specificData = errorMappings[errorDescription];

          if (specificData) {
            await prisma.botChat.update({
              ...commonData,
              data: specificData,
            });
            job.updateProgress({
              ok: false,
              chatId,
              errorDescription,
            });
          }
        })
        .then(async (chat) => {
          job.updateProgress({
            ok: true,
            chatId,
          });
          if (!chat || chat.type === "private" || chat.type === "group") return;
          await prisma.chat.update({
            where: {
              chatId,
            },
            data: {
              name: chat.title,
              username: chat.username,
              chatType: chat.type,
            },
          });
        });
    },
    {
      connection,
      concurrency: 10,
    }
  )
    .on("failed", handleError)
    .on(
      "progress",
      async (job: Job<verifyChatData>, progress: object | number) => {
        const myProgress = progress as progressData;
        const {
          doneCount,
          totalCount,
          token,
          statusMessageId,
          statusMessageChatId,
          username,
          chatId,
        } = job.data;
        const botId = tokenToBotId(token);
        if (typeof progress !== "object") return;
        if (myProgress.errorDescription) {
          const key = `${botId}:${statusMessageChatId}:${statusMessageId}`;
          await container.redis.setnx(key, "");
          await container.redis.expire(key, 1000);
          await container.redis.append(
            key,
            `\n${myProgress.errorDescription}=${username || chatId}`
          );
        }
        const errors = groupErrors(
          (await container.redis.get(
            `${botId}:${statusMessageChatId}:${statusMessageId}`
          )) || ""
        );
        let pb = "";
        if (doneCount % 30 === 0 || doneCount === totalCount) {
          const jobBot = new Bot(token, {
            botInfo: { id: botId } as UserFromGetMe,
          });
          pb = progressBar({
            value: doneCount,
            length: 20,
            vmin: 0,
            vmax: totalCount,
            progressive: false,
          });
          const statusMessageText = `Broadcasting to ${totalCount}\n\n${pb}\n${errors}\n\n${getRandomEmojiString()}`;
          jobBot.api
            .editMessageText(
              statusMessageChatId,
              statusMessageId,
              statusMessageText,
              {
                parse_mode: "HTML",
              }
            )
            .catch(async (e) => {
              // eslint-disable-next-line no-console
              if (e.error_code === 400 || e.retry_after) {
                const statusMessage = await jobBot.api.sendMessage(
                  statusMessageChatId,
                  statusMessageText,
                  {
                    parse_mode: "HTML",
                  }
                );
                job.update({
                  ...job.data,
                  statusMessageId: statusMessage.message_id,
                });
                // eslint-disable-next-line no-console
              } else console.error(e);
            });
        }
        container.logger.info(
          `doneCount: ${doneCount} totalCount: ${totalCount} ${pb} progress ${JSON.stringify(
            progress
          )}`
        );
      }
    );
}
