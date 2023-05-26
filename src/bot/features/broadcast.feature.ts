import { chatAction } from "@grammyjs/auto-chat-action";
import { FlowChildJob, FlowProducer } from "bullmq";
import { Composer } from "grammy";
import type { Context } from "~/bot/context";
import { logHandle } from "~/bot/helpers/logging";

const composer = new Composer<Context>();

const feature = composer.chatType("private");
let noMore = false;
feature.command(
  "broadcast",
  logHandle("command-broadcast"),
  chatAction("typing"),
  async (ctx) => {
    const postId = parseInt(ctx.match, 10);
    const post = await ctx.prisma.post.findFirst({
      where: ctx.prisma.post.byPostId(postId),
      select: ctx.prisma.post.postSelectValues(),
    });
    if (!post) return ctx.reply(ctx.t("post_not_found"));

    const { redis } = ctx.container;

    const { token } = await ctx.prisma.bot.findUniqueOrThrow({
      where: ctx.prisma.bot.byBotId(ctx.me.id),
      select: { token: true },
    });
    if (noMore) return ctx.reply(ctx.t("no_more_broadcasts"));
    noMore = true;
    ctx.reply(ctx.t("please-wait"));
    const chats = await ctx.prisma.botChat.findMany({
      where: { botId: ctx.me.id, ...ctx.prisma.botChat.canSend() },
      orderBy: {
        id: "desc",
      },
      take: 200_000,
    });

    const children = chats.map((chat) => {
      return {
        name: `BC:${ctx.me.username}:${chat.chatId}`,
        data: {
          chatId: Number(chat.chatId),
          token,
          post: {
            // to remove unnecesary null values in job data
            text: post.text ? post.text : undefined,
            fileId: post.fileId ? post.fileId : undefined,
            postOptions: post.postOptions ? post.postOptions : undefined,
          }, // TODO: all jobs in a flow have same post so make it in one place and make jobs able to access it to save memory
        },
        queueName: "broadcast",
        opts: {
          rateLimiterKey: "token",
        },
      } satisfies FlowChildJob;
    });
    const broadcastFlow = new FlowProducer({ connection: redis });
    broadcastFlow.add({
      name: `BC-flow:@${ctx.me.username}`,
      queueName: "broadcast-flows",
      children,
      data: {
        botInfo: ctx.me,
        chatId: Number(ctx.chat.id),
        token,
      },
    });
  }
);

export { composer as broadcastFeature };
