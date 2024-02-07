/* eslint-disable no-await-in-loop */
import { Composer } from "grammy";
import { Context } from "../../context";
import { escapeHTML } from "../../helpers/escape-html";
import { logHandle } from "../../helpers/logging";

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

  if (list.length === 0) return ctx.reply(ctx.t("list.empty"));

  const m = list
    .map(({ index, chat }) => {
      const { username, link, name } = chat;
      const formattedName = link
        ? `<a href="${link}">${escapeHTML(name || "null")}</a>`
        : name;
      const formattedUsername = username ? `- @${username}` : "";
      return `‎${index}. ${formattedName} ${formattedUsername}`;
    })
    .join("\n");

  await ctx.reply(m, { link_preview_options: { is_disabled: true } });
});

export { composer as listChatsFeature };
