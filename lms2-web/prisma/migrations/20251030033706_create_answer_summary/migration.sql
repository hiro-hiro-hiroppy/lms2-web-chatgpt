-- CreateTable
CREATE TABLE "public"."answer_summary" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "day_count" INTEGER NOT NULL,
    "correct_count" INTEGER NOT NULL,
    "all_question_count" INTEGER NOT NULL,

    CONSTRAINT "answer_summary_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."answer_summary" ADD CONSTRAINT "answer_summary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answer_summary" ADD CONSTRAINT "answer_summary_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
