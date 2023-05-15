import { Composer } from "grammy";
import type { Context } from "~/bot/context";
import { logHandle } from "~/bot/helpers/logging";

const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.command("start", logHandle("command-start"), (ctx) => {
  const { queues } = ctx.container;

  return queues.greeting.add("welcome", {
    chatId: ctx.chat.id,
  });
});

export { composer as welcomeFeature };
