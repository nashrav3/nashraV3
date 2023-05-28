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
    limiter: {
      groupKey: "token",
    },
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

      if (job.data.cursor === job.data.serialId) {
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
        const newCursor = chats[job.data.batchSize - 1].id;
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
              delay: 50 * chats.indexOf(chat),
              parent: {
                id: String(botId),
                queue: "bull:broadcast-flows",
              },
            }
          );
        });
      }

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
      limiter: {
        max: 21,
        duration: 1000,
        groupKey: "token",
      },
      concurrency: 10,
    }
  ).on("failed", handleError);
}
