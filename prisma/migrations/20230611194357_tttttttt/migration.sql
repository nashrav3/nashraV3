-- DropForeignKey
ALTER TABLE "bot_chat" DROP CONSTRAINT "bot_chat_chat_id_fkey";

-- AddForeignKey
ALTER TABLE "bot_chat" ADD CONSTRAINT "bot_chat_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("chat_id") ON DELETE RESTRICT ON UPDATE CASCADE;
