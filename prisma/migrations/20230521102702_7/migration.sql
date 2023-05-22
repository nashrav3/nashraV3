/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `bot_chat` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "bot_chat" ADD COLUMN     "id" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "bot_chat_id_key" ON "bot_chat"("id");
