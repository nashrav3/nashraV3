/*
  Warnings:

  - A unique constraint covering the columns `[index]` on the table `lists` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
CREATE SEQUENCE lists_index_seq;
ALTER TABLE "lists" ALTER COLUMN "index" SET DEFAULT nextval('lists_index_seq');
ALTER SEQUENCE lists_index_seq OWNED BY "lists"."index";

-- CreateIndex
CREATE UNIQUE INDEX "lists_index_key" ON "lists"("index");
