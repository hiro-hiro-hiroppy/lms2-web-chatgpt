import { PrismaClient } from '@prisma/client';
// import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export type AnswerHistoryGetResponse = {
  categoryId: number;
  questionHistories: QuestionHistoryGetEntity[];
};

type QuestionHistoryGetEntity = {
  questionNo: number;
  questionSentence: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
  answerHistories: AnswerHistoryGetEntity[];
};

export type AnswerHistoryGetEntity = {
  answerResult: string | null;
  isCorrect: boolean;
  answeredTime: string;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') ?? '';
  const categoryId = searchParams.get('categoryId') ?? '';
  const questionAnswerHistories = await prisma.question.findMany({
    where: {
      categoryId: Number(categoryId),
      questionType: 1
    },
    include: {
      answerHistories: {
        where: {
          userId: Number(userId)
        },
        orderBy: {
          answeredTime: 'desc'
        },
        take: 5 // 最大5件を取得
      }
    },
    orderBy: {
      id: 'asc'
    }
  });

  const questionHistoryGetEntities = questionAnswerHistories.map((questionAnswerHistory) => {
    return {
      questionNo: questionAnswerHistory.questionNo,
      questionSentence: questionAnswerHistory.questionSentence,
      optionA: questionAnswerHistory.optionA,
      optionB: questionAnswerHistory.optionB,
      optionC: questionAnswerHistory.optionC,
      optionD: questionAnswerHistory.optionD,
      answer: questionAnswerHistory.answer,

      answerHistories: questionAnswerHistory.answerHistories.map((answerHistory) => {
        return {
          answerResult: answerHistory.answerResult,
          isCorrect: answerHistory.answerResult === questionAnswerHistory.answer,
          answeredTime: `${answerHistory.answeredTime.getMonth() + 1}/${answerHistory.answeredTime.getDate()}`
        };
      })
    };
  });
  const response: AnswerHistoryGetResponse = {
    categoryId: Number(categoryId),
    questionHistories: questionHistoryGetEntities
  };

  return NextResponse.json(response);
}

export async function POST(req: NextRequest) {
  const { userId, questionId, answerResult, answerDuration } = await req.json();
  await prisma.answerHistory.create({
    data: {
      userId: userId,
      questionId: questionId,
      answerResult: answerResult,
      answerDuration: answerDuration
    }
  });

  const res = NextResponse.json({ message: 'insert finished' });
  return res;
}

