/*
  Warnings:

  - Added the required column `post_number` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bots" ADD COLUMN     "post_number_counter" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "post_number" INTEGER NOT NULL;
