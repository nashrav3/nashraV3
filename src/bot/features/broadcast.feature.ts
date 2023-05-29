import { chatAction } from "@grammyjs/auto-chat-action";
import { FlowChildJob, FlowProducer } from "bullmq";
import { Composer } from "grammy";
import type { Context } from "~/bot/context";
import { logHandle } from "~/bot/helpers/logging";
import { BroadcastFlowsData } from "~/queues";

const composer = new Composer<Context>();
const feature = composer.chatType("private");
let noMore = false;
feature.command(
  "broadcast",
  logHandle("command-broadcast"),
  chatAction("typing"),
  async (ctx) => {
    const { id: botId, username: botUsername } = ctx.me;
    const postNumber = parseInt(ctx.match, 10);
    const post = await ctx.prisma.post.findFirst({
      where: ctx.prisma.post.byPostNumber(postNumber, botId),
      select: ctx.prisma.post.postSelectValues(),
    });
    if (!post) return ctx.reply(ctx.t("post_not_found"));
    const { redis } = ctx.container;
    const batchSize = 20;

    const { token } = await ctx.prisma.bot.findUniqueOrThrow({
      where: ctx.prisma.bot.byBotId(botId),
      select: { token: true },
    });
    if (noMore) return ctx.reply(ctx.t("no_more_broadcasts"));
    noMore = true;
    ctx.reply(ctx.t("please-wait"));
    const chats = await ctx.prisma.botChat.findMany({
      where: { botId, ...ctx.prisma.botChat.canSend() },
      orderBy: {
        id: "asc",
      },
      take: batchSize,
    });
    const cursor = chats[batchSize - 1].id;

    const children = chats.map((chat) => {
      return {
        name: `BC:${botUsername}:${chat.chatId}`,
        data: {
          chatId: Number(chat.chatId),
          token,
          serialId: chat.id,
          cursor,
          batchSize,
          post: {
            // to remove unnecesary null values in job data
            text: post.text ? post.text : undefined,
            fileId: post.fileId ? post.fileId : undefined,
            postOptions: post.postOptions ? post.postOptions : undefined,
          }, // TODO: all jobs in a flow have same post so make it in one place and make jobs able to access it to save memory
        },
        queueName: "broadcast",
      } satisfies FlowChildJob;
    });
    const broadcastFlow = new FlowProducer({ connection: redis });
    broadcastFlow.add({
      name: `BC-flow:@${botUsername}`,
      queueName: "broadcast-flows",
      children,
      data: {
        botInfo: ctx.me,
        chatId: Number(ctx.chat.id),
        token,
        post,
        batchSize,
        cursor,
        step: 0,
      } satisfies BroadcastFlowsData,
      opts: {
        jobId: `B${botId}`,
        attempts: 1000,
      },
    });
  }
);

export { composer as broadcastFeature };
