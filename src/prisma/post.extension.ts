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
    },
  },
});
