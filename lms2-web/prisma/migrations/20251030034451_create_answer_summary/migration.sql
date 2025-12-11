/*
  Warnings:

  - Added the required column `study_time` to the `answer_summary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."answer_summary" ADD COLUMN     "study_time" INTEGER NOT NULL;
