import { UserFromGetMe } from "@grammyjs/types";
import { Bot } from "grammy";
import { tokenToBotId } from "./token-to-id";

export const getBotChat = (token: string, chatId: number) => {
  const botId = tokenToBotId(token);

  const tempBot = new Bot(token, {
    botInfo: { id: botId } as UserFromGetMe,
  });
  return tempBot.api.getChat(chatId);
};
