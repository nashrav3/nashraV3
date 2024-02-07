import {
  ForceReply,
  InlineKeyboardMarkup,
  MessageEntity,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
} from "@grammyjs/types";
import { PostType, Prisma } from "@prisma/client";
import { Composer } from "grammy";
import type { Context } from "~/bot/context";
import { logHandle } from "~/bot/helpers/logging";

interface PostOptions {
  reply_markup?:
    | InlineKeyboardMarkup
    | ReplyKeyboardMarkup
    | ReplyKeyboardRemove
    | ForceReply;
  caption?: string;
  caption_entities?: MessageEntity[];
  entities?: MessageEntity[];
  has_spoiler?: boolean;
}

const composer = new Composer<Context>();
const feature = composer.chatType("private");

feature.on(
  "msg:forward_origin",
  logHandle("forwarded-createpost"),
  async (ctx) => {
    const { msg, me, prisma } = ctx;
    if (msg.media_group_id)
      return ctx.reply(ctx.t(`create-post.not-supported`));

    let fileId: string | undefined;
    const postType: PostType | undefined = [
      "animation",
      "audio",
      "document",
      "photo",
      "sticker",
      "video",
      "video_note",
      "voice",
      "text",
    ].find((type) => type in msg) as PostType | undefined;

    if (!postType) return ctx.reply(ctx.t(`create-post.not-supported`));

    if (postType === "photo") fileId = msg.photo?.[0].file_id;
    else if (postType === "text") fileId = undefined;
    else fileId = msg[postType]?.file_id;

    const postOptions: PostOptions = {};
    if (msg.reply_markup) postOptions.reply_markup = msg.reply_markup;
    if (msg.caption) postOptions.caption = msg.caption;
    if (msg.caption_entities)
      postOptions.caption_entities = msg.caption_entities;
    const { id: botId } = me;

    if (msg.entities) postOptions.entities = msg.entities;
    if (msg.has_media_spoiler) postOptions.has_spoiler = true;

    const postData: Prisma.Without<
      Prisma.PostCreateInput,
      Prisma.PostUncheckedCreateInput
    > &
      Prisma.PostUncheckedCreateInput = {
      postNumber: 0,
      chatId: ctx.from.id,
      botId,
      type: postType,
      postOptions: JSON.stringify(postOptions),
    };
    if (msg.text) postData.text = msg.text;
    if (fileId) postData.fileId = fileId;
    const { media_group_id: mediaGroupId } = msg;
    if (mediaGroupId) postData.mediaGroupId = mediaGroupId;

    const newPost = await prisma.$transaction(
      async (tx) => {
        const bot = await tx.bot.update({
          where: {
            botId,
          },
          data: {
            postNumberCounter: {
              increment: 1,
            },
          },
        });

        const newPostNumber = bot.postNumberCounter;
        const post = await tx.post.create({
          data: {
            ...postData,
            postNumber: newPostNumber,
          },
          // {
          //   chatId: ctx.from.id,
          //   postNumber: newPostNumber,
          //   botId: ctx.me.id,
          //   type: postType,
          //   text: ctx.message.text,
          //   fileId,
          //   mediaGroupId: ctx.message.media_group_id,
          //   postOptions: JSON.stringify(postOptions),
          // }
        });
        return post;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    return newPost
      ? ctx.reply(`<code>/p ${newPost.postNumber}</code> created`)
      : ctx.reply("Error");
  },
);

feature.command("createpost", logHandle("command-createpost"), async (ctx) => {
  await ctx.conversation.enter("create-post");
});

export { composer as createPostFeature };
