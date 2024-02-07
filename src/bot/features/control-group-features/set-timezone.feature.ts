/* eslint-disable no-await-in-loop */
import { Composer } from "grammy";
import { Context } from "../../context.js";
import { logHandle } from "../../helpers/logging.js";

const composer = new Composer<Context>();
const feature = composer.chatType(["group", "supergroup"]);

feature.command(
  ["st", "setTimezone"],
  logHandle("handle /setTimezone"),
  async (ctx) => {
    const _timezone = ctx.match.trim();
  },
);

export { composer as setTimezoneFeature };
