import { UserFromGetMe } from "@grammyjs/types";
import { Job, Queue, Worker } from "bullmq";
import { Bot, GrammyError } from "grammy";
import type Redis from "ioredis";
import { errorMappings } from "~/bot/helpers/error-mapping";
import { tokenToBotId } from "~/bot/helpers/token-to-id";
import type { Container } from "~/container";
import type { PrismaClientX } from "~/prisma";

const sendBroadcast = async (
  jobBot: Bot,
  chatId: number,
  messageId: number
) => {
  return jobBot.api.deleteMessage(chatId, messageId);
};

export type DeleteData = {
  chatId: number;
  messageId: number;
  token: string;
  statusMessageId: number;
  languageCode?: string;
  totalCount: number;
  doneCount: number;
};

const queueName = "delete";

export function createDeleteQueue({ connection }: { connection: Redis }) {
  return new Queue<DeleteData>(queueName, {
    connection,
  });
}

export function createDeleteWorker({
  connection,
  prisma,
  handleError,
  container,
}: {
  connection: Redis;
  prisma: PrismaClientX;
  handleError: (job: Job<DeleteData> | undefined, error: Error) => void;
  container: Container;
}) {
  return new Worker<DeleteData>(
    queueName,
    async (job) => {
      const { token, chatId, messageId } = job.data;
      const botId = tokenToBotId(token);

      const jobBot = new Bot(token, {
        botInfo: { id: botId } as UserFromGetMe,
      });
      await sendBroadcast(jobBot, chatId, messageId).then(
        async (msg) => {
          await job.updateProgress({
            ok: true,
            chatId,
          });
          if (!msg) return;
          await prisma.sent.update({
            where: {
              messageId_chatId: {
                messageId,
                chatId,
              },
            },
            data: {
              deleted: true,
            },
          });
        },
        async (err: GrammyError) => {
          const commonData = {
            where: prisma.botChat.byBotIdChatId(botId, chatId),
          };

          const errorDescription = err.description;
          const specificData = errorMappings[errorDescription];

          if (specificData) {
            await prisma.botChat.update({
              ...commonData,
              data: specificData,
            });
            await job.updateProgress({
              ok: false,
              chatId,
              errorDescription,
            });
          }
        }
      );
    },
    {
      connection,
      concurrency: 10,
    }
  )
    .on("failed", handleError)
    .on(
      "progress",
      (job: Job<DeleteData, unknown, string>, progress: object | number) => {
        if (!job) return;
        const { chatId, doneCount, totalCount, statusMessageId } = job.data;
        container.logger.info(
          `Broadcast job progress ${JSON.stringify(progress)}`,
          { chatId }
        );
      }
    );
}
