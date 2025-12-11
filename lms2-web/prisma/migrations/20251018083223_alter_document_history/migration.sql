/*
  Warnings:

  - You are about to drop the column `document_id` on the `document_history` table. All the data in the column will be lost.
  - Added the required column `document_page_id` to the `document_history` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."document_history" DROP CONSTRAINT "document_history_document_id_fkey";

-- AlterTable
ALTER TABLE "public"."document_history" DROP COLUMN "document_id",
ADD COLUMN     "document_page_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."document_history" ADD CONSTRAINT "document_history_document_page_id_fkey" FOREIGN KEY ("document_page_id") REFERENCES "public"."document_page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
