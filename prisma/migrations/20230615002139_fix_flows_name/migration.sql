/*
  Warnings:

  - You are about to drop the `Flows` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Flows" DROP CONSTRAINT "Flows_bot_id_fkey";

-- DropForeignKey
ALTER TABLE "Flows" DROP CONSTRAINT "Flows_post_id_fkey";

-- DropTable
DROP TABLE "Flows";

-- CreateTable
CREATE TABLE "flows" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "queue_name" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "bot_id" BIGINT NOT NULL,
    "post_id" INTEGER,
    "status_message_id" INTEGER NOT NULL,
    "status_message_chat_id" BIGINT NOT NULL,
    "children_count" INTEGER NOT NULL,
    "finished" BOOLEAN,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "flows_id_key" ON "flows"("id");

-- AddForeignKey
ALTER TABLE "flows" ADD CONSTRAINT "flows_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("bot_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flows" ADD CONSTRAINT "flows_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("post_id") ON DELETE SET NULL ON UPDATE CASCADE;
