import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const log = await prisma.syncLog.findUnique({
      where: { id },
    });

    if (!log) {
      return NextResponse.json({ error: 'Sync log not found' }, { status: 404 });
    }

    return NextResponse.json({ log });
  } catch (error) {
    console.error('Error fetching sync log detail:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
