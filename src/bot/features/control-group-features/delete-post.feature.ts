import { chatAction } from "@grammyjs/auto-chat-action";
import { ms } from "enhanced-ms";
import { Composer } from "grammy";
import type { Context } from "~/bot/context";
import { logHandle } from "~/bot/helpers/logging";

const composer = new Composer<Context>();
const feature = composer.chatType(["supergroup", "group"]);
feature.command(
  ["del", "delete"],
  logHandle("command-del"),
  chatAction("typing"),
  async (ctx) => {
    const { id: botId, username: botUsername } = ctx.me;

    const matchResult = ctx.message.text.match(
      /\s+(?<postNumber>\d+)(?=(?:.*\bat\s+(?<at>\d+(?::\d+)?\s*\S+))?)(?=(?:.*\bfor\s+(?<duration>\d+\s*\S+))?)(?=(?:.*\bafter\s+(?<after>\d+\s*\S+))?)(?=(?:.*\buntil\s+(?<until>\d+(?::\d+)?\s*\S+))?)/i,
    );
    if (matchResult === null || !matchResult.groups?.postNumber) return; // TODO: reply with error message

    const postNumber = Number(matchResult.groups.postNumber);
    const at = matchResult.groups?.at || 0;
    const after = matchResult.groups?.after || "";
    const duration = matchResult.groups?.duration || 0;
    const until = matchResult.groups?.until || 0;

    const delay = ms(after) ?? undefined;

    await ctx
      .reply(
        `post: ${postNumber}, at: ${ms(at)}, duration: ${ms(
          duration,
        )}, until: ${ms(until)}, after: ${ms(after)}\n\n`,
      )
      .catch((error) => ctx.reply(error));

    const { token } = await ctx.prisma.bot.findUniqueOrThrow({
      where: ctx.prisma.bot.byBotId(botId),
      select: { token: true },
    });

    const statusMessage = await ctx.reply(ctx.t("please-wait"));

    const chats = await ctx.prisma.sent.findMany({
      where: {
        botId,
        post: {
          postNumber,
        },
      },
      orderBy: {
        id: "asc",
      },
    });
    await ctx.prisma.flow.deleteMany({
      where: {
        jobId: `B${botId}P${postNumber}`,
      },
    });
    await ctx.container.queues.delete.addBulk(
      chats.map((chat, index) => {
        return {
          name: `del:${botUsername}:${chat.chatId}`,
          data: {
            chatId: Number(chat.chatId),
            messageId: chat.messageId,
            statusMessageId: statusMessage.message_id,
            doneCount: index + 1,
            totalCount: chats.length,
            token,
            languageCode: ctx.scope.chat?.languageCode || undefined,
          },
          opts: {
            delay: delay ? delay + index * 200 : index * 200,
          },
        };
      }),
    );
  },
);

export { composer as deleteFeature };
