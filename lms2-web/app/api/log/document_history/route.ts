import { PrismaClient } from '@prisma/client';
// import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { userId, documentId, pageNo, duration } = await req.json();
  const documentPage = await prisma.documentPage.findFirst({
    where: {
      documentId: documentId,
      pageNo: pageNo
    }
  });

  if (documentPage !== null) {
    await prisma.documentHistory.create({
      data: {
        userId: userId,
        documentPageId: documentPage.id,
        duration: duration
      }
    });
  }

  const res = NextResponse.json({ message: 'insert finished' });
  return res;
}

