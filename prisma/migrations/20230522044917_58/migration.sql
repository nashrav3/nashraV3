/*
  Warnings:

  - You are about to drop the column `canInviteUsers` on the `bot_chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bot_chat" DROP COLUMN "canInviteUsers",
ADD COLUMN     "bot_blocked" BOOLEAN,
ADD COLUMN     "deactivated" BOOLEAN,
ADD COLUMN     "not_found" BOOLEAN;
