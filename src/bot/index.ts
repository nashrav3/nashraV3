import { autoChatAction } from "@grammyjs/auto-chat-action";
import { conversations } from "@grammyjs/conversations";
import { hydrate } from "@grammyjs/hydrate";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";
import { BotConfig, StorageAdapter, Bot as TelegramBot } from "grammy";
import { Context, createContextConstructor } from "~/bot/context";
import { createPostConversation } from "~/bot/conversations";
import {
  addBotFeature,
  broadcastFeature,
  createPostFeature,
  languageFeature,
  previewPostFeature,
  unhandledFeature,
  welcomeFeature,
} from "~/bot/features";
import { errorHandler } from "~/bot/handlers";
import { isMultipleLocales } from "~/bot/i18n";
import {
  abdoIgnoreOld,
  i18n,
  metrics,
  session,
  setScope,
  updateLogger,
} from "~/bot/middlewares";
import type { Container } from "~/container";

type Dependencies = {
  container: Container;
  sessionStorage: StorageAdapter<unknown>;
};

export const createBot = (
  token: string,
  { container, sessionStorage }: Dependencies,
  botConfig?: Omit<BotConfig<Context>, "ContextConstructor">
) => {
  const { config } = container;
  const bot = new TelegramBot(token, {
    ...botConfig,
    ContextConstructor: createContextConstructor(container),
  });

  // Middlewares

  bot.api.config.use(parseMode("HTML"));

  if (config.isDev) {
    bot.use(updateLogger());
  }
  bot.use(abdoIgnoreOld());
  bot.use(setScope());
  bot.use(metrics());
  bot.use(autoChatAction(bot.api));
  bot.use(hydrateReply);
  bot.use(hydrate());
  bot.use(session(sessionStorage));
  bot.use(i18n());
  bot.use(conversations());
  bot.use(createPostConversation(container));

  // Handlers

  bot.use(welcomeFeature);
  bot.use(addBotFeature);
  bot.use(previewPostFeature);
  bot.use(createPostFeature);
  bot.use(broadcastFeature);
  if (isMultipleLocales) {
    bot.use(languageFeature);
  }

  bot.use(unhandledFeature);

  if (config.isDev) {
    bot.catch(errorHandler);
  }

  return bot;
};

export type Bot = ReturnType<typeof createBot>;
