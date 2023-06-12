/* eslint-disable no-await-in-loop */
import { Composer } from "grammy";
import { Context } from "../context";
import { logHandle } from "../helpers/logging";

const composer = new Composer<Context>();
const feature = composer.chatType(["group", "supergroup"]);

feature.command(["a", "add"], logHandle("handle /add"), async (ctx) => {
  const botId = ctx.me.id;
  const chatId = ctx.chat.id;
  const matches = [
    ...ctx.message.text.matchAll(
      /((?:https?:\/\/)?(?:t|telegram).(?:me|dog)\/|@)(?<username>(?!.*?[_]{2,})[a-zA-Z][a-zA-Z0-9_]{3,32})|(?<id>-\d{5,})/gi
    ),
  ];
  const chats = [
    ...new Set(
      matches.flatMap((match) =>
        [match.groups?.username, match.groups?.id].filter(Boolean)
      )
    ),
  ] as string[];
  const { queues } = ctx.container;
  const { token } = await ctx.prisma.bot.findUniqueOrThrow({
    where: ctx.prisma.bot.byBotId(botId),
    select: { token: true },
  });

  const statusMessage = await ctx.reply(ctx.t("please-wait"));
  chats.forEach((chat) => {
    queues.verifyChat.add(
      `verifyChat:${ctx.me.username}:${chat}`,
      {
        chatId: chat.startsWith("-") ? Number(chat) : undefined,
        token,
        languageCode: ctx.scope.chat?.languageCode || undefined,
        statusMessageId: statusMessage.message_id,
        statusMessageChatId: statusMessage.chat.id,
        doneCount: chats.indexOf(chat) + 1,
        totalCount: chats.length,
        username: !chat.startsWith("-") ? `@${chat}` : undefined,
      },
      {
        delay: 150 * chats.indexOf(chat),
      }
    );
  });
});
export { composer as addChannelFeature };
