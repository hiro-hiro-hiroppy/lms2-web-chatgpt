// app/api/chat/route.ts
import { ChatGPTHistory, Prisma, PrismaClient } from '@prisma/client';
import { marked } from 'marked';
import { NextRequest, NextResponse } from 'next/server';
import { htmlToText } from 'html-to-text';

const prisma = new PrismaClient();

// export type ChatGPTGetResponse = {
//   id: number;
//   userId: number;
//   heading: string;
//   isDeleted: boolean;
//   createTime: Date;
//   updateTime: Date | null;
//   chatGPTHistoryies: {
//     id: number;
//     role: number;
//     headingId: number;
//     createTime: Date;
//     sentences: string;
//   }[];
// }[];

// type xxx = Prisma.ChatGPTHeadingGetPayload<{ include: { chatGPTHistoryies: true } }>;

export type ChatbotReplyType = {
  reply: string;
  title: string;
  titleId: number;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') ?? '';
  const headingId = searchParams.get('headingId') ?? '';

  let whereVal = {};
  if (headingId) {
    whereVal = {
      id: Number(headingId),
      userId: Number(userId),
      isDeleted: false
    };
  } else {
    whereVal = {
      userId: Number(userId),
      isDeleted: false
    };
  }

  const chatGPTHeadingHistories = await prisma.chatGPTHeading.findMany({
    where: whereVal,
    include: {
      chatGPTHistoryies: {
        orderBy: {
          id: 'asc'
        }
      }
    },
    orderBy: {
      id: 'asc'
    }
  });

  // const response = chatGPTHeadingHistories as ChatGPTGetResponse;

  return NextResponse.json(chatGPTHeadingHistories);
}

export async function POST(req: NextRequest) {
  const { messages, titleId, userId, question } = await req.json();

  const messageHistory = [];
  messageHistory.push({
    role: 'system',
    content: '回答は全てMarkdown形式で返してください。'
  });
  for (let i = 0; i < messages.length; i++) {
    // 0:システム、1:ユーザー
    if (messages[i].role === 0) {
      messageHistory.push({ role: 'assistant', content: messages[i].message });
    } else {
      messageHistory.push({ role: 'user', content: messages[i].message });
    }
  }
  console.log(messageHistory);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      // model: 'gpt-4',
      model: 'gpt-4o',
      // model: 'gpt-3.5-turbo',
      messages: messageHistory
    })
  });

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content as string;
  const replyHtml = await marked(reply);
  const replyText = htmlToText(replyHtml);

  // 最初の問いだったならタイトルも作成する
  let title = '';
  let newTitleId = titleId;
  if (titleId === 0) {
    const response2 = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          // {
          //   role: 'system',
          //   content:
          //     '20文字以内で作ってください。先頭に「タイトル」はつけずに体言止めで、1文で、語尾に句読点はつけずに、結果だけ返してください。'
          // },
          {
            role: 'system',
            content: `
              あなたは「質問」と「回答」の内容を要約し、内容を端的に表すタイトルを作成するアシスタントです。
              タイトルは **20文字以内** とし、名詞句で簡潔にしてください。
              不要な語尾（「について」「する方法」「の説明」など）は省いてください。
              出力は **タイトルのみ** とし、追加の文章・解説は一切付けないでください。
            `
          },
          {
            role: 'user',
            content: `
              次の質問と回答を要約してタイトルを作って 
              質問：${messageHistory.at(-1)?.content}
              回答：${reply}
           `
          }
        ]
      })
    });
    const data2 = await response2.json();
    title = data2.choices?.at(-1)?.message?.content;
  }

  // データ登録
  // タイトル
  if (titleId === 0) {
    const newTitle = await prisma.chatGPTHeading.create({
      data: {
        userId: userId,
        heading: title,
        isDeleted: false
      }
    });

    newTitleId = newTitle.id;
  }

  // 履歴
  await prisma.chatGPTHistory.create({
    data: {
      headingId: newTitleId,
      role: 1,
      sentences: question
    }
  });
  await prisma.chatGPTHistory.create({
    data: {
      headingId: newTitleId,
      role: 0,
      sentences: reply,
      convertSentences: replyText
    }
  });

  return NextResponse.json({
    reply: reply ?? '',
    title: title ?? '',
    titleId: newTitleId
  } as ChatbotReplyType);
}

