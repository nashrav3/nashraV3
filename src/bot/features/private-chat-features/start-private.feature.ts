import { Composer } from "grammy";
import type { Context } from "~/bot/context";
import { logHandle } from "~/bot/helpers/logging";
import { startPrivateKeyboard } from "~/bot/keyboards";

const composer = new Composer<Context>();
const feature = composer.chatType("private");

feature.command("start", logHandle("command-start-private"), async (ctx) => {
  ctx.reply(ctx.t("start-private.text"), {
    reply_markup: await startPrivateKeyboard(ctx),
  });
});
export { composer as startPrivateFeature };
