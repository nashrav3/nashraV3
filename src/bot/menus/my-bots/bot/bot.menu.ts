import { MenuTemplate, createBackMainMenuButtons } from "grammy-inline-menu";
import { Context } from "~/bot/context";
import { broadcastOptionsMenu } from "./broadcast-options/broadcast-options.menu";
import { confirmDeleteBotMenu } from "./confirm-delete-bot/confirm-delete-bot.menu";
import { groupSettingsMenu } from "./group-settings/group-settings.menu";

export const botMenu = new MenuTemplate<Context>(
  (ctx) => `You chose city ${ctx.match}`
);

botMenu.interact((ctx) => ctx.t("bot_menu.stats"), "stats", {
  do: async (ctx) => {
    await ctx.answerCallbackQuery("not implemented yet");
    return false;
  },
});

botMenu.submenu(
  (ctx) => ctx.t("bot_menu.broadcast"),
  "broadcast",
  broadcastOptionsMenu,
  {
    joinLastRow: true,
  }
);

botMenu.submenu(
  (ctx) => ctx.t("bot_menu.group_settings"),
  "group",
  groupSettingsMenu
);

// botMenu.submenu((ctx) => ctx.t(`bot_menu.replies`), "replies", repliesMenu, {
//   joinLastRow: true,
// });

// botMenu.submenu(
//   (ctx) => ctx.t(`bot_menu.force_subscribe`),
//   "f_sub",
//   forceSubMenu
// );
botMenu.submenu(
  (ctx) => ctx.t("bot_menu.delete_bot"),
  "delete",
  confirmDeleteBotMenu
);

botMenu.manualRow(
  createBackMainMenuButtons(
    (ctx) => ctx.t(`bot_menu.back`),
    (ctx) => ctx.t(`bot_menu.mainMenu`)
  )
);
