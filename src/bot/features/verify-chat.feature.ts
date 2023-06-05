import { Composer } from "grammy";
import type { Context } from "~/bot/context";
import { logHandle } from "~/bot/helpers/logging";

const composer = new Composer<Context>();

const feature = composer.chatType("supergroup");
feature.command("v", logHandle("command-verify"), async (ctx) => {
  const botId = ctx.me.id;
  const { queues } = ctx.container;
  const chats = await ctx.prisma.botChat.findMany({
    where: ctx.prisma.botChat.byBotIdNotPvOrGroup(botId),
    include: {
      chat: { select: { username: true } },
    },
  });
  const { token } = await ctx.prisma.bot.findUniqueOrThrow({
    where: ctx.prisma.bot.byBotId(botId),
    select: { token: true },
  });
  const statusMessage = await ctx.reply(ctx.t("please-wait"));
  chats.forEach((chat) => {
    queues.verifyChat.add(
      `verifyChat:${ctx.me.username}:${chat.chatId}`,
      {
        chatId: Number(chat.chatId),
        token,
        statusMessageId: statusMessage.message_id,
        statusMessageChatId: statusMessage.chat.id,
        doneCount: chats.indexOf(chat) + 1,
        totalCount: chats.length,
        username: chat.chat.username ? `@${chat.chat.username}` : undefined,
      },
      {
        delay: 100 * chats.indexOf(chat),
      }
    );
  });
});

export { composer as verifyChatFeature };
