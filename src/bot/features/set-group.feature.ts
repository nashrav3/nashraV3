import { Composer } from "grammy";
import { Context } from "../context";
import { escapeHTML } from "../helpers/escape-html";
import { logHandle } from "../helpers/logging";

const composer = new Composer<Context>();
const feature = composer.chatType(["group", "supergroup"]);

feature.command(
  ["set_group", "sg"],
  logHandle("handle /set_group"),
  async (ctx) => {
    await ctx.prisma.bot.update({
      where: ctx.prisma.bot.byBotId(ctx.me.id),
      data: {
        group: ctx.chat.id,
      },
    });
    await ctx.reply(
      ctx.t(`set-group.group-set-successfully`, {
        title: escapeHTML(ctx.chat.title),
      })
    );
  }
);

feature.on(
  [
    "message:group_chat_created",
    "message:supergroup_chat_created",
    "message:new_chat_members:me",
  ],
  logHandle("bot added to a group by admin"),
  async (ctx) => {
    await ctx.prisma.bot.update({
      where: ctx.prisma.bot.byBotId(ctx.me.id),
      data: {
        group: ctx.chat.id,
      },
    });
    await ctx.reply(
      ctx.t(`set_group.group_set_successfully`, {
        title: escapeHTML(ctx.chat.title),
      })
    );
  }
);

feature
  .on("my_chat_member")
  .filter(async (ctx) => {
    const { group } = await ctx.prisma.bot.findUniqueOrThrow({
      where: ctx.prisma.bot.byBotId(ctx.me.id),
      select: { group: true },
    });
    return (
      Number(group) === ctx.update.my_chat_member.chat.id &&
      ctx.update.my_chat_member.new_chat_member.status === "restricted" &&
      ctx.update.my_chat_member.new_chat_member.is_member === true &&
      ctx.update.my_chat_member.new_chat_member.can_send_messages === false
    );
  })
  .use(async (ctx) => {
    const title = escapeHTML(ctx.update.my_chat_member.chat.title);
    const firstName = escapeHTML(ctx.update.my_chat_member.from.first_name);
    ctx.leaveChat();
    const owner = await ctx.prisma.botChat.findFirst({
      where: { botId: ctx.me.id, role: "OWNER" },
      include: { chat: true },
    });
    // eslint-disable-next-line no-console
    if (!owner) return console.error(`ERR: wtf no owner`);
    ctx.api.sendMessage(
      Number(owner.chat.chatId),
      ctx.t("set_group.bot_restricted_from_adminsGroup", {
        title,
        firstName,
      })
    );
  });

export { composer as setGroupFeature };
