-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('private', 'group', 'supergroup', 'channel');

-- CreateEnum
CREATE TYPE "ParseMode" AS ENUM ('MarkdownV2', 'Markdown', 'HTML');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('animation', 'audio', 'document', 'photo', 'sticker', 'video', 'video_note', 'voice', 'text');

-- CreateTable
CREATE TABLE "chats" (
    "chat_id" BIGINT NOT NULL,
    "chat_type" "ChatType" NOT NULL,
    "language_code" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "username" TEXT,
    "link" TEXT,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "bots" (
    "bot_id" BIGINT NOT NULL,
    "token" TEXT NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(255) NOT NULL DEFAULT 'bot_name',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "post_number_counter" INTEGER NOT NULL DEFAULT 0,
    "group" BIGINT,

    CONSTRAINT "bots_pkey" PRIMARY KEY ("bot_id")
);

-- CreateTable
CREATE TABLE "posts" (
    "post_id" SERIAL NOT NULL,
    "chat_id" BIGINT NOT NULL,
    "bot_id" BIGINT NOT NULL,
    "text" VARCHAR(4096),
    "media_group_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file_id" TEXT,
    "postOptions" JSONB,
    "type" "PostType" NOT NULL,
    "post_number" INTEGER NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "bot_chat" (
    "bot_id" BIGINT NOT NULL,
    "chat_id" BIGINT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" SERIAL NOT NULL,
    "bot_blocked" BOOLEAN,
    "deactivated" BOOLEAN,
    "not_found" BOOLEAN,
    "need_admin_rights" BOOLEAN,
    "not_member" BOOLEAN,
    "role" "Role",
    "bot_kicked" BOOLEAN,

    CONSTRAINT "bot_chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sents" (
    "id" SERIAL NOT NULL,
    "message_id" INTEGER NOT NULL,
    "post_id" INTEGER NOT NULL,
    "chat_id" BIGINT NOT NULL,
    "bot_id" BIGINT NOT NULL,
    "to_be_deleted_at" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lists" (
    "id" SERIAL NOT NULL,
    "index" SERIAL NOT NULL,
    "chat_id" BIGINT NOT NULL,
    "bot_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chats_chat_id_key" ON "chats"("chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "bots_bot_id_key" ON "bots"("bot_id");

-- CreateIndex
CREATE UNIQUE INDEX "bots_token_key" ON "bots"("token");

-- CreateIndex
CREATE UNIQUE INDEX "posts_post_id_key" ON "posts"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "bot_chat_id_key" ON "bot_chat"("id");

-- CreateIndex
CREATE UNIQUE INDEX "bot_chat_bot_id_chat_id_key" ON "bot_chat"("bot_id", "chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "sents_id_key" ON "sents"("id");

-- CreateIndex
CREATE UNIQUE INDEX "lists_id_key" ON "lists"("id");

-- CreateIndex
CREATE UNIQUE INDEX "lists_index_key" ON "lists"("index");

-- CreateIndex
CREATE UNIQUE INDEX "lists_chat_id_bot_id_key" ON "lists"("chat_id", "bot_id");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("bot_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("chat_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_chat" ADD CONSTRAINT "bot_chat_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("bot_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_chat" ADD CONSTRAINT "bot_chat_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("chat_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sents" ADD CONSTRAINT "sents_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("bot_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sents" ADD CONSTRAINT "sents_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("chat_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sents" ADD CONSTRAINT "sents_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lists" ADD CONSTRAINT "lists_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("bot_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lists" ADD CONSTRAINT "lists_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("chat_id") ON DELETE RESTRICT ON UPDATE CASCADE;

