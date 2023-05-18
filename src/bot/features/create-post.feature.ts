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
      },
    });
    await ctx.reply(`/p ${newPost.postId} created`);
  }
);

feature.command("createpost", logHandle("command-createpost"), async (ctx) => {
  await ctx.conversation.enter("create-post");
});

export { composer as createPostFeature };
