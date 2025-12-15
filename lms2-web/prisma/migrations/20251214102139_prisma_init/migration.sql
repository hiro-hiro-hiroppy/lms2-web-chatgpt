-- CreateTable
CREATE TABLE "public"."user" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."category" (
    "id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,
    "is_valid" BOOLEAN NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sub_category" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "sub_category_name" TEXT NOT NULL,

    CONSTRAINT "sub_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "heading" TEXT NOT NULL,
    "document_path" TEXT NOT NULL,
    "page_count" INTEGER NOT NULL,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_page" (
    "id" SERIAL NOT NULL,
    "document_id" INTEGER NOT NULL,
    "page_no" INTEGER NOT NULL,
    "sub_category_id" INTEGER,
    "words" TEXT[],

    CONSTRAINT "document_page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "sub_category_id1" INTEGER,
    "sub_category_id2" INTEGER,
    "sub_category_id3" INTEGER,
    "question_no" INTEGER NOT NULL,
    "question_sentence" TEXT NOT NULL,
    "image_path" TEXT,
    "option_a" TEXT NOT NULL,
    "option_b" TEXT NOT NULL,
    "option_c" TEXT NOT NULL,
    "option_d" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "translation" TEXT,
    "explanation" TEXT,
    "avg_answer_duration" INTEGER,
    "correct_percent" DOUBLE PRECISION,
    "question_type" INTEGER NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "document_page_id" INTEGER NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "registered_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."answer_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "answer_result" TEXT,
    "answer_duration" DOUBLE PRECISION NOT NULL,
    "answered_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answer_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chatgpt_heading" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "heading" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_time" TIMESTAMP(3),

    CONSTRAINT "chatgpt_heading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chatgpt_history" (
    "id" SERIAL NOT NULL,
    "heading_id" INTEGER NOT NULL,
    "sentences" TEXT NOT NULL,
    "convert_sentences" TEXT,
    "role" INTEGER NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chatgpt_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."created_question" (
    "id" SERIAL NOT NULL,
    "question_status_id" INTEGER NOT NULL,
    "question_no" INTEGER NOT NULL,
    "question_sentence" TEXT NOT NULL,
    "option_a" TEXT NOT NULL,
    "option_b" TEXT NOT NULL,
    "option_c" TEXT NOT NULL,
    "option_d" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "created_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."created_answer_history" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "answer_result" TEXT,
    "answer_duration" DOUBLE PRECISION NOT NULL,
    "answered_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "created_answer_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."created_question_status" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "day_count" INTEGER NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "created_question_status_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "public"."answer_summary" (
    "id" SERIAL NOT NULL,
    "question_status_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "day_count" INTEGER NOT NULL,
    "correct_count" INTEGER NOT NULL,
    "all_question_count" INTEGER NOT NULL,
    "study_time" INTEGER NOT NULL,

    CONSTRAINT "answer_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."word_summary" (
    "id" SERIAL NOT NULL,
    "question_status_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "word" TEXT NOT NULL,
    "day_count" INTEGER NOT NULL,
    "document_count" INTEGER NOT NULL,
    "correct_count" INTEGER NOT NULL,
    "all_question_count" INTEGER NOT NULL,

    CONSTRAINT "word_summary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_user_id_key" ON "public"."user"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "document_document_path_key" ON "public"."document"("document_path");

-- AddForeignKey
ALTER TABLE "public"."sub_category" ADD CONSTRAINT "sub_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document" ADD CONSTRAINT "document_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_page" ADD CONSTRAINT "document_page_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "public"."sub_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_page" ADD CONSTRAINT "document_page_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question" ADD CONSTRAINT "question_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question" ADD CONSTRAINT "question_sub_category_id1_fkey" FOREIGN KEY ("sub_category_id1") REFERENCES "public"."sub_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question" ADD CONSTRAINT "question_sub_category_id2_fkey" FOREIGN KEY ("sub_category_id2") REFERENCES "public"."sub_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question" ADD CONSTRAINT "question_sub_category_id3_fkey" FOREIGN KEY ("sub_category_id3") REFERENCES "public"."sub_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_history" ADD CONSTRAINT "document_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_history" ADD CONSTRAINT "document_history_document_page_id_fkey" FOREIGN KEY ("document_page_id") REFERENCES "public"."document_page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answer_history" ADD CONSTRAINT "answer_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answer_history" ADD CONSTRAINT "answer_history_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chatgpt_heading" ADD CONSTRAINT "chatgpt_heading_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chatgpt_history" ADD CONSTRAINT "chatgpt_history_heading_id_fkey" FOREIGN KEY ("heading_id") REFERENCES "public"."chatgpt_heading"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."created_question" ADD CONSTRAINT "created_question_question_status_id_fkey" FOREIGN KEY ("question_status_id") REFERENCES "public"."created_question_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."created_answer_history" ADD CONSTRAINT "created_answer_history_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."created_question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."created_question_status" ADD CONSTRAINT "created_question_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examination_summary" ADD CONSTRAINT "examination_summary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."examination_summary" ADD CONSTRAINT "examination_summary_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answer_summary" ADD CONSTRAINT "answer_summary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answer_summary" ADD CONSTRAINT "answer_summary_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answer_summary" ADD CONSTRAINT "answer_summary_question_status_id_fkey" FOREIGN KEY ("question_status_id") REFERENCES "public"."created_question_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."word_summary" ADD CONSTRAINT "word_summary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."word_summary" ADD CONSTRAINT "word_summary_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."word_summary" ADD CONSTRAINT "word_summary_question_status_id_fkey" FOREIGN KEY ("question_status_id") REFERENCES "public"."created_question_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
