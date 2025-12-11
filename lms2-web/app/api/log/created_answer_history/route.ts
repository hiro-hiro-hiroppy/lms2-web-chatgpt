import { PrismaClient } from '@prisma/client';
// import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { questionId, answerResult, answerDuration } = await req.json();
  await prisma.createdAnswerHistory.create({
    data: {
      questionId: questionId,
      answerResult: answerResult,
      answerDuration: answerDuration
    }
  });

  const res = NextResponse.json({ message: 'insert finished' });
  return res;
}

