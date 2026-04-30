import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { prisma } from '@/lib/prisma';