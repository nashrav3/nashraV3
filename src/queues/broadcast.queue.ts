import { UserFromGetMe } from "@grammyjs/types";
import type { Prisma } from "@prisma/client";
import { Job, Queue, Worker } from "bullmq";
import { Bot, GrammyError } from "grammy";
import type Redis from "ioredis";
import { errorMappings } from "~/bot/helpers/error-mapping";
import { tokenToBotId } from "~/bot/helpers/token-to-id";
import type { Container } from "~/container";
import type { PrismaClientX } from "~/prisma";

export const sendBroadcast = async (
  jobBot: Bot,
  post: Prisma.PostGetPayload<{
    select: {
      type: true;
      fileId: true;
      postOptions: true;
    };
  }>,
  chatId: number
) => {
  // const { type, fileId, text } = post;

  return jobBot.api.sendChatAction(chatId, "typing");
  // if (text) return jobBot.api.sendMessage(chatId, text, replyOptions);
  // if (photo) return jobBot.api.sendPhoto(chatId, photo, replyOptions);
  // if (video) return jobBot.api.sendVideo(chatId, video, replyOptions);
  // if (audio) return jobBot.api.sendAudio(chatId, audio, replyOptions);
  // if (document) return jobBot.api.sendDocument(chatId, document, replyOptions);
  // if (sticker) return jobBot.api.sendSticker(chatId, sticker, replyOptions);
  // if (animation)
  //   return jobBot.api.sendAnimation(chatId, animation, replyOptions);
  // if (voice) return jobBot.api.sendVoice(chatId, voice, replyOptions);
};

export type BroadcastData = {
  chatId: number;
  token: string;
  cursor: number;
  batchSize: number;
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
      const { token, chatId, post } = job.data;
      const botId = tokenToBotId(token);

      const jobBot = new Bot(token, {
        botInfo: { id: botId } as UserFromGetMe,
      });
      await sendBroadcast(jobBot, post, chatId).catch(
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
          } else throw err;
        }
      );
    },
    {
      connection,
      concurrency: 10,
    }
  ).on("failed", handleError);
}
