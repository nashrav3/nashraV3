import { chatAction } from "@grammyjs/auto-chat-action";
import { Composer } from "grammy";
import type { Context } from "~/bot/context";
import { logHandle } from "../helpers/logging";

const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.command(
  ["preview", "p"],
  logHandle("preview-post"),
  chatAction("typing"),
  async (ctx) => {
    const postNumber = Number.parseInt(ctx.match, 10);
    const post = await ctx.prisma.post.findFirst({
      where: {
        botId: ctx.me.id,
        postNumber,
      },
    });
    if (!post) return ctx.reply(ctx.t("post_not_found"));

    const { type, fileId, text } = post;
    const postOptions = JSON.parse(post.postOptions as string);

    if (postOptions) postOptions.parse_mode = undefined;
    if (type === "text" && text) return ctx.reply(text, postOptions);
    if (typeof fileId !== "string") throw new Error(`WTF fileId not a string`);
    if (type === "photo") return ctx.replyWithPhoto(fileId, postOptions);
    if (type === "video") return ctx.replyWithVideo(fileId, postOptions);
    if (type === "audio") return ctx.replyWithAudio(fileId, postOptions);
    if (type === "document") return ctx.replyWithDocument(fileId, postOptions);
    if (type === "sticker") return ctx.replyWithSticker(fileId, postOptions);
    if (type === "animation")
      return ctx.replyWithAnimation(fileId, postOptions);
    if (type === "voice") return ctx.replyWithVoice(fileId, postOptions);
  },
);

export { composer as previewPostFeature };
