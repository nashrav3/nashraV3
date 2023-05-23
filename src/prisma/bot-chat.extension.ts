import { Prisma } from "@prisma/client";

export default Prisma.defineExtension({
  name: "botChat",
  model: {
    botChat: {
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
          ],
        } satisfies Prisma.BotChatWhereInput;
      },
    },
  },
});
