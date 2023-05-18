import { Middleware } from "grammy";
import type { Context } from "~/bot/context";

export const setScope = (): Middleware<Context> => async (ctx, next) => {
  if (ctx.from?.is_bot === false) {
    const { id: chatId, language_code: languageCode } = ctx.from;

    ctx.scope.chat = await ctx.prisma.chat.upsert({
      where: ctx.prisma.chat.byChatId(chatId),
      create: {
        chatId,
        chatType: "private",
        languageCode,
      },
      update: {},
      select: {
        chatId: true,
        languageCode: true,
        ...ctx.prisma.chat.withRoles(),
      },
    });
  }

  return next();
};
