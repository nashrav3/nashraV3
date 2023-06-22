/*
  Warnings:

  - A unique constraint covering the columns `[message_id,chat_id]` on the table `sents` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "bots" ADD COLUMN     "expire_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "sents_message_id_chat_id_key" ON "sents"("message_id", "chat_id");
