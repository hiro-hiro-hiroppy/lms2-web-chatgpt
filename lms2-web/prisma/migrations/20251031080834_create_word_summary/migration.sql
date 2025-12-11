/*
  Warnings:

  - Added the required column `question_status_id` to the `answer_summary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."answer_summary" ADD COLUMN     "question_status_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."answer_summary" ADD CONSTRAINT "answer_summary_question_status_id_fkey" FOREIGN KEY ("question_status_id") REFERENCES "public"."created_question_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
