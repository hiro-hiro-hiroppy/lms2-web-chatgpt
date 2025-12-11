/*
  Warnings:

  - You are about to drop the column `question_id` on the `created_question` table. All the data in the column will be lost.
  - Added the required column `question_status_id` to the `created_question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."created_question" DROP COLUMN "question_id",
ADD COLUMN     "question_status_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."created_question" ADD CONSTRAINT "created_question_question_status_id_fkey" FOREIGN KEY ("question_status_id") REFERENCES "public"."created_question_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
