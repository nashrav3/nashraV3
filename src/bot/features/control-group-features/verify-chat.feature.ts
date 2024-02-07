import { Composer } from "grammy";
import type { Context } from "~/bot/context";
import { logHandle } from "~/bot/helpers/logging";

const composer = new Composer<Context>();

const feature = composer.chatType("supergroup");
feature.command("v", logHandle("command-verify"), async (ctx) => {
  const botId = ctx.me.id;
  const { queues } = ctx.container;
  const chats = await ctx.prisma.list.findMany({
    where: {
      botId,
    },
    include: {
      chat: { select: { username: true } },
    },
  });
  const { token } = await ctx.prisma.bot.findUniqueOrThrow({
    where: ctx.prisma.bot.byBotId(botId),
    select: { token: true },
  });
  const statusMessage = await ctx.reply(ctx.t("please-wait"));
  for (let index = 0; index < chats.length; index += 1) {
    const chat = chats[index];
    queues.verifyChat.add(
      `verifyChat:${ctx.me.username}:${chat.chatId}`,
      {
        chatId: Number(chat.chatId),
        token,
        languageCode: ctx.scope.chat?.languageCode || undefined,
        statusMessageId: statusMessage.message_id,
        statusMessageChatId: statusMessage.chat.id,
        doneCount: index + 1,
        totalCount: chats.length,
        username: chat.chat.username ? `@${chat.chat.username}` : undefined,
      },
      {
        delay: 200 * index,
      },
    );
  }
});

export { composer as verifyChatFeature };
