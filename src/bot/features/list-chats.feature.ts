/* eslint-disable no-await-in-loop */
import { Composer } from "grammy";
import { Context } from "../context";
import { escapeHTML } from "../helpers/escape-html";
import { logHandle } from "../helpers/logging";

const composer = new Composer<Context>();
const feature = composer.chatType(["group", "supergroup"]);

feature.command(["l", "list"], logHandle("handle /list"), async (ctx) => {
  const botId = ctx.me.id;

  const list = await ctx.prisma.list.findMany({
    where: {
      botId,
    },
    include: {
      chat: {
        select: {
          name: true,
          username: true,
          link: true,
        },
      },
    },
  });

  if (!list.length) return ctx.reply(ctx.t("list.empty"));
  let m = "";
  for (let i = 0; i < list.length; i += 1) {
    const item = list[i];
    const { chat } = item;
    const username = chat.username ? `- @${chat.username}` : "";
    const name = chat.link
      ? `<a href="${chat.link}">${escapeHTML(chat.name || "null")}</a>`
      : chat.name;
    m += `‎${item.index}. ${name} ${username}\n`;
  }

  await ctx.reply(m, { disable_web_page_preview: true });
});

export { composer as listChatsFeature };
