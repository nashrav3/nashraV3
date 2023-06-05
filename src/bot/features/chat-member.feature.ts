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
      ctx.update.my_chat_member.new_chat_member.can_post_messages === true,
    async (ctx) => {
      const { id: botId } = ctx.me;
      const { id: chatId } = ctx.chat;
      await ctx.prisma.botChat.update({
        where: ctx.prisma.botChat.byBotIdChatId(botId, chatId),
        data: {
          needAdminRights: true,
        },
      });
    },
    async (ctx) => {
      const { id: botId } = ctx.me;
      const { id: chatId } = ctx.chat;
      await ctx.prisma.botChat.update({
        where: ctx.prisma.botChat.byBotIdChatId(botId, chatId),
        data: {
          needAdminRights: false,
        },
      });
    }
  );

export { composer as chatMemberFeature };
