/* eslint-disable no-await-in-loop */
import { Composer } from "grammy";
import { Context } from "../context";
import { logHandle } from "../helpers/logging";

const composer = new Composer<Context>();
const feature = composer.chatType(["group", "supergroup"]);

feature.command(
  ["st", "setTimezone"],
  logHandle("handle /setTimezone"),
  async (ctx) => {
    const timezone = ctx.match.trim();
  }
);

export { composer as setTimezoneFeature };
