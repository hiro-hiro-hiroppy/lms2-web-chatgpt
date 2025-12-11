/*
  Warnings:

  - Added the required column `question_status_id` to the `word_summary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."word_summary" ADD COLUMN     "question_status_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."word_summary" ADD CONSTRAINT "word_summary_question_status_id_fkey" FOREIGN KEY ("question_status_id") REFERENCES "public"."created_question_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
