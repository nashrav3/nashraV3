-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('private', 'group', 'supergroup', 'channel');

-- CreateEnum
CREATE TYPE "ParseMode" AS ENUM ('MarkdownV2', 'Markdown', 'HTML');

-- CreateTable
CREATE TABLE "chats" (
    "chat_id" BIGINT NOT NULL,
    "chat_type" "ChatType" NOT NULL,
    "language_code" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "Role" NOT NULL DEFAULT 'USER'
);

-- CreateTable
CREATE TABLE "bots" (
    "bot_id" BIGINT NOT NULL,
    "token" TEXT NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(255) NOT NULL DEFAULT 'bot_name',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "posts" (
    "post_id" SERIAL NOT NULL,
    "chat_id" BIGINT NOT NULL,
    "bot_id" BIGINT NOT NULL,
    "text" VARCHAR(4096),
    "parse_mode" "ParseMode",
    "entities" JSONB,
    "reply_markup" JSONB,
    "media_group_id" TEXT,
    "animation" TEXT,
    "audio" TEXT,
    "document" TEXT,
    "photo" TEXT,
    "sticker" TEXT,
    "video" TEXT,
    "video_note" TEXT,
    "voice" TEXT,
    "caption" TEXT,
    "caption_entities" JSONB,
    "has_media_spoiler" BOOLEAN,
    "disable_web_page_preview" BOOLEAN,
    "dice" TEXT,
    "game" JSONB,
    "poll" JSONB,
    "venue" JSONB,
    "location" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "chats_chat_id_key" ON "chats"("chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "bots_bot_id_key" ON "bots"("bot_id");

-- CreateIndex
CREATE UNIQUE INDEX "bots_token_key" ON "bots"("token");

-- CreateIndex
CREATE UNIQUE INDEX "posts_post_id_key" ON "posts"("post_id");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("chat_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("bot_id") ON DELETE RESTRICT ON UPDATE CASCADE;
