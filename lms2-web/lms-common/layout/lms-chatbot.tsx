'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Drawer,
  Fab,
  Box,
  IconButton,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Tooltip
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import { apiRequest } from '@/lib/api';
import LmsMarkdown from './lms-markdown';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import LmsModal from './lms-modal';
// import { ChatGPTGetResponse } from '@/app/api/chat/route';
import { usePathname } from 'next/navigation';
import { error } from 'console';
import { Prisma } from '@prisma/client';
import { ChatbotReplyType } from '@/app/api/chat/route';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined'; // アウトライン版

type Message = {
  message: string;
  // 0:システム、1:ユーザー
  role: 0 | 1;
};

type Title = {
  title: string;
  value: number;
};

type QuestionPageProps = {
  params: {
    userId: number;
  };
};

type ChatGPTHeadingHistoriesType = Prisma.ChatGPTHeadingGetPayload<{
  include: { chatGPTHistoryies: true };
}>;

export default function LmsChatBot({ params }: QuestionPageProps) {
  // 試験画面の場合は、何も表示しない
  const pathName = usePathname();
  if (pathName === '/examination') return <></>;

  const userId = params.userId;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inquiryValue, setInquiryValue] = useState<string>('');
  const [titles, setTitles] = useState<Title[]>([]);

  // const [value, setValue] = useState('apple');
  const [currentTitleIdValue, setCurrentTitleIdValue] = useState<number>(0);
  const [isInquiry, setIsInquiry] = useState<boolean>(false);
  const [isDisabledSendButton, setIsDisabledSendButton] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isMacPc, setIsMacPc] = useState<boolean>(false);
  const chatbotMessagesRef = useRef<HTMLDivElement | null>(null);
  const chatbotTextFieldRef = useRef<HTMLInputElement | null>(null);

  const [isPermanent, setIsPermanent] = useState<boolean>(false);

  const handleCreateChatSection = () => {
    // 現在のチャット欄を削除して、新しいチャット欄を生成する
    setCurrentTitleIdValue(0);
    setMessages([]);
  };

  const handleEditTitle = async () => {
    await apiRequest('/api/chat/title', 'POST', {
      titleId: currentTitleIdValue,
      title: editTitle
    });

    setTitles((prev) =>
      prev.map((title) =>
        title.value === currentTitleIdValue
          ? { value: currentTitleIdValue, title: editTitle }
          : title
      )
    );
    setEditTitle('');
    setIsEditModalOpen(false);
  };

  const handleDeleteTitle = async () => {
    await apiRequest('/api/chat/title', 'POST', {
      titleId: currentTitleIdValue
    });

    setTitles((prev) => prev.filter((title) => title.value != currentTitleIdValue));
    setCurrentTitleIdValue(0);
    setMessages([]);
    setIsDeleteModalOpen(false);
  };

  const handleSendChatGPT = async () => {
    if (!inquiryValue) return;

    setInquiryValue('');
    setIsInquiry(true);
    setIsDisabledSendButton(true);
    const newQuestion: Message = { message: inquiryValue, role: 1 };
    const inquiringMessage: Message = {
      message: `問い合わせ中…




        
      `,
      role: 0
    };
    setMessages((prevItems) => [...prevItems, newQuestion, inquiringMessage]);
    // chatbotMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });

    try {
      const response: ChatbotReplyType = await apiRequest('/api/chat', 'POST', {
        // message: '基本情報技術者試験で出てくるアルゴリズムに関する問題ってどういうのがある？'
        // message: 'pythonで画像生成をしたいんだけど、おすすめのライブラリってある？'
        // message: 'PCM方式とは？'
        // message: 'フローチャートってどういうのがある？絵で教えて'
        // message: '10進数の分数1/32を16進数の小数で表すと？'
        // message: '逆ポーランド表記法の例を教えて'
        // message: '論理積ってTとFの組み合わせで行うとどういう結果になる？表にまとめて'
        // message: 'データベースでDELETE文の例を見せて、実際の表も込みで結果前と結果後も込みで教えて'
        // message: 'スタックとキューの違いを教えて'
        // message: questionValue
        messages: [...messages, newQuestion],
        question: inquiryValue,
        titleId: currentTitleIdValue,
        userId: userId
      });
      // console.log(response);

      if (response.title) {
        const newTitle: Title = { title: response.title, value: response.titleId };
        setTitles((prevItems) => [...prevItems, newTitle]);
        setCurrentTitleIdValue(response.titleId);
      }

      const newAnswer: Message = { message: response.reply as string, role: 0 };
      setMessages((prevItems) => [...prevItems.slice(0, -1), newAnswer]);
      setIsDisabledSendButton(false);
    } catch (e) {
      const errorMessage: Message = {
        message: 'エラーが発生しました。もう一度質問をお願いします。',
        role: 0
      };
      setMessages((prevItems) => [...prevItems.slice(0, -1), errorMessage]);
      setIsDisabledSendButton(false);
    }
  };

  const handleChangeTitle = async (e: any) => {
    e.preventDefault();
    const titleValue = Number(e.target.value);
    setCurrentTitleIdValue(titleValue);

    if (titleValue === 0) {
      setMessages([]);
    } else {
      // データを取得
      const data: ChatGPTHeadingHistoriesType[] = await apiRequest(
        `/api/chat?userId=${userId}&headingId=${titleValue}`,
        'GET'
      );
      // console.log(data);
      const messages: Message[] = data[0].chatGPTHistoryies.map((item) => {
        return { message: item.sentences, role: item.role } as Message;
      });
      setMessages(messages);
    }
  };

  useEffect(() => {
    if (chatbotMessagesRef.current && isInquiry) {
      chatbotMessagesRef.current.scrollTo({
        top: chatbotMessagesRef.current?.scrollHeight,
        behavior: 'smooth'
      });
      setIsInquiry(false);
    }
  }, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      // データを取得
      // 履歴を取得
      const data: ChatGPTHeadingHistoriesType[] = await apiRequest(
        `/api/chat?userId=${userId}`,
        'GET'
      );
      data.map((item) => {
        const title: Title = { title: item.heading, value: item.id };
        setTitles((prevItems) => [...prevItems, title]);
      });
    };

    fetchData();
  }, []);

  useEffect(() => {
    const isMac = typeof window !== 'undefined' && navigator.platform.includes('Mac');

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd + / or Ctrl + /
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      // Esc で閉じる
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    setIsMacPc(isMac);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      // document.body.classList.add('is-fixed');
      // console.log(chatbotTextFieldRef.current);
      const y = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${y}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';

      // chatbotTextFieldRef.current?.focus();
    } else {
      // document.body.classList.remove('is-fixed');
      const top = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      window.scrollTo(0, -parseInt(top || '0', 10));
    }
  }, [open]);

  const handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault(); // 改行やフォーム送信を防止
      handleSendChatGPT();
    }
  };

  const handleEntered = () => {
    // console.log(chatbotTextFieldRef.current);
    chatbotTextFieldRef.current?.focus();
  };

  return (
    <>
      {/* チャットボタン（右下） */}
      <div
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 100,
          display: open === true ? 'none' : 'inline-flex',
          flexDirection: 'column',
          // justifyContent: 'flex-end',
          alignItems: 'center'
        }}
      >
        {!isMacPc && <div style={{ fontSize: 12 }}>ctrl + /</div>}
        {isMacPc && <div style={{ fontSize: 12 }}>cmd + /</div>}
        <Fab
          color="primary"
          // size="small"
          onClick={() => setOpen(!open)}
          sx={
            {
              // background: 'rgb(150, 150, 150)'
              // background: '#fff',
              // border: '2px solid lightgray'
            }
          }
        >
          {/* <ChatIcon style={{ color: 'rgb(25, 118, 210)' }} /> */}
          <ChatIcon />
        </Fab>
      </div>

      {/* チャットスライドパネル（独自実装） */}
      {/* <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: open ? 0 : '-500px',
          width: 500,
          height: '100vh',
          bgcolor: '#fff',
          boxShadow: '0 0 10px rgba(0,0,0,0.2)',
          transition: 'right 0.3s ease-in-out',
          zIndex: 100,
          pointerEvents: 'auto'
        }}
      > */}
      <Drawer
        anchor="right"
        variant={isPermanent ? 'permanent' : 'temporary'}
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: 600, maxWidth: '100vw' }
        }}
        SlideProps={{
          onEntered: handleEntered
        }}
      >
        <Box
          sx={{
            p: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div
            style={{
              // height: '100%',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* ヘッダー */}
            <div
              style={{
                // paddingLeft: '14px',
                // paddingRight: '14px',
                // paddingBottom: '4px',
                // paddingTop: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid lightgray'
              }}
            >
              <h3>ChatGPTに聞く</h3>
              {/* <FormControl size="small">
              <InputLabel id="fruit-label">果物</InputLabel>
              <Select labelId="fruit-label" label="果物">
                <MenuItem value="apple">りんご</MenuItem>
                <MenuItem value="banana">バナナ</MenuItem>
                <MenuItem value="orange">オレンジ</MenuItem>
              </Select>
            </FormControl> */}
              {/* <select>
                <option>1</option>
                <option>2</option>
                <option>3</option>
              </select> */}
              <IconButton onClick={() => setOpen(false)}>
                <CloseIcon />
              </IconButton>
            </div>
            <Stack
              direction="row"
              spacing={2}
              style={{
                paddingLeft: '8px',
                paddingRight: '8px',
                paddingTop: '4px',
                paddingBottom: '4px'
              }}
            >
              <FormControl
                variant="standard"
                sx={{
                  minWidth: 120,
                  width: '100%'
                }}
              >
                <InputLabel id="demo-simple-select-standard-label">名前</InputLabel>
                <Select
                  labelId="demo-simple-select-standard-label"
                  id="demo-simple-select-standard"
                  value={currentTitleIdValue}
                  onChange={handleChangeTitle}
                  label="名前"
                >
                  <MenuItem value={0}>新規チャット</MenuItem>
                  {titles.map((title, index) => (
                    <MenuItem key={index} value={title.value}>
                      {title.title}
                    </MenuItem>
                  ))}
                  {/* <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem> */}
                </Select>
              </FormControl>

              {/* 新規作成 */}
              <Tooltip title="新規チャット欄を作成">
                <IconButton
                  onClick={() => {
                    handleCreateChatSection();
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>

              {/* 編集 */}
              <Tooltip title="現在のチャット欄のタイトルを編集する">
                <IconButton
                  onClick={() => {
                    if (currentTitleIdValue !== 0) setIsEditModalOpen(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>

              {/* 削除 */}
              <Tooltip title="現在のチャット欄を削除する">
                <IconButton
                  onClick={() => {
                    if (currentTitleIdValue !== 0) setIsDeleteModalOpen(true);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>

              {/* 固定化 */}
              {/* <Tooltip title="チャットボットを固定化する">
                <IconButton
                  onClick={() => {
                    const isPrev = isPermanent;
                    setIsPermanent(!isPrev);
                    const mainDom = document.getElementById('lms_main');
                    if (mainDom) {
                      if (!isPrev) {
                        mainDom.style.width = 'calc(100vw - 600px)';
                      } else {
                        mainDom.style.width = '';
                      }
                    }
                  }}
                >
                  {isPermanent ? <PushPinIcon color="primary" /> : <PushPinOutlinedIcon />}
                </IconButton>
              </Tooltip> */}

              {/* 検索 */}
              {/* <Tooltip title="チャットを検索する">
                <IconButton>
                  <SearchIcon />
                </IconButton>
              </Tooltip> */}
            </Stack>
          </div>

          {/* 本文 */}
          <div
            style={{
              height: 'calc(100vh - 215px)',
              overflowY: 'scroll',
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 4,
              paddingBottom: 4
            }}
            ref={chatbotMessagesRef}
          >
            {messages.map((message, index) => {
              if (message.role === 1)
                return (
                  <div
                    key={index}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'flex-end'
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: '#e0e0e0', // 灰色
                        color: 'black',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        maxWidth: '90%',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {message.message}
                    </div>
                  </div>
                );
              else return <LmsMarkdown key={index} content={message.message} />;
            })}
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              borderTop: '1px solid lightgray',
              width: 'calc(100% - 8px)',
              background: '#fff'
            }}
          >
            <TextField
              multiline
              id="tf_chat_question"
              style={{ margin: 5, width: 'calc(100% - 16px)' }}
              size="small"
              value={inquiryValue}
              onChange={(e) => setInquiryValue(e.target.value)}
              onKeyDown={handleKeydown}
              inputRef={chatbotTextFieldRef}
            />
            <Button
              type="submit"
              variant="contained"
              style={{ marginBottom: '5px', marginRight: '12px', float: 'right' }}
              disabled={isDisabledSendButton}
              onClick={handleSendChatGPT}
            >
              送信
            </Button>
          </div>
        </Box>
      </Drawer>

      {EditTitleModal()}
      {ConfirmDeleteModal()}
    </>
  );

  // function ConfirmFinishedLearningModal() {
  //   return (
  //     <LmsModal
  //       open={isFinishedLearningModalOpen}
  //       onClose={() => setIsFinishedLearningModalOpen(false)}
  //       title="学習終了"
  //       description="新規チャット欄を開きますか？"
  //       onConfirm={}
  //     />
  //   );
  // }

  function EditTitleModal() {
    return (
      <LmsModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="タイトルを編集"
        description={
          <div>
            <p style={{ fontWeight: 'bold' }}>タイトル</p>
            <TextField
              id="tf_edit_title"
              style={{ marginTop: 5, width: '100%' }}
              size="small"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          </div>
        }
        onConfirm={handleEditTitle}
      />
    );
  }

  function ConfirmDeleteModal() {
    return (
      <LmsModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="チャット欄を削除"
        description="現在のチャット欄を削除しますか？"
        onConfirm={() => handleDeleteTitle()}
      />
    );
  }
}

