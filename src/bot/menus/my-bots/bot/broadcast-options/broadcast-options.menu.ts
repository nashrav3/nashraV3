import { MenuTemplate, createBackMainMenuButtons } from "grammy-inline-menu";
import { Context } from "~/bot/context";

export const broadcastOptionsMenu = new MenuTemplate<Context>((ctx) =>
  ctx.t(`broadcast_menu.messageText`),
);

broadcastOptionsMenu.interact(
  (ctx) => ctx.t("broadcast_menu.send_to_all"),
  "s2a",
  {
    do: async (ctx) => {
      await ctx.answerCallbackQuery("not implemented yet");
      return false;
    },
  },
);

broadcastOptionsMenu.interact(
  (ctx) => ctx.t("broadcast_menu.forward_to_all"),
  "f2a",
  {
    do: async (ctx) => {
      await ctx.answerCallbackQuery("not implemented yet");
      return false;
    },
  },
);

broadcastOptionsMenu.toggle(
  (ctx) => ctx.t(`broadcast_menu.notify_users`),
  "notifyUsers",
  {
    isSet: (ctx) => !!ctx.session.broadcastNotifyUsers,
    set: (ctx, newState) => {
      ctx.session.broadcastNotifyUsers = newState;
      return true;
    },
  },
);
broadcastOptionsMenu.manualRow(
  createBackMainMenuButtons(
    (ctx) => ctx.t(`bot_menu.back`),
    (ctx) => ctx.t(`bot_menu.mainMenu`),
  ),
);
