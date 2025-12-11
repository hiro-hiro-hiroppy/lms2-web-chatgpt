'use client';
import {
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Tooltip
} from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './review-component.module.scss';
import { apiRequest } from '@/lib/api';
import { filter } from '@/lib/filter';
import { Prisma, CreatedQuestion, CreatedQuestionStatus, AnswerSummary } from '@prisma/client';

import {
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import type { LegendPayload } from 'recharts/types/component/DefaultLegendContent';

import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css'; // 標準テーマを読み込み
import './splide-custom.css';
import { ContentCopy } from '@mui/icons-material';

export type ReviewComponentProps = {
  createdQuestionStatuses: CreatedQuestionStatus[];
  createdQuestions: CreatedQuestion[];
  userId?: number;
  // wordSummaries: WordSummaryWithCategory[];
  category7WordSummaries: WordSummaryWithCategory[];
  category8WordSummaries: WordSummaryWithCategory[];
  category9WordSummaries: WordSummaryWithCategory[];
  category10WordSummaries: WordSummaryWithCategory[];
  answerSummaries: AnswerSummary[];
};

type questionMenuItem = {
  stautsId: number;
  dayCount: number;
};

type WordSummaryWithCategory = Prisma.WordSummaryGetPayload<{
  include: { category: true };
}>;

type GraphType = {
  categoryName: string;
  data: GraphDataType[];
};

type GraphDataType = {
  word: string;
  correct: number;
  wrong: number;
};

export default function ReviewComponent(props: ReviewComponentProps) {
  const {
    createdQuestionStatuses,
    createdQuestions,
    category7WordSummaries,
    category8WordSummaries,
    category9WordSummaries,
    category10WordSummaries
    // answerSummaries,
    // userId
  } = props;

  // 問題
  const [questions, setQuestions] = useState<CreatedQuestion[]>([]);
  const [currentQuestions, setCurrentQuestions] = useState<CreatedQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0); // 経過時間

  // 解答結果
  const [answerValue, setAnswerValue] = useState<string>('');
  const [answerResults, setAnswerResults] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isAllAnswered, setIsAllAnswered] = useState<boolean>(false);

  // 問題選択プルダウン
  const [questionMenuItems, setQuestionMenuItems] = useState<questionMenuItem[]>([]);
  const [questionMenuItemIndex, setQuestionMenuItemIndex] = useState<number>(0);

  // グラフ
  const [category7WordGraphData, setCategory7WordGraphData] = useState<GraphType>();
  const [category8WordGraphData, setCategory8WordGraphData] = useState<GraphType>();
  const [category9WordGraphData, setCategory9WordGraphData] = useState<GraphType>();
  const [category10WordGraphData, setCategory10WordGraphData] = useState<GraphType>();

  useEffect(() => {
    filter.hideFilter();
  }, []);

  useEffect(() => {
    if (createdQuestionStatuses.length === 0 || createdQuestions.length === 0) return;
    setQuestions(createdQuestions);

    // 日毎にプルダウンメニューを追加
    // ラストの日付の値を設定
    const n = createdQuestionStatuses.length;
    const questionMenuItems: questionMenuItem[] = [];
    for (let i = 0; i < n; i++) {
      const questionMenuItem: questionMenuItem = {
        stautsId: createdQuestionStatuses[i].id,
        dayCount: createdQuestionStatuses[i].dayCount
      };
      questionMenuItems.push(questionMenuItem);
    }
    setQuestionMenuItems(questionMenuItems);
    setQuestionMenuItemIndex(n - 1);

    const currentQuestions = createdQuestions.filter(
      (q) => q.questionStatusId === questionMenuItems[n - 1].stautsId
    );
    setCurrentQuestions(currentQuestions);
  }, [createdQuestionStatuses, createdQuestions]);

  // タイマー記録用
  useEffect(() => {
    // 一旦elapsedをリセット
    setElapsed(0);

    // タイマーを記録
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - start) / 1000); // 秒単位
      setElapsed(elapsedTime);
    }, 1000);

    return () => clearInterval(timer); // クリーンアップ
  }, [questionIndex, questionMenuItemIndex]);

  useEffect(() => {
    const createGraphdata = (
      summaries: WordSummaryWithCategory[],
      categoryName: string,
      statusId: number
    ) => {
      const wordSummaries = summaries.filter((summary) => summary.questionStatusId === statusId);
      const graphData: GraphType = { categoryName: categoryName, data: [] };
      for (const wordSummary of wordSummaries) {
        const row = {
          word: wordSummary.word,
          correct: wordSummary.correctCount,
          wrong: wordSummary.allQuestionCount - wordSummary.correctCount
        };
        graphData.data.push(row);
      }
      return graphData;
    };

    if (questionMenuItems.length > 0) {
      const statusId = questionMenuItems[questionMenuItemIndex].stautsId;

      // categoryごとに
      const category7GraphData = createGraphdata(category7WordSummaries, '前置詞', statusId);
      const category8GraphData = createGraphdata(category8WordSummaries, '接続詞', statusId);
      const category9GraphData = createGraphdata(category9WordSummaries, '修飾語', statusId);
      const category10GraphData = createGraphdata(category10WordSummaries, '前・接・修', statusId);

      setCategory7WordGraphData(category7GraphData);
      setCategory8WordGraphData(category8GraphData);
      setCategory9WordGraphData(category9GraphData);
      setCategory10WordGraphData(category10GraphData);
    }
  }, [questionMenuItemIndex]);

  const handleChangeQuestionMenu = async (e: SelectChangeEvent) => {
    e.preventDefault();
    const selectValue = Number(e.target.value);
    setQuestionMenuItemIndex(selectValue);

    // 全解除
    const currentQuestionMenu = questionMenuItems[selectValue];
    const currentQuestions = createdQuestions.filter(
      (q) => q.questionStatusId === currentQuestionMenu.stautsId
    );

    setCurrentQuestions(currentQuestions);
    setQuestionIndex(0);
    setAnswerValue('');
    setIsAnswered(false);
    setIsCorrect(false);
    setAnswerResults([]);
    setIsAllAnswered(false);
  };

  const handleNextQuestion = async () => {
    setAnswerValue('');
    setIsAnswered(false);
    setIsCorrect(false);

    if (questionIndex + 1 < currentQuestions.length) {
      setQuestionIndex((index) => index + 1);
    } else {
      setIsAllAnswered(true);
    }
  };

  const handleAnswered = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.value;
    setAnswerValue(selected);
    setAnswerResults([...answerResults, selected]);
    setIsAnswered(true);

    const isCorrect = selected === currentQuestions[questionIndex].answer;
    if (isCorrect) {
      setIsCorrect(true);
    }

    // DBに登録
    await apiRequest('/api/log/created_answer_history', 'POST', {
      questionId: currentQuestions[questionIndex].id,
      answerResult: selected,
      answerDuration: elapsed
    });
  };

  const handleStartOver = () => {
    setQuestionIndex(0);
    setAnswerValue('');
    setIsAnswered(false);
    setIsCorrect(false);
    // setIsFinished(false);
    setAnswerResults([]);
    setIsAllAnswered(false);
  };

  const answerDiv = (question: CreatedQuestion, answer: string) => {
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

  const answerLabel = (answer: string, word: string, isCopy: boolean = true) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* ラベル文字部分を固定幅にする */}
        <div style={{ width: 150, whiteSpace: 'nowrap' }}>{`${answer}. ${word}`}</div>

        {/* アイコンボタンをラベル内に置く */}
        {isCopy && (
          <Tooltip title="単語をコピー" placement="right">
            <IconButton
              // size="small"
              style={{
                width: 40
              }}
              onClick={async (e) => {
                e.stopPropagation(); // ← ラジオ選択のクリックと区別する
                // alert('A の説明を表示');
                await navigator.clipboard.writeText(word);
              }}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        style={{
          width: '100%',
          maxWidth: '800px',
          margin: 'auto',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <Link href="/top" passHref>
            <Button variant="contained" color="primary">
              戻る
            </Button>
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <FormControl size="small" style={{ width: 110 }}>
            <InputLabel id="question_no_label">日数</InputLabel>
            <Select
              labelId="question_no_label"
              label="日数"
              value={String(questionMenuItemIndex)}
              onChange={handleChangeQuestionMenu}
            >
              {questionMenuItems.map((value, index) => (
                <MenuItem key={index} value={index}>
                  {value.dayCount}日目
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div style={{ marginTop: '5px' }}>
            {questionIndex + 1}問目 / {currentQuestions?.length}問中
          </div>
        </div>
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNextQuestion}
            disabled={!isAnswered}
          >
            次へ
          </Button>
        </div>
      </div>
      <div
        style={{
          // marginTop: '10px',
          maxWidth: '800px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          margin: 'auto',
          marginTop: '20px'
        }}
      >
        {currentQuestions != null && currentQuestions.length > 0 && (
          <>
            {/* 問題解答 */}
            {!isAllAnswered && (
              <>
                <div
                  style={{
                    background: 'white',
                    padding: '12px',
                    minHeight: 70,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {currentQuestions[questionIndex].questionSentence}
                </div>

                <FormControl style={{ marginTop: '20px', marginLeft: '20px' }}>
                  <RadioGroup
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    value={answerValue}
                    onChange={handleAnswered}
                  >
                    <FormControlLabel
                      value="A"
                      control={<Radio />}
                      // label={}
                      label={answerLabel('A', currentQuestions[questionIndex].optionA)}
                      disabled={isAnswered}
                      style={{ marginRight: '40px', maxWidth: 200 }}
                    />
                    <FormControlLabel
                      value="B"
                      control={<Radio />}
                      label={answerLabel('B', currentQuestions[questionIndex].optionB)}
                      disabled={isAnswered}
                      style={{ marginRight: '40px', maxWidth: 200 }}
                    />
                    <FormControlLabel
                      value="C"
                      control={<Radio />}
                      label={answerLabel('C', currentQuestions[questionIndex].optionC)}
                      disabled={isAnswered}
                      style={{ marginRight: '40px', maxWidth: 200 }}
                    />
                    <FormControlLabel
                      value="D"
                      control={<Radio />}
                      label={answerLabel('D', currentQuestions[questionIndex].optionD)}
                      disabled={isAnswered}
                      style={{ marginRight: '40px', maxWidth: 200 }}
                    />
                    <FormControlLabel
                      value="E"
                      control={<Radio />}
                      label={answerLabel('E', 'わからない', false)}
                      disabled={isAnswered}
                      style={{ marginRight: '40px', maxWidth: 200 }}
                    />
                  </RadioGroup>
                </FormControl>
                {isAnswered && (
                  <div style={{ marginLeft: '20px' }}>
                    {isCorrect && <h3 style={{ color: 'red', marginTop: 30 }}>正解!!!</h3>}
                    {!isCorrect && <h3 style={{ color: 'blue', marginTop: 30 }}>不正解…</h3>}
                    <div style={{ marginTop: 30 }}>
                      <span style={{ fontWeight: 'bold' }}>正解：</span>
                      {currentQuestions[questionIndex].answer}
                    </div>
                    <div style={{ marginTop: 20 }}>
                      <span style={{ fontWeight: 'bold' }}>訳：</span>
                      {currentQuestions[questionIndex].translation}
                    </div>

                    <div style={{ marginTop: 20, marginBottom: 20 }}>
                      <span style={{ fontWeight: 'bold' }}>解説：</span>
                      {currentQuestions[questionIndex].explanation}
                    </div>
                  </div>
                )}
              </>
            )}
            {/* 問題結果 */}
            {isAllAnswered && (
              <>
                <div
                  className=""
                  style={{
                    marginBottom: 40,
                    maxWidth: '64rem',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}
                >
                  <div>
                    <p>結果を見た後、事後アンケートを実施してください。</p>
                    <p>{process.env.NEXT_PUBLIC_REVIEW_QUESTIONNAIRE ?? ''}</p>
                    <br />
                  </div>
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
                    {GraphSlide(category7WordGraphData)}
                    {GraphSlide(category8WordGraphData)}
                    {GraphSlide(category9WordGraphData)}
                    {GraphSlide(category10WordGraphData)}
                  </Splide>
                </div>

                <table className={styles.answer_result_table}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>No.</th>
                      <th style={{ width: '70px' }}>結果</th>
                      <th style={{ width: 'calc(100% - 330px)' }}>問題</th>
                      <th style={{ width: '110px' }}>正解</th>
                      <th style={{ width: '110px' }}>
                        あなた
                        <br />
                        の解答
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentQuestions.map((currentQuestion, index) => (
                      <tr key={index}>
                        <td style={{ textAlign: 'center' }}>{currentQuestion.questionNo}</td>
                        <td style={{ textAlign: 'center' }}>
                          {currentQuestion.answer === answerResults[index] && (
                            <h4 style={{ color: 'red' }}>正解</h4>
                          )}
                          {currentQuestion.answer !== answerResults[index] && (
                            <h4 style={{ color: 'blue' }}>不正解</h4>
                          )}
                        </td>
                        <td>
                          <div>{currentQuestion.questionSentence}</div>
                          <div style={{ marginTop: '8px' }}>{currentQuestion.translation}</div>
                          <div style={{ marginTop: '8px' }}>{currentQuestion.reason}</div>
                        </td>
                        <td>{answerDiv(currentQuestion, currentQuestion.answer)}</td>
                        <td>{answerDiv(currentQuestion, answerResults[index])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div
                  style={{
                    marginTop: '10px',
                    marginBottom: '10px',
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}
                >
                  <Button variant="contained" color="primary" onClick={handleStartOver}>
                    最初からやり直す
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

function GraphSlide(graphData?: GraphType) {
  const num = (v: number) => v.toLocaleString('ja-JP');

  const colorList = ['rgb(25, 118, 210)', 'rgb(150,150,150)', '#0099FF'];
  const renderColorfulLegendText = (value: string, entry: LegendPayload, index: number) => {
    const color = colorList[index];
    return <span style={{ color }}>{value}</span>;
  };

  if (!graphData) return <></>;

  return (
    <SplideSlide>
      <div className={styles.graph_slide}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            height: '100%',
            background: 'white',
            borderRadius: '8px',
            border: '0.5px solid lightgray',
            width: '100%'
          }}
        >
          <div
            style={{
              width: '100%',
              height: 350,
              paddingTop: 8,
              paddingBottom: 8
            }}
          >
            <h5 style={{ textAlign: 'center' }}>{`${graphData.categoryName} 単語別成績`}</h5>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={graphData.data}>
                {/* <CartesianGrid strokeDasharray="3 3" /> */}
                <XAxis dataKey="word" fontSize={11} interval={0} dy={10} />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: '#616161' }}
                  allowDecimals={false}
                  tickFormatter={(v) => `${num(v)}問`}
                  fontSize={12}
                />
                {/* <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fill: '#616161' }}
                                    // tickFormatter={(v) => `${num(v)}分`}
                                    // domain={[0, 'dataMax + 10']}
                                    fontSize={12}
                                  ></YAxis> */}
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
        </div>
      </div>
    </SplideSlide>
  );
}

