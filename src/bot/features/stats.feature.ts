import { chatAction } from "@grammyjs/auto-chat-action";
import { Composer } from "grammy";
import type { Context } from "~/bot/context";
import { isPremiumBot } from "../helpers/compare-datetime";
import { escapeHTML } from "../helpers/escape-html";
import { logHandle } from "../helpers/logging";

const composer = new Composer<Context>();

const feature = composer;

feature.command(
  ["stats", "st"],
  logHandle("stats"),
  chatAction("typing"),
  async (ctx) => {
    const { id: botId } = ctx.me;
    const usersCount = await ctx.prisma.botChat.count({
      where: {
        botId,
        chat: {
          chatType: "private",
        },
      },
    });
    const postsCount = await ctx.prisma.post.count({
      where: {
        botId,
      },
    });

    const channelsCount = await ctx.prisma.botChat.count({
      where: {
        botId,
        chat: {
          chatType: "channel",
        },
      },
    });
    const groupsCount = await ctx.prisma.botChat.count({
      where: {
        botId,
        chat: {
          chatType: "group",
        },
      },
    });
    const owner = await ctx.prisma.chat.findFirstOrThrow({
      where: {
        bots: {
          some: {
            botId,
            role: "OWNER",
          },
        },
      },
    });
    const postsInChannels = await ctx.prisma.sent.count({
      where: {
        botId,
        deleted: false,
      },
    });
    const listChannelsCount = await ctx.prisma.list.count({
      where: {
        botId,
      },
    });
    const {
      group: controlGroupId,
      expireAt,
      timezone,
    } = await ctx.prisma.bot.findUniqueOrThrow({
      where: {
        botId,
      },
    });
    const controlGroup = await ctx.prisma.chat.findUnique({
      where: {
        chatId: Number(controlGroupId),
      },
    });
    ctx.reply(
      ctx.t("stats.stats", {
        usersCount,
        postsCount,
        channelsCount,
        groupsCount,
        owner: `(@${owner.username}) <a href="tg://user?id=${
          owner.chatId
        }"> - ${escapeHTML(owner.name || "name")}</a>`,
        postsInChannels,
        listChannelsCount,
        controlGroup: `${controlGroup?.name} (${controlGroup?.username}) ${controlGroup?.link}`,
        isPremium: isPremiumBot(expireAt) ? "✅" : "⛔",
        expireAt: expireAt?.toLocaleString("en-GB", {
          timeZone: timezone || undefined,
        }),
      })
    );
  }
);

export { composer as statsFeature };
