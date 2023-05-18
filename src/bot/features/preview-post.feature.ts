import { chatAction } from "@grammyjs/auto-chat-action";
import { MessageEntity } from "@grammyjs/types";
import { Composer, InlineKeyboard } from "grammy";
import type { Context } from "~/bot/context";
import { logHandle } from "../helpers/logging";

const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.command(
  ["preview", "p"],
  logHandle("preview-post"),
  chatAction("typing"),
  async (ctx) => {
    const postId = parseInt(ctx.match, 10);
    const post = await ctx.prisma.post.findFirst({
      where: {
        postId,
      },
    });
    if (!post) ctx.reply(ctx.t("post_not_found"));
    else {
      await ctx.reply(post.text || "not found", {
        parse_mode: undefined,
        reply_markup: post.replyMarkup as unknown as InlineKeyboard,
        entities: post.entities as unknown as MessageEntity[],
      });
    }
  }
);

export { composer as previewPostFeature };
