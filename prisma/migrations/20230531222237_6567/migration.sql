-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "username" TEXT;

-- CreateTable
CREATE TABLE "sents" (
    "id" SERIAL NOT NULL,
    "message_id" INTEGER NOT NULL,
    "post_id" INTEGER NOT NULL,
    "chatId" BIGINT NOT NULL,
    "bot_id" BIGINT NOT NULL,
    "to_be_deleted_at" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "List" (
    "id" SERIAL NOT NULL,
    "chatId" BIGINT NOT NULL,
    "bot_id" BIGINT NOT NULL,

    CONSTRAINT "List_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sents_id_key" ON "sents"("id");

-- CreateIndex
CREATE UNIQUE INDEX "List_id_key" ON "List"("id");

-- AddForeignKey
ALTER TABLE "sents" ADD CONSTRAINT "sents_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sents" ADD CONSTRAINT "sents_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("bot_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sents" ADD CONSTRAINT "sents_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("chat_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List" ADD CONSTRAINT "List_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("bot_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List" ADD CONSTRAINT "List_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("chat_id") ON DELETE RESTRICT ON UPDATE CASCADE;
