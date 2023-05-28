import { Prisma } from "@prisma/client";

export default Prisma.defineExtension({
  name: "post",
  model: {
    post: {
      byPostId(postId: number) {
        return {
          postId,
        } satisfies Prisma.PostWhereInput;
      },
      byPostNumber(postNumber: number, botId: number) {
        return {
          postNumber,
          botId,
        } satisfies Prisma.PostWhereInput;
      },
      postSelectValues() {
        return {
          text: true,
          fileId: true,
          postOptions: true,
        } satisfies Prisma.PostSelect;
      },
    },
  },
});
