import { Composer } from "grammy";
import type { Context } from "~/bot/context";
import { logHandle } from "~/bot/helpers/logging";

const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.command("start", logHandle("command-start"), async (ctx) => {
  const { queues } = ctx.container;
  const chats = await ctx.prisma.botChat.findMany({
    where: { botId: ctx.me.id },
  });
  const { token } = await ctx.prisma.bot.findUniqueOrThrow({
    where: ctx.prisma.bot.byBotId(ctx.me.id),
    select: { token: true },
  });

  chats.forEach((chat) => {
    queues.greeting.add(`chatActionTyping:${ctx.me.username}:${chat.chatId}`, {
      botInfo: ctx.me,
      chatId: chat.chatId.toString(),
      token,
    });
  });
});

export { composer as welcomeFeature };
