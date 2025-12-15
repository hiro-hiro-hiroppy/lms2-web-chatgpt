'use client';
import { Button, styled, Tooltip, tooltipClasses, TooltipProps } from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import LmsModal from '@/lms-common/layout/lms-modal';
import { apiRequest } from '@/lib/api';
import { filter } from '@/lib/filter';
import {
  AnswerHistoryGetEntity,
  AnswerHistoryGetResponse,
  QuestionHistoryGetEntity
} from '@/app/api/log/answer_history/route';
import styles from './top-component.module.scss';
import { useRouter } from 'next/navigation';
import { Prisma } from '@prisma/client';

import {
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';

import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css'; // 標準テーマを読み込み
import './splide-custom.css';
import { LegendPayload } from 'recharts/types/component/DefaultLegendContent';

export type TopComponentProps = {
  categories: CategoryType[];
  userId?: number;
  answerGraphSummaries: AnswerGraphSummaryType[];
  prePostExaminationSummaries: PrePostExaminationType[];
};

export type AnswerGraphSummaryType = {
  title: string;
  data: { name: string; correct: number; wrong: number; studyTime: number }[];
};

export type PrePostExaminationType = {
  title: string;
  data: { name: string; correct: number; wrong: number }[];
};

export const categorySelect = Prisma.validator<Prisma.CategorySelect>()({
  id: true,
  categoryName: true,
  documents: true
});
export type CategoryType = Prisma.CategoryGetPayload<{ select: typeof categorySelect }>;

export default function TopComponent(props: TopComponentProps) {
  const { userId, categories, answerGraphSummaries, prePostExaminationSummaries } = props;
  const [isCreateQuestionModalOpen, setIsCreateQuestionModalOpen] = useState<boolean>(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [isQuestionHistoryModalOpen, setIsQuestionHistoryModalOpen] = useState<boolean>(false);
  const [answerHistories, setAnswerHistories] = useState<AnswerHistoryGetResponse>();
  const router = useRouter();

  // const data = [
  //   { day: '1日目', correct: 50, wrong: 20, studyTime: 42 }, // studyTime: 分
  //   { day: '2日目', correct: 50, wrong: 20, studyTime: 38 },
  //   { day: '3日目', correct: 50, wrong: 20, studyTime: 31 }
  // ];

  // const titles = ['前置詞', '接続詞', '修飾語', '前・接・修'];

  const colorList = ['rgb(25, 118, 210)', 'rgb(150,150,150)', '#0099FF'];
  const renderColorfulLegendText = (value: string, entry: LegendPayload, index: number) => {
    const color = colorList[index];
    return <span style={{ color }}>{value}</span>;
  };

  const num = (v: number) => v.toLocaleString('ja-JP');

  useEffect(() => {
    filter.hideFilter();
  }, []);

  const handleCreateReviewQuestion = async () => {
    // APIを実行 問題を作成
    const isCanChatGPT = parseInt(process.env.NEXT_PUBLIC_IS_CAN_CHATGPT ?? '');
    if (isCanChatGPT === 1) {
      const endPoint = (await process.env.NEXT_PUBLIC_CREATE_REVIEW_BY_CHATGPT) ?? '';
      // const result = await apiRequest(endPoint, 'POST', {
      //   user_id: props.userId
      // });
      fetch(endPoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: props.userId
        })
      });
    } else {
      const endPoint = (await process.env.NEXT_PUBLIC_CREATE_REVIEW_BY_IRT) ?? '';
      // const result = await apiRequest(endPoint, 'POST', {
      //   user_id: props.userId
      // });
      fetch(endPoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: props.userId
        })
      });
    }

    alert('おつかれさまでした。明日の勉強前に復習問題を実施してください。');
  };

  const handleRedirectReview = async () => {
    filter.showFilter();
    router.push('/review');
  };

  const handleOpenQuestionHistoryModal = async (categoryId: number) => {
    filter.showFilter();
    const data = await apiRequest(
      `/api/log/answer_history?userId=${userId}&categoryId=${categoryId}`,
      'GET'
    );

    setAnswerHistories(data as AnswerHistoryGetResponse);
    setIsQuestionHistoryModalOpen(true);
    filter.hideFilter();
  };

  return (
    <>
      {(answerGraphSummaries.length > 0 || prePostExaminationSummaries.length > 0) && (
        <div
          className=""
          style={{
            marginBottom: 40,
            maxWidth: '64rem',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        >
          <Splide
            options={{
              type: 'loop', // 無限ループ
              perPage: 1, // 1スライドずつ
              // rewind: true,
              pagination: true,
              arrows: true,
              speed: 800
            }}
            style={{ paddingBottom: 20 }}
          >
            {/* ① 各カテゴリー 日毎の成績グラフ */}
            {answerGraphSummaries.length > 0 && (
              <SplideSlide>
                <div className={styles.graph_slide}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-around',
                      // gap: '1rem',
                      height: '100%',
                      background: 'white',
                      borderRadius: '8px',
                      // padding: 12
                      border: '0.5px solid lightgray'
                    }}
                  >
                    {answerGraphSummaries.map((answerGraphSummary, index) => (
                      <div
                        style={{ width: '100%', height: 350, paddingTop: 8, paddingBottom: 8 }}
                        key={index}
                      >
                        <h5 style={{ textAlign: 'center' }}>{answerGraphSummary.title}</h5>
                        <ResponsiveContainer width="100%" height={320}>
                          <ComposedChart data={answerGraphSummary.data}>
                            {/* <CartesianGrid strokeDasharray="3 3" /> */}
                            <XAxis dataKey="name" fontSize={11} interval={0} />

                            {/* 左軸：正解/不正解（件） */}
                            <YAxis
                              yAxisId="left"
                              tick={{ fill: '#616161' }}
                              allowDecimals={false}
                              tickFormatter={(v) => `${num(v)}問`}
                              // domain={[0, 'dataMax + 100']}
                              fontSize={12}
                            >
                              {/* <Label value="件数" angle={-90} position="insideLeft" offset={10} /> */}
                            </YAxis>

                            {/* 右軸：勉強時間（分） */}
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              tick={{ fill: '#616161' }}
                              tickFormatter={(v) => `${num(v)}分`}
                              domain={[0, 'dataMax + 10']}
                              fontSize={12}
                            >
                              {/* <Label value="勉強時間（分）" angle={90} position="insideRight" offset={10} /> */}
                            </YAxis>

                            <ChartTooltip
                              itemSorter={(props) => {
                                if (props.dataKey === 'correct') return 1;
                                if (props.dataKey === 'wrong') return 2;
                                if (props.dataKey === 'studyTime') return 3;
                                return 99;
                              }}
                              formatter={(value, name, props) => {
                                const v = Number(value);
                                // 系列（dataKey）に応じて単位を付ける
                                if (props.dataKey === 'studyTime')
                                  return [`${num(v)} 分`, '勉強時間'];
                                if (props.dataKey === 'correct') return [`${num(v)} 問`, '正解数'];
                                if (props.dataKey === 'wrong') return [`${num(v)} 問`, '不正解数'];
                                return [num(v), name];
                              }}
                              // labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                              itemStyle={{ color: 'rgb(23, 23, 23)' }}
                            />

                            {/* <Legend formatter={renderColorfulLegendText} /> */}
                            <Legend
                              itemSorter={(props: LegendPayload) => {
                                if (props.dataKey === 'correct') return 1;
                                if (props.dataKey === 'wrong') return 2;
                                if (props.dataKey === 'studyTime') return 3;
                                return 99;
                              }}
                              formatter={renderColorfulLegendText}
                              wrapperStyle={{
                                fontSize: '12px' // ← フォントサイズ
                              }}
                              // wrapperStyle={{ color: '#616161', fontSize: 12 }}
                            />
                            {/* 積み上げ棒グラフ */}
                            <Bar
                              yAxisId="left"
                              dataKey="correct"
                              stackId="a"
                              fill="rgba(25, 118, 210, 0.8)"
                              name="正解数"
                            />
                            <Bar
                              yAxisId="left"
                              dataKey="wrong"
                              stackId="a"
                              fill="rgba(150,150,150, 0.3)"
                              name="不正解数"
                            />
                            {/* 折れ線グラフ */}
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="studyTime"
                              // stroke="rgb(128,128,128)"
                              stroke="#0099FF"
                              strokeWidth={2}
                              name="勉強時間"
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    ))}
                  </div>
                </div>
              </SplideSlide>
            )}

            {/* ②事前事後テストグラフ */}
            {prePostExaminationSummaries.length > 0 && (
              <SplideSlide>
                <div className={styles.graph_slide}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-around',
                      // gap: '1rem',
                      height: '100%',
                      background: 'white',
                      borderRadius: '8px',
                      // padding: 12
                      border: '0.5px solid lightgray'
                    }}
                  >
                    {prePostExaminationSummaries.map((prePostExaminationSummary, index) => (
                      <div
                        style={{ width: '100%', height: 350, paddingTop: 8, paddingBottom: 8 }}
                        key={index}
                      >
                        <h5 style={{ textAlign: 'center' }}>{prePostExaminationSummary.title}</h5>
                        <ResponsiveContainer width="100%" height={320}>
                          <ComposedChart data={prePostExaminationSummary.data}>
                            {/* <CartesianGrid strokeDasharray="3 3" /> */}
                            <XAxis dataKey="name" fontSize={11} interval={0} />
                            {/* <YAxis
                          domain={[0, 100]}
                          label={{
                            value: 'スコア(%)', // ← 縦軸のラベル名
                            angle: -90, // ← 縦書きに回転
                            position: 'insideLeft' // ← 左側に配置
                          }}
                        /> */}
                            <YAxis
                              yAxisId="left"
                              tick={{ fill: '#616161' }}
                              allowDecimals={false}
                              tickFormatter={(v) => `${num(v)}問`}
                              fontSize={12}
                            />
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              tick={{ fill: '#616161' }}
                              // tickFormatter={(v) => `${num(v)}分`}
                              // domain={[0, 'dataMax + 10']}
                              fontSize={12}
                            ></YAxis>
                            <ChartTooltip
                              itemSorter={(props) => {
                                if (props.dataKey === 'correct') return 1;
                                if (props.dataKey === 'wrong') return 2;
                                return 99;
                              }}
                              formatter={(value, name, props) => {
                                const v = Number(value);
                                // 系列（dataKey）に応じて単位を付ける
                                if (props.dataKey === 'correct') return [`${num(v)} 問`, '正解数'];
                                if (props.dataKey === 'wrong') return [`${num(v)} 問`, '不正解数'];
                                return [num(v), name];
                              }}
                              itemStyle={{ color: 'rgb(23, 23, 23)' }}
                            />
                            <Legend
                              itemSorter={(props: LegendPayload) => {
                                if (props.dataKey === 'correct') return 1;
                                if (props.dataKey === 'wrong') return 2;
                                return 99;
                              }}
                              formatter={renderColorfulLegendText}
                              wrapperStyle={{
                                fontSize: '12px' // ← フォントサイズ
                              }}
                            />
                            {/* <Bar dataKey="cpr" name="事前テスト" fill="#8884d8" />
                        <Bar dataKey="post" name="事後テスト" fill="#82ca9d" /> */}
                            <Bar
                              yAxisId="left"
                              dataKey="correct"
                              stackId="a"
                              fill="rgba(25, 118, 210, 0.8)"
                              name="正解数"
                            />
                            <Bar
                              yAxisId="left"
                              dataKey="wrong"
                              stackId="a"
                              fill="rgba(150,150,150, 0.3)"
                              name="不正解数"
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    ))}
                  </div>
                </div>
              </SplideSlide>
            )}
          </Splide>
        </div>
      )}

      <div className={styles.create_question_button_group}>
        <div style={{ marginLeft: 10 }}>
          <p>
            1.
            学習終了時、横田宛にMatterMostかLINEで、「本日の学習を終了します」と連絡してください。
          </p>
          <p>2. 2日目以降は「復習問題を実施」を押して復習してから、学習を開始してください。</p>
          <p>3. 3日目の学習終了後に、復習テスト{'(3日目分)'} → 事後テストを行います。</p>
        </div>
        <div className={styles.create_question_button_div}>
          {/* <Button
            variant="outlined"
            style={{
              marginRight: '10px',
              // background: '#dc3545'
              background: '#fff'
            }}
            onClick={() => setIsCreateQuestionModalOpen(true)}
          >
            今日の学習を終了
          </Button> */}
          <Button
            variant="outlined"
            style={{
              // background: '#dc3545'
              background: '#fff'
            }}
            onClick={() => setIsReviewModalOpen(true)}
          >
            復習問題を実施
          </Button>
        </div>
      </div>
      {categories.map((category) => (
        <div className={styles.category_group} key={category.id}>
          <div className={styles.category_name}>
            <h3>{category.categoryName}</h3>
          </div>
          <div className={styles.category_button_group}>
            <Link
              href={`/document/${category.id}`}
              onClick={() => {
                filter.showFilter();
              }}
              style={{
                marginRight: '5px',
                pointerEvents: category.documents.length === 0 ? 'none' : 'auto'
              }}
            >
              <Button
                variant="contained"
                color="primary"
                disabled={category.documents.length === 0}
              >
                資料
              </Button>
            </Link>

            <Link
              href={`/question/${category.id}`}
              passHref
              onClick={filter.showFilter}
              style={{ marginRight: '5px' }}
            >
              <Button variant="contained" color="primary">
                過去問
              </Button>
            </Link>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenQuestionHistoryModal(category.id)}
            >
              成績
            </Button>
          </div>
        </div>
      ))}

      {ConfirmCreateQuestionModal()}
      {ConfirmReviewModal()}
      {QuestionHistoryModal()}
    </>
  );

  // 復習問題生成確認モーダル
  function ConfirmCreateQuestionModal() {
    return (
      <LmsModal
        open={isCreateQuestionModalOpen}
        onClose={() => setIsCreateQuestionModalOpen(false)}
        title="学習終了"
        description={
          <div>
            本日の学習を終了しますか？
            <br />
            （復習問題の生成を開始します）
          </div>
        }
        onConfirm={handleCreateReviewQuestion}
      />
    );
  }

  // 復習問題実施モーダル
  function ConfirmReviewModal() {
    return (
      <LmsModal
        open={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="復習問題"
        description="復習問題を実施しますか？"
        onConfirm={handleRedirectReview}
      />
    );
  }

  // 解答履歴モーダル
  function QuestionHistoryModal() {
    const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
      <Tooltip {...props} classes={{ popper: className }} />
    ))({
      [`& .${tooltipClasses.tooltip}`]: {
        maxWidth: '400px'
      }
    });

    const orderAscAnswerHistories = (answerHistories: AnswerHistoryGetEntity[]) => {
      // const sortAnswerHistories = answerHistories.sort(
      //   (a, b) => new Date(a.answerTime).getTime() - new Date(b.answerTime).getTime()
      // );
      const answerLast5Histories = [];

      for (let i = answerHistories.length; i < 5; i++) {
        answerLast5Histories.push({ answerResult: 999, answerTime: new Date() });
      }

      return answerHistories.map((answerHistory, index) => {
        let answerStr = '';
        let answerClass = '';
        const answerDate = answerHistory.answeredTime;

        if (answerHistory.isCorrect) {
          answerStr = '○';
          answerClass = styles.answer_incorrect;
        } else if (!answerHistory.isCorrect) {
          answerStr = '×';
          answerClass = styles.answer_correct;
        } else {
          answerStr = '';
          answerClass = styles.answer_skip;
          // answerDate = '';
        }

        return (
          <div className={answerClass} key={index}>
            <div>{answerStr}</div>
            <div>{answerDate}</div>
          </div>
        );
      });
    };

    const answerDiv = (question: QuestionHistoryGetEntity, answer: string | null) => {
      let answerDivContent = '';

      switch (answer) {
        case 'A':
          answerDivContent = `A. ${question.optionA}`;
          break;
        case 'B':
          answerDivContent = `B. ${question.optionB}`;
          break;
        case 'C':
          answerDivContent = `C. ${question.optionC}`;
          break;
        case 'D':
          answerDivContent = `D. ${question.optionD}`;
          break;
        default:
          break;
      }
      return <div>{answerDivContent}</div>;
    };

    return (
      <LmsModal
        open={isQuestionHistoryModalOpen}
        onClose={() => setIsQuestionHistoryModalOpen(false)}
        title="成績"
        description={
          <>
            {/* <p>チェックした問題を復習することができます</p>
            <p>※復習する場合は、過去問の進捗がリセットされるのでご注意ください</p>
            <br /> */}
            {answerHistories?.questionHistories && (
              <div className={styles.table_container}>
                <table>
                  <thead>
                    <tr>
                      {/* <th></th> */}
                      <th>No.</th>
                      <th style={{ width: 200 }}>問題</th>
                      <th>解答</th>
                      <th>成績（最新5回）</th>
                    </tr>
                  </thead>
                  <tbody>
                    {answerHistories?.questionHistories.map((questionHistory, index) => {
                      return (
                        <tr key={index} style={{ height: 50 }}>
                          {/* <td>
                            <Checkbox
                              value={questionHistory.questionId}
                              checked={checkedQuestions.includes(questionHistory.questionId)}
                              onChange={handleToggle}
                            />
                          </td> */}
                          <td>{questionHistory.questionNo}</td>
                          {/* <td>{new Date(answerHistory.answerTime).toLocaleString('ja')}</td> */}
                          <td>
                            <NoMaxWidthTooltip
                              title={
                                // <img
                                //   src={`/question/${questionHistory.financialYear}/${questionHistory.imagePath}`}
                                //   alt={`解答：{questionHistory.answer}`}
                                //   style={{ width: '400px', height: 'auto' }}
                                // />
                                <div>
                                  {questionHistory.questionSentence}
                                  <br />
                                  <div>A. {questionHistory.optionA}</div>
                                  <div>B. {questionHistory.optionB}</div>
                                  <div>C. {questionHistory.optionC}</div>
                                  <div>D. {questionHistory.optionD}</div>
                                </div>
                              }
                              placement="top"
                              arrow
                            >
                              <div
                                style={{
                                  whiteSpace: 'nowrap',
                                  textOverflow: 'ellipsis',
                                  maxWidth: 200,
                                  overflow: 'hidden'
                                }}
                              >
                                <Link href="#">{questionHistory.questionSentence}</Link>
                              </div>
                            </NoMaxWidthTooltip>
                            {/* {questionHistory.questionSentence} */}
                          </td>
                          <td style={{ textAlign: 'left' }}>
                            {answerDiv(questionHistory, questionHistory.answer)}
                          </td>
                          <td>
                            <div style={{ display: 'flex' }}>
                              {/* {questionHistory.answerHistories} */}
                              {orderAscAnswerHistories(questionHistory.answerHistories)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        }
        // onConfirm={handleRedirectReview}
        cancelText="閉じる"
        confirmText=""
        // confirmDisabled={checkedQuestions.length === 0}
      />
    );
  }
}

