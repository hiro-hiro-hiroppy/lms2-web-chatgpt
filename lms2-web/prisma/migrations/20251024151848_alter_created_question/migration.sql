/*
  Warnings:

  - Added the required column `explanation` to the `created_question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `translation` to the `created_question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."created_question" ADD COLUMN     "explanation" TEXT NOT NULL,
ADD COLUMN     "translation" TEXT NOT NULL;
