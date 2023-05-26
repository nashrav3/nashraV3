import { Middleware } from "grammy";
import type { Context } from "~/bot/context";

export const setScope = (): Middleware<Context> => async (ctx, next) => {
  if (ctx.from?.is_bot === false && ctx.chat) {
    const { language_code: languageCode } = ctx.from;
    const { type: chatType, id: chatId } = ctx.chat;
    const { id: botId } = ctx.me;
    const name = chatType === "private" ? ctx.chat.first_name : ctx.chat.title;
    ctx.scope.chat = await ctx.prisma.chat.upsert({
      where: {
        chatId,
      },
      create: {
        chatId,
        chatType,
        name,
        languageCode,
        bots: {
          create: {
            botId,
            botBlocked: false,
            deactivated: false,
            notFound: false,
            notMember: false,
          },
        },
      },
      update: {
        chatId,
        name,
        languageCode,
        bots: {
          upsert: {
            where: {
              botId_chatId: {
                botId,
                chatId,
              },
            },
            create: {
              botId,
              botBlocked: false,
              deactivated: false,
              notFound: false,
              notMember: false,
            },
            update: {
              botBlocked: false,
              deactivated: false,
              notFound: false,
              notMember: false,
            },
          },
        },
      },
      select: {
        chatId: true,
        name: true,
        languageCode: true,
        // ...ctx.prisma.chat.withRoles(),
      },
    });
  }

  return next();
};
