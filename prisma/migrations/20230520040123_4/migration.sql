-- CreateTable
CREATE TABLE "bot_chats" (
    "bot_id" BIGINT NOT NULL,
    "chat_id" BIGINT NOT NULL,
    "canInviteUsers" BOOLEAN,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "bot_chats_bot_id_chat_id_key" ON "bot_chats"("bot_id", "chat_id");

-- AddForeignKey
ALTER TABLE "bot_chats" ADD CONSTRAINT "bot_chats_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("bot_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_chats" ADD CONSTRAINT "bot_chats_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("chat_id") ON DELETE CASCADE ON UPDATE CASCADE;
