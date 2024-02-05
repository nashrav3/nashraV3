import { Prisma } from "@prisma/client";

export default Prisma.defineExtension({
  name: "botChat",
  result: {},
  model: {
    botChat: {
      byBotIdChatId(botId: number, chatId: number) {
        return {
          botId_chatId: {
            botId,
            chatId,
          },
        } satisfies Prisma.BotChatWhereUniqueInput;
      },
      byBotIdNotPvOrGroup(botId: number) {
        return {
          botId,
          chat: {
            chatType: {
              notIn: ["private", "group"],
            },
          },
        } satisfies Prisma.BotChatWhereInput;
      },
      canSend() {
        return {
          AND: [
            {
              OR: [
                { botBlocked: { equals: false } },
                { botBlocked: { equals: undefined } },
              ],
            },
            {
              OR: [
                { deactivated: { equals: false } },
                { deactivated: { equals: undefined } },
              ],
            },
            {
              OR: [
                { needAdminRights: { equals: false } },
                { needAdminRights: { equals: undefined } },
              ],
            },
            {
              OR: [
                { notFound: { equals: false } },
                { notFound: { equals: undefined } },
              ],
            },
            {
              OR: [
                { notMember: { equals: false } },
                { notMember: { equals: undefined } },
              ],
            },
            {
              OR: [
                { botKicked: { equals: false } },
                { botKicked: { equals: undefined } },
              ],
            },
          ],
        } satisfies Prisma.BotChatWhereInput;
      },
      removeFromListNeedAdminRights(chatId: number, botId: number) {
        return {
          needAdminRights: true,
          chat: {
            update: {
              list: {
                delete: {
                  chatId_botId: {
                    chatId,
                    botId,
                  },
                },
              },
            },
          },
        } satisfies Prisma.BotChatUpdateInput;
      },
    },
  },
});
