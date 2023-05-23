import { FlowProducer } from "bullmq";
import { Composer } from "grammy";
import type { Context } from "~/bot/context";
import { logHandle } from "~/bot/helpers/logging";

const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.command("broadcast", logHandle("command-broadcast"), async (ctx) => {
  const postId = parseInt(ctx.match, 10);
  const post = await ctx.prisma.post.findFirst({
    where: ctx.prisma.post.byPostId(postId),
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

  const { redis } = ctx.container;

  const { token } = await ctx.prisma.bot.findUniqueOrThrow({
    where: ctx.prisma.bot.byBotId(ctx.me.id),
    select: { token: true },
  });

  const chats = await ctx.prisma.botChat.findMany({
    where: { botId: ctx.me.id, ...ctx.prisma.botChat.canSend() },
    orderBy: {
      id: "asc",
    },
  });

  const children = chats.map((chat) => {
    return {
      name: `broadcast:${ctx.me.username}:${chat.chatId}`,
      data: {
        botInfo: ctx.me,
        chatId: Number(chat.chatId),
        serialId: chat.id,
        token,
        post, // TODO: all jobs in a flow have same post so make it in one place and make jobs able to access it to save memory
      },
      queueName: "broadcast",
    };
  });
  const broadcastFlow = new FlowProducer({ connection: redis });
  broadcastFlow.add({
    name: `broadcast-flow:@${ctx.me.username}`,
    queueName: "broadcast-flows",
    children,
    data: {
      botInfo: ctx.me,
      chatId: Number(ctx.chat.id),
      token,
    },
    opts: {
      attempts: 1,
    },
  });
});

export { composer as broadcastFeature };
