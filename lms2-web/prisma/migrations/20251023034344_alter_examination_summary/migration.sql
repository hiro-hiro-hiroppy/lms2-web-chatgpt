/*
  Warnings:

  - You are about to drop the `examination_result` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."examination_result" DROP CONSTRAINT "examination_result_category_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."examination_result" DROP CONSTRAINT "examination_result_user_id_fkey";

-- DropTable
DROP TABLE "public"."examination_result";

-- CreateTable
CREATE TABLE "public"."examination_summary" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "question_type" INTEGER NOT NULL,
    "correct_count" INTEGER NOT NULL,
    "all_question_count" INTEGER NOT NULL,

    CONSTRAINT "examination_summary_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."examination_summary" ADD CONSTRAINT "examination_summary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examination_summary" ADD CONSTRAINT "examination_summary_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
