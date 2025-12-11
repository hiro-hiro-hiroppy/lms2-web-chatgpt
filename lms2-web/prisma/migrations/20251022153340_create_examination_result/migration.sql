/*
  Warnings:

  - You are about to drop the column `question_count` on the `examination_result` table. All the data in the column will be lost.
  - Added the required column `all_question_count` to the `examination_result` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."examination_result" DROP COLUMN "question_count",
ADD COLUMN     "all_question_count" INTEGER NOT NULL;
