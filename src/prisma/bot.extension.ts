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
    },
  },
});
