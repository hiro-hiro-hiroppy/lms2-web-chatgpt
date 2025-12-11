/*
  Warnings:

  - You are about to drop the column `user_id` on the `created_answer_history` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `created_question` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."created_answer_history" DROP CONSTRAINT "created_answer_history_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."created_question" DROP CONSTRAINT "created_question_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."created_answer_history" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "public"."created_question" DROP COLUMN "user_id";
