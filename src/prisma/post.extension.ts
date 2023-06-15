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
          postId: true,
          postNumber: true,
          text: true,
          fileId: true,
          type: true,
          postOptions: true,
        } satisfies Prisma.PostSelect;
      },
    },
  },
});
