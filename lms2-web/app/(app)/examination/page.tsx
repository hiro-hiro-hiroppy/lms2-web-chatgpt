export const dynamic = 'force-dynamic';

import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import ExaminationComponent from '@/components/examination/examination-component';

const prisma = new PrismaClient();

type ExaminationPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Examination({ searchParams }: ExaminationPageProps) {
  const props = await searchParams;
  const session = await getServerSession(authOptions);
  const userId = session?.user.userId;
  const examinationId = props.examination_id;

  const preExaminationId = process.env.PRE_EXAMINATION_ID;
  const postExaminationId = process.env.POST_EXAMINATION_ID;
  let questions = [];
  let questionType = null;

  // 事前テスト
  if (examinationId === preExaminationId) {
    questions = await prisma.question.findMany({
      where: {
        questionType: 2
      },
      orderBy: {
        questionNo: 'asc'
      }
    });
    questionType = 2;
  }
  // 事後テスト
  else if (examinationId === postExaminationId) {
    questions = await prisma.question.findMany({
      where: {
        questionType: 3
      },
      orderBy: {
        questionNo: 'asc'
      }
    });
    questionType = 3;
  }
  // エラー
  else {
    throw new Error('エラーが発生しました。');
  }

  return (
    <ExaminationComponent examQuestions={questions} userId={userId} questionType={questionType} />
  );
}

