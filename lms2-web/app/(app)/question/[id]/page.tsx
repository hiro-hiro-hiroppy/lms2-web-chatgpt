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

  return <QuestionComponent questions={questions} userId={userId} />;
}

