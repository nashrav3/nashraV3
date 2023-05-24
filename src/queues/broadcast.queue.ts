import { MessageEntity, UserFromGetMe } from "@grammyjs/types";
import type { Prisma } from "@prisma/client";
import { Job, Queue, Worker } from "bullmq";
import { Bot, GrammyError, InlineKeyboard } from "grammy";
import type Redis from "ioredis";
import type { Container } from "~/container";
import type { PrismaClientX } from "~/prisma";

export const sendBroadcast = async (
  jobBot: Bot,
  post: Prisma.PostGetPayload<{
    select: {
      text: true;
      photo: true;
      video: true;
      audio: true;
      voice: true;
      animation: true;
      document: true;
      sticker: true;
      hasMediaSpoiler: true;
      caption: true;
      captionEntities: true;
      replyMarkup: true;
      entities: true;
    };
  }>,
  chatId: number
) => {
  const {
    text,
    photo,
    video,
    audio,
    voice,
    animation,
    document,
    sticker,
    hasMediaSpoiler,
    caption,
    captionEntities,
    replyMarkup,
    entities,
  } = post;

  const replyOptions = {
    parse_mode: undefined,
    reply_markup: replyMarkup as unknown as InlineKeyboard,
    entities: entities as unknown as MessageEntity[],
    caption: caption || undefined,
    caption_entities: captionEntities as unknown as MessageEntity[],
    has_spoiler: hasMediaSpoiler || undefined,
  };
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
  botInfo: UserFromGetMe;
  chatId: number;
  serialId: number;
  cursor: number;
  batchSize: number;
  token: string;
  post: Prisma.PostGetPayload<{
    select: {
      text: true;
      photo: true;
      video: true;
      audio: true;
      voice: true;
      animation: true;
      document: true;
      sticker: true;
      hasMediaSpoiler: true;
      caption: true;
      captionEntities: true;
      replyMarkup: true;
      entities: true;
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
      const {
        token,
        chatId,
        post,
        botInfo: { id: botId },
      } = job.data;
      const jobBot = new Bot(token, { botInfo: job.data.botInfo });
      await sendBroadcast(jobBot, post, chatId).catch(
        async (err: GrammyError) => {
          const commonData = {
            where: prisma.botChat.byBotIdChatId(botId, chatId),
          };

          const errorMappings: Record<string, { [key: string]: boolean }> = {
            "Forbidden: user is deactivated": { deactivated: true },
            "Forbidden: bot was blocked by the user": { botBlocked: true },
            "Bad Request: chat not found": { notFound: true },
            "Forbidden: bot is not a member of the channel chat": {
              notMember: true,
            },
            "Bad Request: need administrator rights in the channel chat": {
              needAdminRights: true,
            },
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
      // limiter: {
      //   max: 1,
      //   duration: 3000,
      //   groupKey: "token",
      // },
      concurrency: 30,
    }
  ).on("failed", handleError);
}
