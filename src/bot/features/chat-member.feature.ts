import { Composer, matchFilter } from "grammy";
import type { Context } from "~/bot/context";
import { logHandle } from "../helpers/logging";

const composer = new Composer<Context>();

const feature = composer.chatType(["channel", "group", "supergroup"]);

feature.on(
  ":left_chat_member:me",
  logHandle("left_chat_member me update handle"),
  async (ctx) => {
    const { id: botId } = ctx.me;
    const { id: chatId } = ctx.chat;
    await ctx.prisma.botChat.update({
      where: ctx.prisma.botChat.byBotIdChatId(botId, chatId),
      data: {
        botKicked: true,
      },
    });
  }
);

feature
  .filter(matchFilter("my_chat_member"))
  .filter(
    (ctx) =>
      ctx.update.my_chat_member.new_chat_member.status === "administrator"
  )
  .use(logHandle("chat_member bot admin status update handle"))
  .branch(
    (ctx) =>
      ctx.update.my_chat_member.new_chat_member.status === "administrator" &&
      ctx.update.my_chat_member.new_chat_member.can_post_messages === false,
    async (ctx) => {
      const { id: botId } = ctx.me;
      const { id: chatId } = ctx.chat;
      const isInList = await ctx.prisma.list.findUnique({
        where: ctx.prisma.list.byChatIdBotId(chatId, botId),
      });

      const { chat } = isInList
        ? await ctx.prisma.botChat.update({
            where: ctx.prisma.botChat.byBotIdChatId(botId, chatId),
            data: ctx.prisma.botChat.removeFromListNeedAdminRights(
              chatId,
              botId
            ),
            include: {
              chat: true,
            },
          })
        : await ctx.prisma.botChat.update({
            where: ctx.prisma.botChat.byBotIdChatId(botId, chatId),
            data: {
              needAdminRights: true,
            },
            include: {
              chat: true,
            },
          });
      const b = await ctx.prisma.bot.findUnique({
        where: { botId },
      });
      if (!b || isInList) return;
      await ctx.api.sendMessage(
        Number(b.group),
        ctx.t("chat-member.bot-can-not-post", {
          name: chat.name || "",
          link: chat.link || "",
          username: chat.username || "",
        })
      );
    },
    async (ctx) => {
      const { id: botId } = ctx.me;
      const { id: chatId } = ctx.chat;
      const { chat } = await ctx.prisma.botChat.update({
        where: ctx.prisma.botChat.byBotIdChatId(botId, chatId),
        data: {
          needAdminRights: false,
        },
        include: {
          chat: true,
        },
      });
      const { group } = await ctx.prisma.bot.findUniqueOrThrow({
        where: { botId },
      });
      if (!group) return;
      await ctx.api.sendMessage(
        Number(group),
        ctx.t("chat-member.bot-can-post", {
          name: chat.name || "",
          link: chat.link || "",
          username: chat.username || "",
        })
        // `the bot have been un-restricted from posting messages to ${botChat.chat.name} \n ${botChat.chat.link}\n ${botChat.chat.username}\n do you want to add it again to the list?`
      );
    }
  );

export { composer as chatMemberFeature };
