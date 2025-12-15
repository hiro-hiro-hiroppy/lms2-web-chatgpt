import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import QuestionComponent from '@/components/question/question-component';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

type QuestionPageProps = {
  params: Promise<{
    id: number;
  }>;
};

const prisma = new PrismaClient();

export default async function Question({ params }: QuestionPageProps) {
  const props = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user.userId;

  // 問題を取得
  const questions = await prisma.question.findMany({
    where: {
      categoryId: Number(props.id),
      questionType: 1
    },
    orderBy: {
      questionNo: 'asc'
    }
  });

  // 最終履歴を取得
  const questionHistories = await prisma.answerHistory.findFirst({
    include: {
      question: true
    },
    where: {
      userId: userId,
      question: {
        categoryId: Number(props.id),
        questionType: 1
      }
    },
    orderBy: {
      id: 'desc'
    }
  });
  let lastQuestionNo = 0;
  if (questionHistories !== null) lastQuestionNo = questionHistories.question.questionNo;

  return (
    <QuestionComponent
      categoryQuestions={questions}
      userId={userId}
      lastQuestionNo={lastQuestionNo}
    />
  );
}

