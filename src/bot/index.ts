import { autoChatAction } from "@grammyjs/auto-chat-action";
import { conversations } from "@grammyjs/conversations";
import { hydrate } from "@grammyjs/hydrate";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";
import { BotConfig, StorageAdapter, Bot as TelegramBot } from "grammy";
import { Context, createContextConstructor } from "~/bot/context";
import { createPostConversation } from "~/bot/conversations";
import {
  addBotFeature,
  addChannelFeature,
  broadcastFeature,
  chatMemberFeature,
  createPostFeature,
  languageFeature,
  listChatsFeature,
  myBotsFeature,
  previewPostFeature,
  removeChannelFeature,
  sendToListFeature,
  setGroupFeature,
  statsFeature,
  unhandledFeature,
  verifyChatFeature,
} from "~/bot/features";
import { errorHandler } from "~/bot/handlers";
import { isMultipleLocales } from "~/bot/i18n";
import {
  abdoIgnoreOld,
  i18n,
  session,
  setScope,
  updateLogger,
} from "~/bot/middlewares";
import type { Container } from "~/container";
import { deleteFeature } from "./features/delete-post.feature";

type Dependencies = {
  container: Container;
  sessionStorage: StorageAdapter<unknown>;
};

export const createBot = (
  token: string,
  { container, sessionStorage }: Dependencies,
  botConfig?: Omit<BotConfig<Context>, "ContextConstructor">,
) => {
  const { config } = container;
  const bot = new TelegramBot(token, {
    ...botConfig,
    ContextConstructor: createContextConstructor(container),
  });

  const protectedBot = bot.errorBoundary(errorHandler);
  // Middlewares
  bot.api.config.use(parseMode("HTML"));
  if (config.isDev) {
    protectedBot.use(updateLogger());
  }
  protectedBot.use(abdoIgnoreOld());
  protectedBot.use(setScope());
  protectedBot.use(autoChatAction(bot.api));
  protectedBot.use(hydrateReply);
  protectedBot.use(hydrate());
  protectedBot.use(session(sessionStorage));
  protectedBot.use(i18n());
  protectedBot.use(conversations());
  protectedBot.use(createPostConversation(container));

  // Handlers

  protectedBot.use(verifyChatFeature);
  protectedBot.use(addBotFeature);
  protectedBot.use(previewPostFeature);
  protectedBot.use(createPostFeature);
  protectedBot.use(addChannelFeature);
  protectedBot.use(removeChannelFeature);
  protectedBot.use(listChatsFeature);
  protectedBot.use(myBotsFeature);
  protectedBot.use(broadcastFeature);
  protectedBot.use(deleteFeature);
  protectedBot.use(sendToListFeature);
  protectedBot.use(statsFeature);
  if (isMultipleLocales) {
    protectedBot.use(languageFeature);
  }
  protectedBot.use(chatMemberFeature);
  protectedBot.use(setGroupFeature);

  // must be the last handler
  protectedBot.use(unhandledFeature);

  return bot;
};

export type Bot = ReturnType<typeof createBot>;
