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
import styles from './question-component.module.scss';
import { apiRequest } from '@/lib/api';
import { filter } from '@/lib/filter';
import { Question } from '@prisma/client';
import ContentCopy from '@mui/icons-material/ContentCopy';

export type QuestionComponentProps = {
  questions: Question[];
  userId?: number;
  lastQuestionNo?: number;
};

// export type Question = {
//   id: number;
//   questionId: number;
//   financialYear: number;
//   imagePath: string;
//   answer: string;
//   isAnswered: boolean;
//   answerSentence: string;
// };

// export type question = Prisma.Question;

type questionMenuItem = {
  firstQuestionNo: number;
  lastQuestionNo: number;
};

export default function QuestionComponent(props: QuestionComponentProps) {
  const userId = props.userId;

  // 問題
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0); // 経過時間
  // 解答結果
  const [answerValue, setAnswerValue] = useState<string>('');
  const [answerResults, setAnswerResults] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  // const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isAllAnswered, setIsAllAnswered] = useState<boolean>(false);
  // 問題選択プルダウン
  const [questionMenuItems, setQuestionMenuItems] = useState<questionMenuItem[]>([]);
  const [questionMenuItemIndex, setQuestionMenuItemIndex] = useState<number>(0);

  useEffect(() => {
    filter.hideFilter();
  }, []);

  useEffect(() => {
    if (props.questions.length === 0) return;
    setQuestions(props.questions);

    // 10件ごとに問題No.プルダウンを設定
    const n = props.questions.length;
    const questionMenuItems: questionMenuItem[] = [];
    for (let i = 0; i < n; i += 10) {
      const menuFirstQuestionNo = props.questions[i].questionNo;
      let menuLastQuestionNo = 0;

      if (n > i + 9) {
        menuLastQuestionNo = props.questions[i + 9].questionNo;
      } else {
        menuLastQuestionNo = props.questions[n - 1].questionNo;
      }

      const questionMenuItem: questionMenuItem = {
        firstQuestionNo: menuFirstQuestionNo,
        lastQuestionNo: menuLastQuestionNo
      };
      questionMenuItems.push(questionMenuItem);
    }
    setQuestionMenuItems(questionMenuItems);

    // 問題を解いていなければ
    const currentQuestionNoSet = questionMenuItems[0];
    const currentQuestions = props.questions.filter(
      (q) =>
        q.questionNo >= currentQuestionNoSet.firstQuestionNo &&
        q.questionNo <= currentQuestionNoSet.lastQuestionNo
    );
    setCurrentQuestions(currentQuestions);
    setQuestionMenuItemIndex(0);
  }, [props.questions]);

  useEffect(() => {}, [questionMenuItemIndex]);

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

  const handleChangeQuestionMenu = async (e: SelectChangeEvent) => {
    e.preventDefault();
    const selectValue = Number(e.target.value);
    setQuestionMenuItemIndex(selectValue);

    // 全解除
    const currentQuestionNoSet = questionMenuItems[selectValue];
    const currentQuestions = props.questions.filter(
      (q) =>
        q.questionNo >= currentQuestionNoSet.firstQuestionNo &&
        q.questionNo <= currentQuestionNoSet.lastQuestionNo
    );

    setCurrentQuestions(currentQuestions);
    setQuestionIndex(0);
    setAnswerValue('');
    setIsAnswered(false);
    setIsCorrect(false);
    // setIsFinished(false);
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
    await apiRequest('/api/log/answer_history', 'POST', {
      questionId: currentQuestions[questionIndex].id,
      userId: Number(userId),
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

  const answerDiv = (question: Question, answer: string) => {
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

  const questionCopyIcon = (question: Question) => {
    const clipboardText = `${question.questionSentence}
A. ${question.optionA}
B. ${question.optionB}
C. ${question.optionC}
D. ${question.optionD}
`;

    return (
      <div>
        <Tooltip title="問題をコピー" placement="right">
          <IconButton
            // size="small"
            style={{
              width: 40
            }}
            onClick={async (e) => {
              e.stopPropagation(); // ← ラジオ選択のクリックと区別する
              // alert('A の説明を表示');
              await navigator.clipboard.writeText(clipboardText);
            }}
          >
            <ContentCopy fontSize="small" />
          </IconButton>
        </Tooltip>
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
            <InputLabel id="question_no_label">問題No</InputLabel>
            <Select
              labelId="question_no_label"
              label="問題No"
              value={String(questionMenuItemIndex)}
              onChange={handleChangeQuestionMenu}
            >
              {questionMenuItems.map((value, index) => (
                <MenuItem key={index} value={index}>
                  {value.firstQuestionNo} ~ {value.lastQuestionNo}
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
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  {currentQuestions[questionIndex].questionSentence}
                  {questionCopyIcon(currentQuestions[questionIndex])}
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

  // function QuestionHistoryModal() {
  //   return (
  //     <LmsModal
  //       open={isQuestionHistoryModalOpen}
  //       onClose={() => setIsQuestionHistoryModalOpen(false)}
  //       title="最初からやり直す"
  //       description="過去問を最初からやり直しますか？"
  //       onConfirm={handleConfirm}
  //     />
  //   );
  // }
}

