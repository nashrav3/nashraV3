import { UserFromGetMe } from "@grammyjs/types";
import { Prisma } from "@prisma/client";
import { isNewBot } from "~/bot/helpers/compare-datetime";

export default Prisma.defineExtension({
  name: "bot",
  result: {
    bot: {
      isNew: {
        needs: {
          createdAt: true,
          updatedAt: true,
        },
        compute(bot) {
          return isNewBot(bot.createdAt, bot.updatedAt);
        },
      },
    },
  },
  model: {
    bot: {
      byBotId(botId: number) {
        return {
          botId,
        } satisfies Prisma.BotWhereInput;
      },
      createNewBotInput(botInfo: UserFromGetMe, chatId: number, token: string) {
        const { first_name: firstName, username, id: botId } = botInfo;
        return {
          botId,
          token,
          username,
          firstName,
          chats: {
            create: {
              chatId,
              role: "OWNER",
            },
          },
        } satisfies Prisma.BotCreateInput;
      },
      updateBotInput(botInfo: UserFromGetMe, chatId: number, token: string) {
        const { first_name: firstName, username, id: botId } = botInfo;
        return {
          username,
          token,
          firstName,
          chats: {
            upsert: {
              where: {
                botId_chatId: {
                  botId,
                  chatId,
                },
              },
              create: {
                chatId,
                role: "OWNER",
              },
              update: {
                role: "OWNER",
              },
            },
          },
        } satisfies Prisma.BotUpdateInput;
      },
    },
  },
});
