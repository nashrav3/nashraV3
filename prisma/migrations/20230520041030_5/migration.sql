/*
  Warnings:

  - You are about to drop the `bot_chats` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bot_chats" DROP CONSTRAINT "bot_chats_bot_id_fkey";

-- DropForeignKey
ALTER TABLE "bot_chats" DROP CONSTRAINT "bot_chats_chat_id_fkey";

-- DropTable
DROP TABLE "bot_chats";

-- CreateTable
CREATE TABLE "bot_chat" (
    "bot_id" BIGINT NOT NULL,
    "chat_id" BIGINT NOT NULL,
    "canInviteUsers" BOOLEAN,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "bot_chat_bot_id_chat_id_key" ON "bot_chat"("bot_id", "chat_id");

-- AddForeignKey
ALTER TABLE "bot_chat" ADD CONSTRAINT "bot_chat_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("bot_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_chat" ADD CONSTRAINT "bot_chat_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("chat_id") ON DELETE CASCADE ON UPDATE CASCADE;
