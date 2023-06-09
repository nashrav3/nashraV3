import { MenuTemplate } from "grammy-inline-menu";
import { Context } from "~/bot/context";

export const botDeletedSuccessfullyMenu = new MenuTemplate<Context>((ctx) =>
  ctx.t(`delete_bot.bot_deleted_successfully_messageText`)
);
