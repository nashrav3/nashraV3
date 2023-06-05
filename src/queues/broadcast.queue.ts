import { UserFromGetMe } from "@grammyjs/types";
import type { Prisma } from "@prisma/client";
import { Job, Queue, Worker } from "bullmq";
import { Bot, GrammyError } from "grammy";
import type Redis from "ioredis";
import { errorMappings } from "~/bot/helpers/error-mapping";
import { tokenToBotId } from "~/bot/helpers/token-to-id";
import type { Container } from "~/container";
import type { PrismaClientX } from "~/prisma";

const sendBroadcast = async (
  jobBot: Bot,
  post: Prisma.PostGetPayload<{
    select: {
      text: true;
      type: true;
      fileId: true;
      postOptions: true;
    };
  }>,
  chatId: number
) => {
  const { type, fileId, text, postOptions } = post;
  const opts = JSON.parse(postOptions as string);

  // eslint-disable-next-line no-constant-condition
  if (1) return jobBot.api.getChat(chatId);

  if (text) return jobBot.api.sendMessage(chatId, text, opts);
  if (!fileId)
    // TODO: fix very bad
    return jobBot.api.sendMessage(chatId, "broadcast.no_file_id", opts);
  if (type === "photo") return jobBot.api.sendPhoto(chatId, fileId, opts);
  if (type === "video") return jobBot.api.sendVideo(chatId, fileId, opts);
  if (type === "audio") return jobBot.api.sendAudio(chatId, fileId, opts);
  if (type === "document") return jobBot.api.sendDocument(chatId, fileId, opts);
  if (type === "sticker") return jobBot.api.sendSticker(chatId, fileId, opts);
  if (type === "animation")
    return jobBot.api.sendAnimation(chatId, fileId, opts);
  if (type === "voice") return jobBot.api.sendVoice(chatId, fileId, opts);
};

export type BroadcastData = {
  chatId: number;
  token: string;
  cursor: number;
  serialId: number;
  post: Prisma.PostGetPayload<{
    select: {
      text: true;
      type: true;
      fileId: true;
      postOptions: true;
    };
  }>;
};

const queueName = "broadcast";

export function createBroadcastQueue({ connection }: { connection: Redis }) {
  return new Queue<BroadcastData>(queueName, {
    connection,
  });
}

export function createBroadcastWorker({
  connection,
  prisma,
  handleError,
  container,
}: {
  connection: Redis;
  prisma: PrismaClientX;
  handleError: (job: Job<BroadcastData> | undefined, error: Error) => void;
  container: Container;
}) {
  return new Worker<BroadcastData>(
    queueName,
    async (job) => {
      const { token, chatId, post, serialId } = job.data;
      const botId = tokenToBotId(token);

      const jobBot = new Bot(token, {
        botInfo: { id: botId } as UserFromGetMe,
      });
      await sendBroadcast(jobBot, post, chatId)
        .catch(async (err: GrammyError) => {
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
            job.updateProgress({
              ok: false,
              chatId,
              serialId,
              errorDescription,
            });
          }
        })
        .then(async () => {
          job.updateProgress({
            ok: true,
            chatId,
            serialId,
          });
        });
    },
    {
      connection,
      concurrency: 10,
    }
  ).on("failed", handleError);
  // .on(
  //   "progress",
  //   (job: Job<BroadcastData, unknown, string>, progress: object | number) => {
  //     if (!job) return;
  //     const { chatId, serialId } = job.data;
  //     container.logger.info(
  //       `Broadcast job progress ${JSON.stringify(progress)}`,
  //       { chatId }
  //     );
  //   }
  // );
}
