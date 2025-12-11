import { Prisma, PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export type ExaminationHistoryPostRequest = {
  userId: number;
  questionType: number;
  qaList: QuestionAnswerResult[];
};

export type QuestionAnswerResult = {
  questionId: number;
  answerResult: string;
  duration: number;
};

export type ExaminationHistoryPostResponse = {
  examinationResults: ExaminationResultType[];
  examinationSummaries: ExaminationSummaryType[];
};

export type ExaminationResultType = Prisma.AnswerHistoryGetPayload<{
  include: {
    question: {
      include: {
        category: true;
      };
    };
  };
}>;

export type ExaminationSummaryType = Prisma.ExaminationSummaryGetPayload<{
  include: {
    category: true;
  };
}>;

export async function POST(req: NextRequest) {
  const { userId, questionType, qaList } = await req.json();

  // 既に解答結果が送信されていればエラー処理を起こす
  const registedHistories = await prisma.answerHistory.findMany({
    where: {
      userId: Number(userId),
      question: {
        questionType: Number(questionType)
      }
    },
    include: {
      question: true
    }
  });
  if (registedHistories.length > 0) {
    return NextResponse.json({ error: 'すでに試験実施済みです。' }, { status: 500 });
  }

  // 解答結果がなければ新規でデータを作成する
  try {
    await prisma.$transaction(async () => {
      // 解答結果を個別に登録
      for (const [i, qa] of qaList.entries()) {
        await prisma.answerHistory.create({
          data: {
            userId: userId,
            questionId: qa.questionId,
            answerResult: qa.answerResult,
            answerDuration: qa.duration
          }
        });
      }

      // 解答結果のカテゴリーごとのまとめを登録する
      const registAnswers = await prisma.answerHistory.findMany({
        where: {
          userId: userId,
          question: {
            questionType: questionType
          }
        },
        include: {
          question: {
            include: {
              category: true
            }
          }
        }
      });
      const categories = await prisma.category.findMany({
        where: {
          isValid: true
        },
        orderBy: {
          id: 'asc'
        }
      });

      for (const [i, category] of categories.entries()) {
        const categoryAnswers = registAnswers.filter(
          (answer) => answer.question.categoryId === category.id
        );
        const allQuestionCount = categoryAnswers.length;
        const correctCount = categoryAnswers.filter(
          (answer) => answer.answerResult === answer.question.answer
        ).length;

        await prisma.examinationSummary.create({
          data: {
            userId: userId,
            categoryId: category.id,
            questionType: questionType,
            correctCount: correctCount,
            allQuestionCount: allQuestionCount
          }
        });
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: '登録中にエラーが発生しました。 :' + error },
      { status: 500 }
    );
  }

  // 各問題の解答結果、カテゴリーごとの結果を返す
  const examinationResults = await prisma.answerHistory.findMany({
    where: {
      userId: userId,
      question: {
        questionType: questionType
      }
    },
    include: {
      question: {
        include: {
          category: true
        }
      }
    },
    orderBy: {
      id: 'asc'
    }
  });

  const examinationSummaries = await prisma.examinationSummary.findMany({
    where: {
      userId: userId,
      questionType: questionType
    },
    include: {
      category: true
    },
    orderBy: {
      id: 'asc'
    }
  });

  const res = NextResponse.json({
    examinationResults: examinationResults,
    examinationSummaries: examinationSummaries
  } as ExaminationHistoryPostResponse);
  return res;
}

