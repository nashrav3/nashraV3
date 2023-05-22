import { Composer } from "grammy";
import type { Context } from "~/bot/context";
import { logHandle } from "~/bot/helpers/logging";

const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.command("broadcast", logHandle("command-broadcast"), async (ctx) => {
  const postId = parseInt(ctx.match, 10);
  const post = await ctx.prisma.post.findFirst({
    where: {
      postId,
    },
    select: {
      text: true,
      photo: true,
      video: true,
      audio: true,
      voice: true,
      animation: true,
      document: true,
      sticker: true,
      hasMediaSpoiler: true,
      caption: true,
      captionEntities: true,
      replyMarkup: true,
      entities: true,
    },
  });
  if (!post) return ctx.reply(ctx.t("post_not_found"));

  const batchSize = 20;
  const { queues } = ctx.container;

  const chats = await ctx.prisma.botChat.findMany({
    take: batchSize,
    where: { botId: ctx.me.id },
    orderBy: {
      id: "asc",
    },
  });
  const cursor = chats[batchSize - 1].id;

  const { token } = await ctx.prisma.bot.findUniqueOrThrow({
    where: ctx.prisma.bot.byBotId(ctx.me.id),
    select: { token: true },
  });

  chats.forEach((chat) => {
    queues.broadcast.add(`chatActionTyping:${ctx.me.username}:${chat.chatId}`, {
      botInfo: ctx.me,
      chatId: Number(chat.chatId),
      serialId: chat.id,
      cursor,
      batchSize,
      token,
      post,
    });
  });
});

export { composer as broadcastFeature };
