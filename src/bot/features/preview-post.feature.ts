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
    if (!post) return ctx.reply(ctx.t("post_not_found"));

    const {
      text,
      photo,
      video,
      audio,
      voice,
      animation,
      document,
      sticker,
      hasMediaSpoiler,
      caption,
      captionEntities,
      replyMarkup,
      entities,
    } = post;

    const replyOptions = {
      parse_mode: undefined,
      reply_markup: replyMarkup as unknown as InlineKeyboard,
      entities: entities as unknown as MessageEntity[],
      caption: caption || undefined,
      caption_entities: captionEntities as unknown as MessageEntity[],
      has_spoiler: hasMediaSpoiler || undefined,
    };

    if (text) return ctx.reply(text, replyOptions);
    if (photo) return ctx.replyWithPhoto(photo, replyOptions);
    if (video) return ctx.replyWithVideo(video, replyOptions);
    if (audio) return ctx.replyWithAudio(audio, replyOptions);
    if (document) return ctx.replyWithDocument(document, replyOptions);
    if (sticker) return ctx.replyWithSticker(sticker, replyOptions);
    if (animation) return ctx.replyWithAnimation(animation, replyOptions);
    if (voice) return ctx.replyWithVoice(voice, replyOptions);
  }
);

export { composer as previewPostFeature };
