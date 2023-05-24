import { Composer } from "grammy";
import type { Context } from "~/bot/context";
import { logHandle } from "../helpers/logging";

const composer = new Composer<Context>();

const feature = composer.chatType(["channel", "group", "supergroup"]);

feature.on(
  ":left_chat_member:me",
  logHandle("left_chat_member me update handle"),
  (ctx) => {
    const { id: botId } = ctx.me;
    const { id: chatId } = ctx.chat;
    ctx.prisma.botChat.update({
      where: ctx.prisma.botChat.byBotIdChatId(botId, chatId),
      data: {
        botKicked: true,
      },
    });
  }
);

export { composer as chatMemberFeature };
