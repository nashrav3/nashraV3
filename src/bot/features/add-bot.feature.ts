import { chatAction } from "@grammyjs/auto-chat-action";
import { Bot, Composer } from "grammy";
import type { Context } from "~/bot/context";
import { config } from "~/config";
import { logHandle } from "../helpers/logging";

const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.hears(
  /\d{5,15}:[\w-]{30,40}/,
  logHandle("handle-token"),
  chatAction("typing"),
  async (ctx) => {
    const token = ctx.match[0];
    const bot = new Bot(token);
    await bot
      .init()
      .catch(async () => {
        await ctx.reply(ctx.t("add-bot.invalid-token"));
      })
      .then(async () => {
        await bot.api.deleteWebhook();
        await bot.api.setWebhook(`${config.WEBHOOK_URL}/${token}`, {
          allowed_updates: config.BOT_ALLOWED_UPDATES,
        });
      });

    const databaseBot = await ctx.prisma.bot.upsert({
      where: ctx.prisma.bot.byBotId(bot.botInfo.id),
      create: ctx.prisma.bot.createNewBotInput(bot.botInfo, ctx.from.id, token),
      update: ctx.prisma.bot.updateBotInput(bot.botInfo, ctx.from.id, token),
    });
    await (databaseBot.isNew
      ? ctx.reply(
          ctx.t("add-bot.new-bot-added", {
            firstName: bot.botInfo.first_name,
            username: bot.botInfo.username,
          }),
        )
      : ctx.reply(
          ctx.t("add-bot.bot-updated", {
            firstName: bot.botInfo.first_name,
            username: bot.botInfo.username,
          }),
        ));
  },
);

export { composer as addBotFeature };
