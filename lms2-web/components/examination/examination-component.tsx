'use client';
import { Button, FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { useEffect, useState } from 'react';
import styles from './examination-component.module.scss';
import { apiRequest } from '@/lib/api';
import { filter } from '@/lib/filter';
import LmsModal from '@/lms-common/layout/lms-modal';
import { Question } from '@prisma/client';
import {
  ExaminationHistoryPostResponse,
  ExaminationResultType,
  ExaminationSummaryType,
  QuestionAnswerResult
} from '@/app/api/log/examination_history/route';

export type ExaminationComponentProps = {
  examQuestions: Question[];
  userId?: number;
  questionType: number;
};

type AnswerResultType = {
  answerResult: string;
  duration: number;
};

export default function ExaminationComponent(props: ExaminationComponentProps) {
  const { examQuestions, userId, questionType } = props;

  // 空の解答結果
  // const answerResultsEmpty = Array.from({ length: examQuestions.length }, () => '');

  const [isStart, setIsStart] = useState<boolean>(false);
  // 問題
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0); // 経過時間
  // 解答結果
  const [isEndExaminationModalOpen, setIsEndExaminationModalOpen] = useState<boolean>(false);
  const [answerValue, setAnswerValue] = useState<string>('');
  const [answerResults, setAnswerResults] = useState<AnswerResultType[]>(
    Array.from({ length: examQuestions.length }, () => ({ answerResult: '', duration: 0 }))
  );
  const [isEndExamination, setIsEndExamination] = useState<boolean>(false);
  const [examinationResults, setExaminationResults] = useState<ExaminationResultType[]>([]);
  const [examinationSummaries, setExaminationSummaries] = useState<ExaminationSummaryType[]>([]);

  useEffect(() => {
    filter.hideFilter();

    // ページを離れることへの対策
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // e.returnValue = ''; // Chromeなどで警告を出すために必要
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (examQuestions.length === 0) return;
    setQuestions(examQuestions);
  }, [examQuestions]);

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
  }, [questionIndex]);

  const handleNextBeforeQuestion = async (addCount: number) => {
    const newQuestionIndex = questionIndex + addCount;
    setQuestionIndex(newQuestionIndex);

    const beforeValue = answerResults[newQuestionIndex].answerResult;
    if (beforeValue) {
      setAnswerValue(beforeValue);
    } else {
      setAnswerValue('');
    }
  };

  const handleAnswered = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.value;
    setAnswerValue(selected);

    // 結果を保存
    setAnswerResults((prev) => {
      const copy = [...prev]; // ← 配列をコピー
      copy[questionIndex].answerResult = selected; // ← 指定位置だけ更新
      copy[questionIndex].duration += elapsed;
      return copy; // ← 新しい配列を返す
    });
  };

  const handleEndExamination = async () => {
    // APIを実行 問題を作成
    // const isCanChatGPT = parseInt(process.env.NEXT_PUBLIC_IS_CAN_CHATGPT ?? '');
    // if (isCanChatGPT === 1) {
    //   const endPoint = (await process.env.NEXT_PUBLIC_CREATE_REVIEW_BY_CHATGPT) ?? '';
    //   const result = await apiRequest(endPoint, 'POST', {
    //     user_id: props.userId
    //   });
    // } else {
    //   const endPoint = (await process.env.NEXT_PUBLIC_CREATE_REVIEW_BY_IRT) ?? '';
    //   const result = await apiRequest(endPoint, 'POST', {
    //     user_id: props.userId
    //   });
    // }
    //alert('おつかれさまでした。明日の勉強前に復習問題を実施してください。');
    filter.showFilter();

    const qaList: QuestionAnswerResult[] = [];
    for (let i = 0; i < questions.length; i++) {
      const qa = {
        questionId: questions[i].id,
        answerResult: answerResults[i].answerResult,
        duration: answerResults[i].duration
      } as QuestionAnswerResult;
      qaList.push(qa);
    }

    const response: ExaminationHistoryPostResponse = await apiRequest(
      '/api/log/examination_history',
      'POST',
      {
        userId: userId,
        questionType: questionType,
        qaList: qaList
      }
    );

    setExaminationResults(response.examinationResults);
    setExaminationSummaries(response.examinationSummaries);

    setIsEndExamination(true);
    filter.hideFilter();
  };

  const answerDiv = (question: Question, answer: string | null) => {
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
    <>
      {!isEndExamination && (
        <>
          {!isStart && questionType === 2 && (
            <div
              style={{
                width: '100%',
                maxWidth: '620px',
                margin: 'auto',
                // display: 'flex',
                // justifyContent: 'flex-end'
                background: 'white',
                paddingTop: 30,
                paddingLeft: 10,
                paddingRight: 10,
                paddingBottom: 30,
                borderRadius: 10
              }}
            >
              <h2 style={{ display: 'flex', justifyContent: 'center' }}>TOEIC Part5 事前テスト</h2>
              <h3 style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
                「始めてください」の合図があるまでは、開始しないでください。
              </h3>

              <div style={{ marginTop: 30, marginLeft: 30 }}>
                <p>注意事項</p>
                <ul style={{ listStyle: 'none' }}>
                  <li>1. 4択穴埋め形式の文法問題60問が出題されます。</li>
                  <li>2. 時間は30分です。</li>
                  <li>3. 「始めてください」の合図後、「解答を開始する」ボタンを押してください。</li>
                  <li>4. 最後の問題が終了した後、「解答を終了する」ボタンを押すと結果が出ます。</li>
                  <li>5. 解答結果を確認後、事前テストアンケートを実施してください。</li>
                </ul>
              </div>
              <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={questions.length === 0}
                  onClick={() => setIsStart(true)}
                >
                  解答を開始する
                </Button>
              </div>
            </div>
          )}

          {!isStart && questionType === 3 && (
            <div
              style={{
                width: '100%',
                maxWidth: '620px',
                margin: 'auto',
                // display: 'flex',
                // justifyContent: 'flex-end'
                background: 'white',
                paddingTop: 30,
                paddingLeft: 10,
                paddingRight: 10,
                paddingBottom: 30,
                borderRadius: 10
              }}
            >
              <h2 style={{ display: 'flex', justifyContent: 'center' }}>TOEIC Part5 事後テスト</h2>
              <h3 style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
                「始めてください」の合図があるまでは、開始しないでください。
              </h3>

              <div style={{ marginTop: 30, marginLeft: 30 }}>
                <p>注意事項</p>
                <ul style={{ listStyle: 'none' }}>
                  <li>1. 4択穴埋め形式の文法問題60問が出題されます。</li>
                  <li>2. 時間は30分です。</li>
                  <li>3. 「始めてください」の合図後、「解答を開始する」ボタンを押してください。</li>
                  <li>4. 最後の問題が終了した後、「解答を終了する」ボタンを押すと結果が出ます。</li>
                  <li>5. 解答結果を確認後、事前テストアンケートを実施してください。</li>
                </ul>
              </div>
              <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={questions.length === 0}
                  onClick={() => setIsStart(true)}
                >
                  解答を開始する
                </Button>
              </div>
            </div>
          )}

          {isStart && (
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
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleNextBeforeQuestion(-1)}
                    disabled={questionIndex === 0}
                  >
                    前へ
                  </Button>
                </div>
                <div>
                  {questionIndex + 1}問目 / {questions?.length}問中
                </div>
                <div>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleNextBeforeQuestion(+1)}
                    disabled={questionIndex + 1 === questions.length}
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
                {questions != null && questions.length > 0 && (
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
                      {questions[questionIndex].questionSentence}
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
                          label={'A. ' + questions[questionIndex].optionA}
                          style={{ marginRight: '40px' }}
                        />
                        <FormControlLabel
                          value="B"
                          control={<Radio />}
                          label={'B. ' + questions[questionIndex].optionB}
                          style={{ marginRight: '40px' }}
                        />
                        <FormControlLabel
                          value="C"
                          control={<Radio />}
                          label={'C. ' + questions[questionIndex].optionC}
                          style={{ marginRight: '40px' }}
                        />
                        <FormControlLabel
                          value="D"
                          control={<Radio />}
                          label={'D. ' + questions[questionIndex].optionD}
                          style={{ marginRight: '40px' }}
                        />
                      </RadioGroup>
                    </FormControl>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        maxWidth: 800,
                        marginTop: 30
                      }}
                    >
                      {answerResults.map((value, index) => (
                        <div key={index} style={{ border: '1px solid black', width: 52.5 }}>
                          <div
                            style={{
                              borderBottom: '1px solid black',
                              height: 20,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              background: 'lightgray'
                            }}
                          >
                            {index + 1}
                          </div>
                          <div
                            style={{
                              height: 20,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}
                          >
                            {value.answerResult}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        margin: 10
                      }}
                    >
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => setIsEndExaminationModalOpen(true)}
                        // disabled={questionIndex + 1 === questions.length}
                      >
                        解答を終了する
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </>
      )}

      {isEndExamination && (
        <>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ display: 'flex', justifyContent: 'center' }}>解答結果</h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {examinationSummaries.map((examinationSummary) => (
                <div key={examinationSummary.id}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: 260 }}>{examinationSummary.category.categoryName}</div>
                    <div style={{ width: 30 }}> : </div>
                    <div style={{ width: 100 }}>
                      {examinationSummary.correctCount}
                      {' / '} {examinationSummary.allQuestionCount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <table className={styles.answer_result_table}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>No.</th>
                <th style={{ width: '70px' }}>結果</th>
                <th style={{ width: 'calc(100% - 330px)' }}>問題</th>
                <th style={{ width: '150px' }}>問題の種類</th>
                <th style={{ width: '110px' }}>正解</th>
                <th style={{ width: '110px' }}>
                  あなた
                  <br />
                  の解答
                </th>
              </tr>
            </thead>
            <tbody>
              {examinationResults.map((examinationResult, index) => (
                <tr key={index}>
                  <td style={{ textAlign: 'center' }}>{examinationResult.question.questionNo}</td>
                  <td style={{ textAlign: 'center' }}>
                    {examinationResult.question.answer === examinationResult.answerResult && (
                      <h4 style={{ color: 'red' }}>正解</h4>
                    )}
                    {examinationResult.question.answer !== examinationResult.answerResult && (
                      <h4 style={{ color: 'blue' }}>不正解</h4>
                    )}
                  </td>
                  <td>
                    <div>{examinationResult.question.questionSentence}</div>
                    <div style={{ marginTop: '8px' }}>{examinationResult.question.translation}</div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div>{examinationResult.question.category.categoryName}</div>
                  </td>
                  <td>
                    {answerDiv(examinationResult.question, examinationResult.question.answer)}
                  </td>
                  <td>{answerDiv(examinationResult.question, examinationResult.answerResult)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {ConfirmEndExaminationModal()}
    </>
  );

  // 復習問題生成確認モーダル
  function ConfirmEndExaminationModal() {
    return (
      <LmsModal
        open={isEndExaminationModalOpen}
        onClose={() => setIsEndExaminationModalOpen(false)}
        title="試験終了の確認"
        description={
          <div>
            <p style={{ marginTop: 20 }}>試験を終了しますか？</p>
            <p>（OKを押すと、解答結果が表示されます。）</p>
          </div>
        }
        onConfirm={handleEndExamination}
      />
    );
  }
}

