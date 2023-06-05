/*
  Warnings:

  - You are about to drop the `List` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "List" DROP CONSTRAINT "List_bot_id_fkey";

-- DropForeignKey
ALTER TABLE "List" DROP CONSTRAINT "List_chatId_fkey";

-- AlterTable
ALTER TABLE "bots" ADD COLUMN     "group" BIGINT;

-- DropTable
DROP TABLE "List";

-- CreateTable
CREATE TABLE "lists" (
    "id" SERIAL NOT NULL,
    "index" INTEGER NOT NULL,
    "chatId" BIGINT NOT NULL,
    "bot_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lists_id_key" ON "lists"("id");

-- AddForeignKey
ALTER TABLE "lists" ADD CONSTRAINT "lists_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("bot_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lists" ADD CONSTRAINT "lists_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("chat_id") ON DELETE RESTRICT ON UPDATE CASCADE;
