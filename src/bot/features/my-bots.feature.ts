import { Composer } from "grammy";
import { MenuMiddleware, MenuTemplate } from "grammy-inline-menu";
import { Context } from "../context";
import { addBotMenu } from "../menus/add-bot/add-bot.menu";
import { myBotsMenu } from "../menus/my-bots/my-bots.menu";

// TODO: seperate these menus into files in /menus

export const composer = new Composer<Context>();
const feature = composer.chatType("private");
// TODO:make botmaker only capable of doing this
// .filter(
//   (ctx) =>
//     ctx.local.bot?.type === "USER_OWNED_MAKER" ||
//     ctx.local.bot?.type === "OWNER_OWNED_MAKER"
// );

const startMenu = new MenuTemplate<Context>((ctx) => {
  if (!ctx.from) throw new Error("!!!!!");
  return `Hey ${ctx.from.first_name}!`;
});

// const addBotMenu = new MenuTemplate<Context>((ctx) => {
//   if (!ctx.from) throw new Error("!!!!!");
//   return {
//     text: `Hey ${escapeHTML(ctx.from.first_name)}!`,
//     parse_mode: "HTML",
//   };
// });

// const myBotsMenu = new MenuTemplate<Context>(async (ctx) => {
//   if (!ctx.from) throw new Error("!!!!!");
//   return {
//     text: ctx.t(`my_bots.bots_count`, {
//       botsCount: await ctx.prisma.botChat.count({
//         where: {
//           chatId: ctx.from.id,
//           role: "OWNER",
//         },
//       }),
//     }),
//     parse_mode: "HTML",
//   };
// });

// const botMenu = new MenuTemplate<Context>(
//   (ctx) => `You chose city ${ctx.match}`
// );

// const broadcastOptionsMenu = new MenuTemplate<Context>((ctx) =>
//   ctx.t(`broadcast_menu.messageText`)
// );

// const groupSettingsMenu = new MenuTemplate<Context>(async (ctx) => {
//   const { group: groupId } = await ctx.prisma.bot.findUniqueOrThrow({
//     where: ctx.prisma.bot.byBotId(ctx.me.id),
//   });
//   // try {
//   if (groupId) {
//     const adminsGroup = (await ctx.api.getChat(Number(groupId))) as Extract<
//       ChatFromGetChat,
//       { type: "supergroup" }
//     >;
//     if (adminsGroup) {
//       const { title, invite_link: inviteLink, username } = adminsGroup;
//       return {
//         text: ctx.t(`set_group.messageTextWithGroupInfo`, {
//           title: escapeHTML(title),
//           username: username || "not-provided",
//           inviteLink: inviteLink || "not-provided",
//         }),
//         parse_mode: "HTML",
//       };
//     }
//   }
//   return ctx.t(`set_group.messageText`);
//   // } catch (e: unknown) {
//   //   if (e.description === "Bad Request: chat not found") {
//   //     await chatsService.disconnectAdminsGroup(
//   //       Number(ctx.local.bot?.groupId),
//   //       Number(ctx.match?.[1])
//   //     );
//   //   }
//   //   return ctx.t(`set_group.messageText`);
//   // }
// });

const confirmDeleteGroupMenu = new MenuTemplate<Context>((ctx) =>
  ctx.t(`set_group.confirm_delete_messageText`),
);

const groupDeletedSuccessfullyMenu = new MenuTemplate<Context>((ctx) =>
  ctx.t(`set_group.group_deleted_successfully_messageText`),
);

// const botDeletedSuccessfullyMenu = new MenuTemplate<Context>((ctx) =>
//   ctx.t(`delete_bot.bot_deleted_successfully_messageText`)
// );

// const repliesMenu = new MenuTemplate<Context>((ctx) =>
//   ctx.t(`replies.messageText`)
// );

// const forceSubMenu = new MenuTemplate<Context>((ctx) =>
//   ctx.t(`forceSubMenu.messageText`)
// );

// const forceSubGroupMenu = new MenuTemplate<Context>((ctx) =>
//   ctx.t(`forceSubGroupMenu.messageText`)
// );

// const forceSubChannelMenu = new MenuTemplate<Context>((ctx) =>
//   ctx.t(`forceSubChannelMenu.messageText`)
// );

// const forceSubChannelsMenu = new MenuTemplate<Context>((ctx) =>
//   ctx.t(`forceSubChannelsMenu.messageText`)
// );

// start menu start
startMenu.submenu((ctx) => ctx.t(`start_menu.add_bot`), "addbot", addBotMenu);

startMenu.submenu((ctx) => ctx.t(`start_menu.my_bots`), "bots", myBotsMenu, {
  joinLastRow: true,
});

// start menu end

// my botsMenu start
// myBotsMenu.chooseIntoSubmenu(
//   "B",
//   async (ctx) => {
//     if (!ctx.from) throw new Error("!!!!!");
//     const { bots } = await ctx.prisma.chat.findUniqueOrThrow({
//       where: ctx.prisma.chat.byChatId(ctx.from.id),
//       include: {
//         bots: {
//           where: {
//             role: "OWNER",
//           },
//           include: {
//             bot: true,
//           },
//         },
//       },
//     });
//     return (
//       bots.reduce((acc, bot) => {
//         return { ...acc, [String(bot.botId)]: `@${bot.bot.username}` };
//       }, {}) || []
//     );
//   },
//   botMenu,
//   {
//     columns: 2,
//   }
// );

