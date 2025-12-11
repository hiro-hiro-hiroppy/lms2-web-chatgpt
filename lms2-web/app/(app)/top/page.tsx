export const dynamic = 'force-dynamic';

import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import TopComponent, {
  AnswerGraphSummaryType,
  PrePostExaminationType
} from '@/components/top/top-component';

const prisma = new PrismaClient();

export default async function Top() {
  const session = await getServerSession(authOptions);
  const userId = session?.user.userId;

  // 表示するカテゴリー
  const categories = await prisma.category.findMany({
    where: {
      isValid: true
    },
    include: {
      documents: true
    }
  });

  const graphTitles = [
    { categoryId: 7, name: '前置詞' },
    { categoryId: 8, name: '接続詞' },
    { categoryId: 9, name: '修飾語' },
    { categoryId: 10, name: '前・接・修' }
  ];

  // 1~3日目のカテゴリーごとの結果
  const answerSummaries = await prisma.answerSummary.findMany({
    where: {
      userId: userId
    },
    orderBy: {
      dayCount: 'asc'
    }
  });
  const answerGraphSummaries: AnswerGraphSummaryType[] = [];
  graphTitles.map((graphTitle) => {
    const answerCategorySummaries = answerSummaries.filter(
      (answer) => answer.categoryId === graphTitle.categoryId
    );

    if (answerCategorySummaries?.length > 0) {
      const day1Summary = answerCategorySummaries.find((answer) => answer.dayCount === 1);
      const day2Summary = answerCategorySummaries.find((answer) => answer.dayCount === 2);
      const day3Summary = answerCategorySummaries.find((answer) => answer.dayCount === 3);

      const day1WrongCount = day1Summary
        ? day1Summary.allQuestionCount - day1Summary.correctCount
        : 0;
      const day2WrongCount = day2Summary
        ? day2Summary.allQuestionCount - day2Summary.correctCount
        : 0;
      const day3WrongCount = day3Summary
        ? day3Summary.allQuestionCount - day3Summary.correctCount
        : 0;

      const answerGraphSummary = {
        title: graphTitle.name,
        data: [
          {
            name: '1日目',
            correct: day1Summary?.correctCount ?? 0,
            wrong: day1WrongCount,
            studyTime: day1Summary?.studyTime ?? 0
          },
          {
            name: '2日目',
            correct: day2Summary?.correctCount ?? 0,
            wrong: day2WrongCount,
            studyTime: day2Summary?.studyTime ?? 0
          },
          {
            name: '3日目',
            correct: day3Summary?.correctCount ?? 0,
            wrong: day3WrongCount,
            studyTime: day3Summary?.studyTime ?? 0
          }
        ]
      };
      answerGraphSummaries.push(answerGraphSummary);
    }
  });

  // 事前テスト・事後テストの結果
  const preExaminationSummaries = await prisma.examinationSummary.findMany({
    where: {
      userId: userId,
      questionType: 2
    }
  });

  const postExaminationSummaries = await prisma.examinationSummary.findMany({
    where: {
      userId: userId,
      questionType: 3
    }
  });
  const prePostExaminationSummaries: PrePostExaminationType[] = [];
  graphTitles.map((graphTitle) => {
    const preExaminationSummary = preExaminationSummaries.find(
      (pre) => pre.categoryId === graphTitle.categoryId
    );
    const postExaminationSummary = postExaminationSummaries.find(
      (post) => post.categoryId === graphTitle.categoryId
    );
    if (preExaminationSummaries.length > 0) {
      const preWrongCount = preExaminationSummary
        ? preExaminationSummary.allQuestionCount - preExaminationSummary.correctCount
        : 0;
      const postWrongCount = postExaminationSummary
        ? postExaminationSummary.allQuestionCount - postExaminationSummary.correctCount
        : 0;

      const prePostExaminationSummary = {
        title: graphTitle.name,
        data: [
          {
            name: '事前ﾃｽﾄ',
            correct: preExaminationSummary?.correctCount ?? 0,
            wrong: preWrongCount
          },
          {
            name: '事後ﾃｽﾄ',
            correct: postExaminationSummary?.correctCount ?? 0,
            wrong: postWrongCount
          }
        ]
      };
      prePostExaminationSummaries.push(prePostExaminationSummary);
    }
  });

  return (
    <TopComponent
      categories={categories}
      answerGraphSummaries={answerGraphSummaries}
      prePostExaminationSummaries={prePostExaminationSummaries}
      userId={userId}
    />
  );
}

