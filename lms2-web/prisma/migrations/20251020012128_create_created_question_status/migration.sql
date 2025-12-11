/*
  Warnings:

  - You are about to drop the column `questionId` on the `created_answer_history` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `created_answer_history` table. All the data in the column will be lost.
  - Added the required column `question_id` to the `created_answer_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `created_answer_history` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."created_answer_history" DROP CONSTRAINT "created_answer_history_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."created_answer_history" DROP CONSTRAINT "created_answer_history_userId_fkey";

-- AlterTable
ALTER TABLE "public"."created_answer_history" DROP COLUMN "questionId",
DROP COLUMN "userId",
ADD COLUMN     "question_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."created_question_status" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "day_count" INTEGER NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "created_question_status_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."created_answer_history" ADD CONSTRAINT "created_answer_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."created_answer_history" ADD CONSTRAINT "created_answer_history_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."created_question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."created_question_status" ADD CONSTRAINT "created_question_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
