import type { ChatFromGetChat } from "@grammyjs/types";
import { MenuTemplate, createBackMainMenuButtons } from "grammy-inline-menu";
import { Context } from "~/bot/context";
import { escapeHTML } from "~/bot/helpers/escape-html";
import { getBotChat } from "~/bot/helpers/get-bot-chat";

export const groupSettingsMenu = new MenuTemplate<Context>(async (ctx) => {
  if (!ctx.match) throw new Error("!!!!!!");
  const { group: groupId, token } = await ctx.prisma.bot.findUniqueOrThrow({
    where: ctx.prisma.bot.byBotId(Number(ctx.match[1])),
  });
  // try {
  if (groupId) {
    const adminsGroup = (await getBotChat(token, Number(groupId))) as Extract<
      ChatFromGetChat,
      { type: "supergroup" }
    >;
    if (adminsGroup) {
      const { title, invite_link: inviteLink, username } = adminsGroup;
      return {
        text: ctx.t(`set_group.messageTextWithGroupInfo`, {
          title: escapeHTML(title),
          username: username || "not-provided",
          inviteLink: inviteLink || "not-provided",
        }),
        parse_mode: "HTML",
      };
    }
  }
  return ctx.t(`set_group.messageText`);
  // } catch (e: unknown) {
  //   if (e.description === "Bad Request: chat not found") {
  //     await chatsService.disconnectAdminsGroup(
  //       Number(ctx.local.bot?.groupId),
  //       Number(ctx.match?.[1])
  //     );
  //   }
  //   return ctx.t(`set_group.messageText`);
  // }
});

groupSettingsMenu.url(
  (ctx) => ctx.t(`set_group.how_to_set`),
  (ctx) => ctx.t(`set_group.how_to_set_url`)
);

groupSettingsMenu.url(
  (ctx) => ctx.t(`set_group.how_to_change`),
  (ctx) => ctx.t(`set_group.how_to_change_url`),
  {
    joinLastRow: true,
  }
);

// groupSettingsMenu.submenu(
//   (ctx) => ctx.t(`set_group.delete`),
//   "delete",
//   confirmDeleteGroupMenu,
//   {
//     hide: async (ctx) => !(await extractGroupId(ctx)),
//   }
// );

groupSettingsMenu.manualRow(
  createBackMainMenuButtons(
    (ctx) => ctx.t(`bot_menu.back`),
    (ctx) => ctx.t(`bot_menu.mainMenu`)
  )
);
