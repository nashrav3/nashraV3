import { MenuTemplate } from "grammy-inline-menu";
import { Context } from "../../context";
import { escapeHTML } from "../../helpers/escape-html";

export const addBotMenu = new MenuTemplate<Context>((ctx) => {
  if (!ctx.from) throw new Error("!!!!!");
  return {
    text: `Hey ${escapeHTML(ctx.from.first_name)}!`,
    parse_mode: "HTML",
  };
});
