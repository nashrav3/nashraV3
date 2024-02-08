import { Composer } from "grammy";
import type { Context } from "~/bot/context";
import { logHandle } from "~/bot/helpers/logging";
import { i18n } from "~/bot/i18n";
import { startPrivateKeyboard } from "~/bot/keyboards";

const composer = new Composer<Context>();
const feature = composer.chatType("private");
const createPostButtons = i18n.locales.map((locale) =>
  i18n.t(locale, "start-private-keyboard.create-post"),
);

feature.command("start", logHandle("command-start-private"), async (ctx) => {
  ctx.reply(ctx.t("start-private.text"), {
    reply_markup: await startPrivateKeyboard(ctx),
  });
});

feature.hears(
  [...createPostButtons],
  logHandle("text-start-private"),
  async (ctx) => {
    ctx.reply(ctx.t("start-private.create-post-button-reply"));
  },
);
export { composer as startPrivateFeature };
