import { MenuTemplate } from "grammy-inline-menu";
import { Context } from "~/bot/context";
import { botDeletedSuccessfullyMenu } from "./bot-deleted-successfully/bot-deleted-successfully.menu";

export const confirmDeleteBotMenu = new MenuTemplate<Context>((ctx) =>
  ctx.t(`delete_bot.confirm_delete_messageText`)
);

confirmDeleteBotMenu.submenu(
  (ctx) => {
    return ctx.t(`delete_bot.confirm_delete_bot_yes`);
  },
  "yes",
  botDeletedSuccessfullyMenu
);

confirmDeleteBotMenu.interact(
  (ctx) => ctx.t(`delete_bot.confirm_delete_bot_no`),
  "no",
  {
    do: async (ctx) => {
      await ctx.answerCallbackQuery("not implemented yet");
      return "..";
    },
  }
);
