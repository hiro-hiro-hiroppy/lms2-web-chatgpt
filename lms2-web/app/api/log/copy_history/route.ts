import { PrismaClient } from '@prisma/client';
// import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { userId, questionId, copyWord } = await req.json();
  await prisma.copyHistory.create({
    data: {
      userId: userId,
      questionId: questionId,
      copyWord: copyWord
    }
  });

  const res = NextResponse.json({ message: 'insert finished' });
  return res;
}

