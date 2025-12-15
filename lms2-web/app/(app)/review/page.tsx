export const dynamic = 'force-dynamic';

import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import ReviewComponent from '@/components/review/review-component';

const prisma = new PrismaClient();

export default async function Review() {
  const session = await getServerSession(authOptions);
  const userId = session?.user.userId;

  const successCreatedQuestionStatus = await prisma.createdQuestionStatus.findMany({
    where: {
      status: 1,
      userId: userId
    },
    orderBy: {
      id: 'asc'
    }
  });

  const createdQuestions = await prisma.createdQuestion.findMany({
    where: {
      questionStatusId: {
        in: successCreatedQuestionStatus.map((q) => q.id)
      }
    },
    orderBy: {
      id: 'asc'
    }
  });

  const wordSummaries = await prisma.wordSummary.findMany({
    where: {
      questionStatusId: {
        in: successCreatedQuestionStatus.map((q) => q.id)
      }
    },
    include: {
      category: true
    },
    orderBy: {
      id: 'asc'
    }
  });

  const category7WordSummaries = wordSummaries.filter((word) => word.categoryId === 7);
  const category8WordSummaries = wordSummaries.filter((word) => word.categoryId === 8);
  // const category9WordSummaries = wordSummaries.filter((word) => word.categoryId === 9);
  // const category10WordSummaries = wordSummaries.filter((word) => word.categoryId === 10);

  const answerSummaries = await prisma.answerSummary.findMany({
    where: {
      questionStatusId: {
        in: successCreatedQuestionStatus.map((q) => q.id)
      }
    },
    orderBy: {
      id: 'asc'
    }
  });
  // console.log(category7WordSummaries);

  return (
    <ReviewComponent
      createdQuestionStatuses={successCreatedQuestionStatus}
      createdQuestions={createdQuestions}
      userId={userId}
      // wordSummaries={wordSummaries}
      category7WordSummaries={category7WordSummaries}
      category8WordSummaries={category8WordSummaries}
      // category9WordSummaries={category9WordSummaries}
      // category10WordSummaries={category10WordSummaries}
      answerSummaries={answerSummaries}
    />
  );
}

