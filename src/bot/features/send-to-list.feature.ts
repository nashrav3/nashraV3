import { chatAction } from "@grammyjs/auto-chat-action";
import { FlowChildJob, FlowJob, FlowProducer } from "bullmq";
import { ms } from "enhanced-ms";
import { Composer } from "grammy";
import type { Context } from "~/bot/context";
import { logHandle } from "~/bot/helpers/logging";
import { config } from "~/config";
import { ListFlowData } from "~/queues/list-flow.queue";

const composer = new Composer<Context>();
const feature = composer.chatType(["supergroup", "group"]);
feature.command(
  ["s", "send"],
  logHandle("command-send"),
  chatAction("typing"),
  async (ctx) => {
    const { id: botId, username: botUsername } = ctx.me;

    const matchResult = ctx.message.text.match(
      /\s+(?<postNumber>\d+)(?=(?:.*\bat\s+(?<sendAt>\d+(?::\d+)?\s*\S+))?)(?=(?:.*\bfor\s+(?<duration>\d+\s*\S+))?)(?=(?:.*\bafter\s+(?<after>\d+\s*\S+))?)(?=(?:.*\buntil\s+(?<until>\d+(?::\d+)?\s*\S+))?)/i
    );
    if (matchResult === null || !matchResult.groups?.postNumber) return; // TODO: reply with error message

    const postNumber = Number(matchResult.groups.postNumber);
    const sendAt = matchResult.groups?.sendAt || 0;
    const after = matchResult.groups?.after || "";
    const duration = matchResult.groups?.duration || 0;
    const until = matchResult.groups?.until || 0;

    const delay = ms(after) ?? undefined;

    // if (delay && delay > config.MAX_DELAY)
    //   return ctx.reply(ctx.t("max-delay", { maxDelay: ms(config.MAX_DELAY) }));

    await ctx
      .reply(
        `post: ${postNumber}, sendAt: ${ms(sendAt)}, duration: ${ms(
          duration
        )}, until: ${ms(until)}, after: ${ms(after)}\n\n`
      )
      .catch((e) => ctx.reply(e));
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
    const existingFlow = await ctx.prisma.flow.findFirst({
      where: {
        jobId: `B${botId}P${post.postNumber}`,
      },
    });
    if (existingFlow) {
      if (!existingFlow.finished) {
        await ctx.reply(ctx.t("already-in-progress"));
      } else {
        await ctx.reply(ctx.t("already-sent"));
      }
      return;
    }

    const statusMessage = await ctx.reply(ctx.t("please-wait"));
    const totalCount = await ctx.prisma.list.count({
      where: { botId },
    });
    const chats = await ctx.prisma.list.findMany({
      where: { botId },
      orderBy: {
        id: "asc",
      },
      take: config.BATCH_SIZE,
    });
    const cursor = chats[chats.length - 1] ? chats[chats.length - 1].id : 0; // Use the last chat's ID as the new cursor

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
            postId: post.postId,
            text: post.text ? post.text : undefined,
            fileId: post.fileId ? post.fileId : undefined,
            postOptions: post.postOptions ? post.postOptions : undefined,
          }, // TODO: all jobs in a flow have same post so make it in one place and make jobs able to access it to save memory
        },
        opts: {
          delay,
        },
        queueName: "broadcast",
      } satisfies FlowChildJob;
    });
    const listFlow = new FlowProducer({ connection: redis });
    const flowMetadata = {
      name: `list-flow:@${botUsername}`,
      queueName: "list-flow",
      children,
      data: {
        botInfo: ctx.me,
        chatId: Number(ctx.chat.id),
        statusMessageId: statusMessage.message_id,
        languageCode: ctx.scope.chat?.languageCode || undefined,
        token,
        post,
        cursor,
        totalCount,
        doneCount: 0,
        step: 0,
      } satisfies ListFlowData,
      opts: {
        jobId: `B${botId}P${post.postNumber}`,
        attempts: 1000,
      },
    } satisfies FlowJob;

    listFlow.add(flowMetadata);

    await ctx.prisma.flow.create({
      data: {
        jobId: flowMetadata.opts.jobId,
        botId,
        postId: post.postId,
        statusMessageChatId: Number(ctx.chat.id),
        statusMessageId: flowMetadata.data.statusMessageId,
        name: flowMetadata.name,
        queueName: flowMetadata.queueName,
        childrenCount: flowMetadata.children.length,
      },
    });
  }
);

export { composer as sendToListFeature };
