import { chatAction } from "@grammyjs/auto-chat-action";
import { FlowChildJob, FlowProducer } from "bullmq";
import { Composer } from "grammy";
import type { Context } from "~/bot/context";
import { logHandle } from "~/bot/helpers/logging";
import { config } from "~/config";
import { BroadcastFlowsData } from "~/queues";

const composer = new Composer<Context>();
const feature = composer;
feature.command(
  "broadcast",
  logHandle("command-broadcast"),
  chatAction("typing"),
  async (ctx) => {
    const { id: botId, username: botUsername } = ctx.me;
    const postNumber = Number.parseInt(ctx.match, 10);
    const post = await ctx.prisma.post.findFirst({
      where: ctx.prisma.post.byPostNumber(postNumber, botId),
      select: ctx.prisma.post.postSelectValues(),
    });
    if (!post) return ctx.reply(ctx.t("post_not_found"));
    const { redis } = ctx.container;

    const { token } = await ctx.prisma.bot.findUniqueOrThrow({
      where: ctx.prisma.bot.byBotId(botId),
      select: { token: true },
    });

    const statusMessage = await ctx.reply(ctx.t("please-wait"));
    const totalCount = await ctx.prisma.botChat.count({
      where: { botId, ...ctx.prisma.botChat.canSend() },
    });
    const chats = await ctx.prisma.botChat.findMany({
      where: { botId, ...ctx.prisma.botChat.canSend() },
      orderBy: {
        id: "asc",
      },
      take: config.BATCH_SIZE,
    });
    const lastChat = chats.at(-1);
    const cursor = lastChat ? lastChat.id : 0; // Use the last chat's ID as the new cursor

    const children = chats.map((chat) => {
      return {
        name: `BC:${botUsername}:${chat.chatId}`,
        data: {
          chatId: Number(chat.chatId),
          token,
          serialId: chat.id,
          cursor,
          post: {
            // to remove unnecesary null values in job data
            text: post.text ?? undefined,
            fileId: post.fileId ?? undefined,
            postOptions: post.postOptions ?? undefined,
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
        statusMessageId: statusMessage.message_id,
        token,
        post,
        cursor,
        totalCount,
        doneCount: 0,
        step: 0,
      } satisfies BroadcastFlowsData,
      opts: {
        jobId: `B${botId}`,
        attempts: 1000,
      },
    });
  },
);

export { composer as broadcastFeature };
