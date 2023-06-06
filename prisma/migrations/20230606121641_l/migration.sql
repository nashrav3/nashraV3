/*
  Warnings:

  - A unique constraint covering the columns `[chatId,bot_id]` on the table `lists` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "lists_chatId_bot_id_key" ON "lists"("chatId", "bot_id");