// myBotsMenu.submenu((ctx) => ctx.t(`start_menu.add_bot`), "addbot", addBotMenu, {
//   hide: async (ctx) => {
//     if (!ctx.from) throw new Error("!!!!!");
//     const count = await ctx.prisma.botChat.count({
//       where: {
//         chatId: ctx.from.id,
//         role: "OWNER",
//       },
//     });
//     return count !== 0;
//   },
// });
// mybotsmenu end

// bot menu start
// botMenu.interact((ctx) => ctx.t("bot_menu.stats"), "stats", {
//   do: async (ctx) => {
//     await ctx.answerCallbackQuery("not implemented yet");
//     return false;
//   },
// });

// botMenu.submenu(
//   (ctx) => ctx.t("bot_menu.broadcast"),
//   "broadcast",
//   broadcastOptionsMenu,
//   {
//     joinLastRow: true,
//   }
// );

// botMenu.submenu(
//   (ctx) => ctx.t("bot_menu.group_settings"),
//   "group",
//   groupSettingsMenu
// );

// // botMenu.submenu((ctx) => ctx.t(`bot_menu.replies`), "replies", repliesMenu, {
// //   joinLastRow: true,
// // });

// // botMenu.submenu(
// //   (ctx) => ctx.t(`bot_menu.force_subscribe`),
// //   "f_sub",
// //   forceSubMenu
// // );
// botMenu.submenu(
//   (ctx) => ctx.t("bot_menu.delete_bot"),
//   "delete",
//   confirmDeleteBotMenu
// );

// botMenu.manualRow(
//   createBackMainMenuButtons(
//     (ctx) => ctx.t(`bot_menu.back`),
//     (ctx) => ctx.t(`bot_menu.mainMenu`)
//   )
// );
// bot menu end

// // repliesMenu start
// repliesMenu.url(
//   (ctx) => ctx.t("replies.set_reply"),
//   (ctx) =>
//     `https://t.me/${
//       ctx.local.user?.botsOwned.filter(
//         (bot) => ctx.match && bot.botId.toString() === ctx.match[1]
//       )[0].username
//     }?start=set_reply`
// );

// repliesMenu.manualRow(
//   createBackMainMenuButtons(
//     (ctx) => ctx.t(`bot_menu.back`),
//     (ctx) => ctx.t(`bot_menu.mainMenu`)
//   )
// );
// // replies menu end

// broadcast options menu start

// // broadcast options menu end

// group Settings menu  start

// groupSettingsMenu.url(
//   (ctx) => ctx.t(`set_group.how_to_set`),
//   (ctx) => ctx.t(`set_group.how_to_set_url`)
// );

// groupSettingsMenu.url(
//   (ctx) => ctx.t(`set_group.how_to_change`),
//   (ctx) => ctx.t(`set_group.how_to_change_url`),
//   {
//     joinLastRow: true,
//   }
// );

// // groupSettingsMenu.submenu(
// //   (ctx) => ctx.t(`set_group.delete`),
// //   "delete",
// //   confirmDeleteGroupMenu,
// //   {
// //     hide: async (ctx) => !(await extractGroupId(ctx)),
// //   }
// // );

// // groupSettingsMenu.manualRow(
// //   createBackMainMenuButtons(
// //     (ctx) => ctx.t(`bot_menu.back`),
// //     (ctx) => ctx.t(`bot_menu.mainMenu`)
// //   )
// // );
// group Settings menu end
// force sub menu start

// forceSubMenu.submenu(
//   (ctx) => ctx.t("force_sub_channel.add_channel"),
//   "addC",
//   forceSubChannelsMenu
// );

// forceSubMenu.submenu(
//   (ctx) => ctx.t("force_sub_group.add_group"),
//   "addG",
//   forceSubGroupMenu
// );

// forceSubMenu.manualRow(
//   createBackMainMenuButtons(
//     (ctx) => ctx.t(`bot_menu.back`),
//     (ctx) => ctx.t(`bot_menu.mainMenu`)
//   )
// );

// force sub menu end

// forceSubChannelsMenu start

// forceSubChannelsMenu.chooseIntoSubmenu(
//   "C",
//   async (ctx) => {
//     const bot = await botsService.findBotChannels(Number(ctx.match?.[1]));
//     return (
//       bot?.botChats
//         .sort((a, b) => {
//           // eslint-disable-next-line no-unused-expressions, no-nested-ternary
//           return a.forceSub === b.forceSub ? 0 : a.forceSub ? -1 : 1;
//         })
//         .reduce((acc, botChat) => {
//           return {
//             ...acc,
//             [String(botChat.chatId)]: `${botChat.forceSub ? "🔳" : "◼️"} ${
//               botChat.chat.title
//             }`,
//           };
//         }, {}) || []
//     );
//   },
//   forceSubChannelMenu,
//   {
//     columns: 1,
//   }
// );

