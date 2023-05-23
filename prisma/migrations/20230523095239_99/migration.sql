/*
  Warnings:

  - You are about to drop the column `role` on the `chats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bot_chat" ALTER COLUMN "role" DROP DEFAULT;

-- AlterTable
ALTER TABLE "chats" DROP COLUMN "role";
