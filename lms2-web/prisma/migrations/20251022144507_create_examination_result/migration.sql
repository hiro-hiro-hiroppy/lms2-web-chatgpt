-- AlterTable
ALTER TABLE "public"."answer_history" ALTER COLUMN "answer_result" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."examination_result" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "question_type" INTEGER NOT NULL,
    "correct_count" INTEGER NOT NULL,
    "question_count" INTEGER NOT NULL,

    CONSTRAINT "examination_result_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."examination_result" ADD CONSTRAINT "examination_result_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examination_result" ADD CONSTRAINT "examination_result_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