// forceSubChannelsMenu.manualRow(
//   createBackMainMenuButtons(
//     (ctx) => ctx.t(`bot_menu.back`),
//     (ctx) => ctx.t(`bot_menu.mainMenu`)
//   )
// );
// forceSubChannelsMenu end

// forceSubChannelMenu start

// forceSubChannelMenu.interact(
//   (ctx) => ctx.t("foce_sub_channel_menu.add_to_force_sub"),
//   "add",
//   {
//     do: async (ctx) => {
//       const x = await ctx.api
//         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//         .getChatAdministrators(ctx.match![2])
//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//         .then(async (administrators) => {
//           await botsService.updateForceSub(
//             // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//             Number(ctx.match![1]),
//             // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//             Number(ctx.match![2]),
//             true
//           );
//           return "..";
//         })
//         .catch(async (err) => {
//           await ctx.answerCallbackQuery("bot is not admin");
//           await botsService.updateBotChatStatus(
//             // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//             Number(ctx.match![1]),
//             // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//             Number(ctx.match![2]),
//             "left"
//           );
//           return "..";
//         });
//       return x;
//       // const bot = await botsService.findBotChannels(Number(ctx.match?.[1]));
//       // ctx.answerCallbackQuery();
//     },
//     hide: async (ctx) => {
//       const forceSub = await botsService.botForceSub(
//         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//         Number(ctx.match![1]),
//         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//         Number(ctx.match![2])
//       );
//       return !!forceSub?.botChats[0].forceSub;
//     },
//   }
// );

// forceSubChannelMenu.interact(
//   (ctx) => ctx.t("foce_sub_channel_menu.del_from_force_sub"),
//   "del",
//   {
//     do: async (ctx) => {
//       await botsService.updateForceSub(
//         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//         Number(ctx.match![1]),
//         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//         Number(ctx.match![2]),
//         false
//       );
//       await ctx.answerCallbackQuery("removed successfully");
//       return "..";
//     },
//     hide: async (ctx) => {
//       const forceSub = await botsService.botForceSub(
//         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//         Number(ctx.match![1]),
//         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//         Number(ctx.match![2])
//       );
//       return !forceSub?.botChats[0].forceSub;
//     },
//   }
// );

// forceSubChannelMenu.manualRow(
//   createBackMainMenuButtons(
//     (ctx) => ctx.t(`bot_menu.back`),
//     (ctx) => ctx.t(`bot_menu.mainMenu`)
//   )
// );

// forceSubChannelMenu end

// confirm delete group menu start

confirmDeleteGroupMenu.submenu(
  (ctx) => ctx.t(`set_group.confirm_delete_group_yes`),
  "yes",
  groupDeletedSuccessfullyMenu,
);

confirmDeleteGroupMenu.interact(
  (ctx) => ctx.t(`set_group.confirm_delete_group_no`),
  "no",
  {
    do: async (ctx) => {
      await ctx.answerCallbackQuery("not implemented yet");
      return "..";
    },
  },
);
// confirm delete group menu end

// groupDeletedSuccessfullyMenu start

// groupDeletedSuccessfullyMenu.interact(
//   async (ctx) => {
//     const groupId = await extractGroupId(ctx);
//     if (Number(groupId) < -100)
//       // cause Number(null) = 0 and group id is always -bigNumber
//       await chatsService.disconnectAdminsGroup(
//         Number(ctx.local.bot?.groupId),
//         Number(ctx.match?.[1])
//       );
//     return ctx.t(`bot_menu.mainMenu`);
//   },
//   "back",
//   {
//     do: () => {
//       return "/";
//     },
//   }
// );

// groupDeletedSuccessfullyMenu end

// botDeletedSuccessfullyMenu start

// botDeletedSuccessfullyMenu.interact(
//   async (ctx) => {
//     await botsService.makeBotNotActive(Number(ctx.match?.[1])); // TODO: when bot is not active make it not answer any updates, when token is sent make it active again
//     return ctx.t(`bot_menu.mainMenu`);
//   },
//   "back",
//   {
//     do: () => {
//       return "/";
//     },
//   }
// );
// botDeletedSuccessfullyMenu end

// confirmDeleteBotMenu.submenu(
//   (ctx) => {
//     return ctx.t(`delete_bot.confirm_delete_bot_yes`);
//   },
//   "yes",
//   botDeletedSuccessfullyMenu
// );

// confirmDeleteBotMenu.interact(
//   (ctx) => ctx.t(`delete_bot.confirm_delete_bot_no`),
//   "no",
//   {
//     do: async (ctx) => {
//       await ctx.answerCallbackQuery("not implemented yet");
//       return "..";
//     },
//   }
// );

const menuMiddleware = new MenuMiddleware("/", startMenu);
feature.command("start", (ctx) => menuMiddleware.replyToContext(ctx));
feature.use(menuMiddleware);
// eslint-disable-next-line no-console
console.log(menuMiddleware.tree());

export { composer as myBotsFeature };
