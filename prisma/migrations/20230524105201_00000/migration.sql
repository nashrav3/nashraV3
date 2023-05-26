/*
  Warnings:

  - You are about to drop the column `animation` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `audio` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `caption` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `caption_entities` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `dice` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `disable_web_page_preview` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `document` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `entities` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `game` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `has_media_spoiler` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `parse_mode` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `photo` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `poll` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `reply_markup` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `sticker` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `venue` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `video` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `video_note` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `voice` on the `posts` table. All the data in the column will be lost.
  - Added the required column `type` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('animation', 'audio', 'document', 'photo', 'sticker', 'video', 'video_note', 'voice', 'text');

-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "animation",
DROP COLUMN "audio",
DROP COLUMN "caption",
DROP COLUMN "caption_entities",
DROP COLUMN "dice",
DROP COLUMN "disable_web_page_preview",
DROP COLUMN "document",
DROP COLUMN "entities",
DROP COLUMN "game",
DROP COLUMN "has_media_spoiler",
DROP COLUMN "location",
DROP COLUMN "parse_mode",
DROP COLUMN "photo",
DROP COLUMN "poll",
DROP COLUMN "reply_markup",
DROP COLUMN "sticker",
DROP COLUMN "venue",
DROP COLUMN "video",
DROP COLUMN "video_note",
DROP COLUMN "voice",
ADD COLUMN     "file_id" TEXT,
ADD COLUMN     "postOptions" JSONB,
ADD COLUMN     "type" "PostType" NOT NULL;
