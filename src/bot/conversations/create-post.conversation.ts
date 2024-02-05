import { Conversation, createConversation } from "@grammyjs/conversations";
import { Context } from "~/bot/context";
import { i18n } from "~/bot/middlewares";
import { Container } from "~/container";

export const createPostConversation = (_container: Container) =>
  createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      await conversation.run(i18n());

      await ctx.reply("Please send me your name");

      const conversationCtx = await conversation.wait();

      if (conversationCtx.has("message:text")) {
        conversationCtx.chatAction = "typing";
        await conversation.sleep(1000);

        await conversationCtx.reply(`Hello, ${conversationCtx.message.text}!`);
      } else {
        await conversationCtx.reply("Please send me your name");
      }
    },
    "create-post",
  );
