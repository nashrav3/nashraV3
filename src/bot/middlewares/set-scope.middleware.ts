import { Middleware } from "grammy";
import type { Context } from "~/bot/context";

export const setScope = (): Middleware<Context> => async (ctx, next) => {
  if (ctx.from?.is_bot === false && ctx.chat) {
    const { language_code: languageCode, username: _username } = ctx.from;
    const { type: chatType, id: chatId } = ctx.chat;
    const { id: botId } = ctx.me;

    let username;
    if (chatType === "private") username = _username;
    else if (chatType === ("channel" || "supergroup" || "group"))
      username = ctx.chat.username;

    const name = chatType === "private" ? ctx.chat.first_name : ctx.chat.title;

    ctx.scope.chat = await ctx.prisma.chat.upsert({
      where: {
        chatId,
      },
      create: {
        chatId,
        chatType,
        username,
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
        username,
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
      },
    });
  }

  return next();
};
