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
                { botBlocked: { equals: null } },
              ],
            },
            {
              OR: [
                { deactivated: { equals: false } },
                { deactivated: { equals: null } },
              ],
            },
            {
              OR: [
                { needAdminRights: { equals: false } },
                { needAdminRights: { equals: null } },
              ],
            },
            {
              OR: [
                { notFound: { equals: false } },
                { notFound: { equals: null } },
              ],
            },
            {
              OR: [
                { notMember: { equals: false } },
                { notMember: { equals: null } },
              ],
            },
            {
              OR: [
                { botKicked: { equals: false } },
                { botKicked: { equals: null } },
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
