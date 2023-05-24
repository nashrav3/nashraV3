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
      postSelectValues() {
        return {
          text: true,
          photo: true,
          video: true,
          audio: true,
          voice: true,
          animation: true,
          document: true,
          sticker: true,
          hasMediaSpoiler: true,
          caption: true,
          captionEntities: true,
          replyMarkup: true,
          entities: true,
        } satisfies Prisma.PostSelect;
      },
    },
  },
});
