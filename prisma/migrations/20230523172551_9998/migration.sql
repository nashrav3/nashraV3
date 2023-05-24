-- AlterTable
ALTER TABLE "bot_chat" ADD COLUMN     "bot_kicked" BOOLEAN,
ADD CONSTRAINT "bot_chat_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "bots" ADD CONSTRAINT "bots_pkey" PRIMARY KEY ("bot_id");

-- AlterTable
ALTER TABLE "chats" ADD CONSTRAINT "chats_pkey" PRIMARY KEY ("chat_id");

-- AlterTable
ALTER TABLE "posts" ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("post_id");
