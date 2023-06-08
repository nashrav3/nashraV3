import { Prisma } from "@prisma/client";

export default Prisma.defineExtension({
  name: "list",
  model: {
    list: {
      byChatIdBotId(chatId: number, botId: number) {
        return {
          chatId_botId: {
            chatId,
            botId,
          },
        } satisfies Prisma.ListWhereUniqueInput;
      },
    },
  },
});
