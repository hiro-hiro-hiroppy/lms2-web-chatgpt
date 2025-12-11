/*
  Warnings:

  - Made the column `question_type` on table `question` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."question" ALTER COLUMN "question_type" SET NOT NULL;
