// app/api/chat/route.ts
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { titleId, title } = await req.json();

  // データ登録
  if (title) {
    await prisma.chatGPTHeading.update({
      where: {
        id: Number(titleId)
      },
      data: {
        heading: title
      }
    });
  } else {
    await prisma.chatGPTHeading.update({
      where: {
        id: Number(titleId)
      },
      data: {
        isDeleted: true
      }
    });
  }

  return NextResponse.json({});
}
