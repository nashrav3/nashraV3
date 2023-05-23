-- AlterTable
ALTER TABLE "bot_chat" ADD COLUMN     "need_admin_rights" BOOLEAN,
ADD COLUMN     "not_member" BOOLEAN,
ADD COLUMN     "role" "Role" DEFAULT 'USER';
