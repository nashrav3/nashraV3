import { Composer } from "grammy";
import type { Context } from "~/bot/context";
import { logHandle } from "~/bot/helpers/logging";

const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.on(
  "msg:forward_date",
  logHandle("forwarded-createpost"),
  async (ctx) => {
    const newPost = await ctx.prisma.post.create({
      data: {
        chatId: ctx.from.id,
        botId: ctx.me.id,
        text: ctx.message.text,
        entities: JSON.stringify(ctx.message.entities),
        replyMarkup: JSON.stringify(ctx.message.reply_markup),
        mediaGroupId: ctx.message.media_group_id,
        animation: ctx.message.animation?.file_id,
        audio: ctx.message.audio?.file_id,
        document: ctx.message.document?.file_id,
        photo: ctx.message?.photo?.[0].file_id,
        sticker: ctx.message.sticker?.file_id,
        video: ctx.message.video?.file_id,
        videoNote: ctx.message.video_note?.file_id,
        voice: ctx.message.voice?.file_id,
        caption: ctx.message.caption,
        captionEntities: JSON.stringify(ctx.message.caption_entities),
        hasMediaSpoiler: ctx.message.has_media_spoiler,
        dice: ctx.message.dice?.emoji,
        game: JSON.stringify(ctx.message.game),
        poll: JSON.stringify(ctx.message.poll),
        venue: JSON.stringify(ctx.message.venue),
        location: JSON.stringify(ctx.message.location),
      },
    });
    await ctx.reply(`/p ${newPost.postId} created`);
  }
);

feature.command("createpost", logHandle("command-createpost"), async (ctx) => {
  await ctx.conversation.enter("create-post");
});

export { composer as createPostFeature };
