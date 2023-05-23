import { Prisma } from "@prisma/client";

export default Prisma.defineExtension({
  name: "chat",
  // result: {
  //   chat: {
  //     isAdmin: {
  //       needs: { role: true },
  //       compute(chat) {
  //         return chat.role === Role.ADMIN;
  //       },
  //     },

  //     isOwner: {
  //       needs: { role: true },
  //       compute(chat) {
  //         return chat.role === Role.OWNER;
  //       },
  //     },
  //   },
  // },
  model: {
    chat: {
      byChatId(chatId: number) {
        return {
          chatId,
        } satisfies Prisma.ChatWhereInput;
      },

      // hasAdminRole() {
      //   return {
      //     role: Role.ADMIN,
      //   } satisfies Prisma.ChatWhereInput;
      // },

      // hasOwnerRole() {
      //   return {
      //     role: Role.OWNER,
      //   } satisfies Prisma.ChatWhereInput;
      // },

      // withRoles() {
      //   return {
      //     role: true,
      //     isAdmin: true,
      //     isOwner: true,
      //   } satisfies Prisma.ChatSelect<PrismaClientX["$extends"]["extArgs"]>;
      // },
    },
  },
});
