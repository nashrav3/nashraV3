import { UserFromGetMe } from "@grammyjs/types";
import { Job, Queue, Worker } from "bullmq";
import { Bot, GrammyError } from "grammy";
import type Redis from "ioredis";
import { errorMappings } from "~/bot/helpers/error-mapping";
import { groupErrors } from "~/bot/helpers/group-errors";
import { progressBar } from "~/bot/helpers/progress-bar";
import { getRandomEmojiString } from "~/bot/helpers/random-emojis";
import { getShortError } from "~/bot/helpers/short-error";
import { tokenToBotId } from "~/bot/helpers/token-to-id";
import { i18n } from "~/bot/i18n";
import type { Container } from "~/container";
import type { PrismaClientX } from "~/prisma";

const sendBroadcast = (jobBot: Bot, chatId: number | string) => {
  return jobBot.api.getChat(chatId);
};
type progressData = {
  ok: boolean;
  chatId: number;
  shortError?: string;
  isAdmin?: boolean;
};
type verifyChatData = {
  chatId?: number;
  username?: string;
  token: string;
  languageCode?: string;
  totalCount: number;
  doneCount: number;
  statusMessageId: number;
  statusMessageChatId: number;
}; // & ({ chatId: number } | { username: string });

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
        where: prisma.botChat.byBotIdChatId(botId, chatId || 0),
      };
      const idOrUsername = chatId ?? username;
      if (!idOrUsername) throw new Error("chatId or username is required");

      await sendBroadcast(jobBot, idOrUsername)
        .catch(async (err: GrammyError) => {
          const errorDescription = err.description;
          const specificData = errorMappings[errorDescription];
          const shortError = getShortError(errorDescription);
          if (specificData && commonData.where.botId_chatId.chatId !== 0) {
            await prisma.botChat.update({
              ...commonData,
              data: specificData,
            });
          }
          await job.updateProgress({
            ok: false,
            chatId,
            shortError,
          });
        })
        .then(async (chat) => {
          if (!chat || chat.type === "private" || chat.type === "group") return;
          commonData.where.botId_chatId.chatId = chat.id; // mutate chatid from 0 to actual chat id if username was provided TODO: fix
          await job.update({
            ...job.data,
            chatId: chat.id,
          });
          await prisma.chat.update({
            where: {
              chatId: chat.id,
            },
            data: {
              chatType: chat.type,
              username: chat.username,
              name: chat.title,
              link: chat.invite_link,
            },
          });
          if (chat.type === "channel") {
            try {
              const administrators = await jobBot.api.getChatAdministrators(
                chat.id
              );
              const isAdmin = administrators.some(
                (admin) =>
                  admin.user.id === botId &&
                  admin.status === "administrator" &&
                  admin.can_post_messages &&
                  admin.can_invite_users
              );

              if (!isAdmin) {
                await prisma.botChat.update({
                  ...commonData,
                  data: {
                    needAdminRights: true,
                  },
                });
                await job.updateProgress({
                  ok: false,
                  chatId,
                  shortError: "need_admin_rights",
                });
              } else {
                await prisma.botChat.update({
                  ...commonData,
                  data: {
                    needAdminRights: false,
                  },
                });
                await prisma.list.upsert({
                  where: {
                    chatId_botId: {
                      chatId: chat.id,
                      botId,
                    },
                  },
                  create: {
                    chatId: chat.id,
                    botId,
                  },
                  update: {},
                });
              }
            } catch (e) {
              if (e instanceof GrammyError) {
                switch (e.error_code) {
                  case 400:
                    await prisma.botChat.update({
                      ...commonData,
                      data: {
                        needAdminRights: true,
                      },
                    });
                    break;
                  default:
                    console.error(e);
                }
              }
            }
          }
          await job.updateProgress({
            ok: true,
            chatId: chat.id,
          });
          await prisma.chat.update({
            where: {
              chatId: chat.id,
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
          languageCode,
          statusMessageId,
          statusMessageChatId,
          username,
          chatId,
        } = job.data;
        const botId = tokenToBotId(token);
        if (typeof progress !== "object") return;
        if (myProgress.shortError) {
          const key = `${botId}:${statusMessageChatId}:${statusMessageId}`;
          await container.redis.setnx(key, "");
          await container.redis.expire(key, 1000);
          await container.redis.append(
            key,
            `\n${myProgress.shortError}=${username || chatId}`
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
          // TODO: when prodcast is done make the message Done
          const statusMessageText = i18n.t(
            languageCode || "en",
            "verify-chat.progress",
            {
              doneCount,
              totalCount,
              errors, // TODO: make error translations
              pb,
              emojis: getRandomEmojiString(),
            }
          );

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
