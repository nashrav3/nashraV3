import { Conversation, createConversation } from "@grammyjs/conversations";
import { Context } from "~/bot/context";
import { i18n } from "~/bot/middlewares";
import { Container } from "~/container";

export const greetingConversation = (container: Container) =>
  createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      await conversation.run(i18n());

      await ctx.reply("Please send me your name");

      while (true) {
        ctx = await conversation.wait();

        if (ctx.has("message:text")) {
          ctx.chatAction = "typing";
          await conversation.sleep(1000);

          await ctx.reply(`Hello, ${ctx.message.text}!`);
        } else {
          await ctx.reply("Please send me your name");
        }
      }
    },
    "greeting"
  );
