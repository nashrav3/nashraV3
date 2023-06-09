import { MenuTemplate } from "grammy-inline-menu";
import { Context } from "../../context";
import { addBotMenu } from "../add-bot/add-bot.menu";
import { botMenu } from "./bot/bot.menu";

export const myBotsMenu = new MenuTemplate<Context>(async (ctx) => {
  if (!ctx.from) throw new Error("!!!!!");
  return {
    text: ctx.t(`my_bots.bots_count`, {
      botsCount: await ctx.prisma.botChat.count({
        where: {
          chatId: ctx.from.id,
          role: "OWNER",
        },
      }),
    }),
    parse_mode: "HTML",
  };
});

myBotsMenu.chooseIntoSubmenu(
  "B",
  async (ctx) => {
    if (!ctx.from) throw new Error("!!!!!");
    const { bots } = await ctx.prisma.chat.findUniqueOrThrow({
      where: ctx.prisma.chat.byChatId(ctx.from.id),
      include: {
        bots: {
          where: {
            role: "OWNER",
          },
          include: {
            bot: true,
          },
        },
      },
    });
    return (
      bots.reduce((acc, bot) => {
        return { ...acc, [String(bot.botId)]: `@${bot.bot.username}` };
      }, {}) || []
    );
  },
  botMenu,
  {
    columns: 2,
  }
);

myBotsMenu.submenu((ctx) => ctx.t(`start_menu.add_bot`), "addbot", addBotMenu, {
  hide: async (ctx) => {
    if (!ctx.from) throw new Error("!!!!!");
    const count = await ctx.prisma.botChat.count({
      where: {
        chatId: ctx.from.id,
        role: "OWNER",
      },
    });
    return count !== 0;
  },
});
