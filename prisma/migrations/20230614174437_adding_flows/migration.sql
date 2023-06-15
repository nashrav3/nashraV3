-- AlterTable
ALTER TABLE "bots" ADD COLUMN     "timezone" TEXT;

-- CreateTable
CREATE TABLE "Flows" (
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

    CONSTRAINT "Flows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Flows_id_key" ON "Flows"("id");

-- AddForeignKey
ALTER TABLE "Flows" ADD CONSTRAINT "Flows_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("bot_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flows" ADD CONSTRAINT "Flows_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("post_id") ON DELETE SET NULL ON UPDATE CASCADE;
