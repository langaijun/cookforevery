import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isBanned } = body;

    // Prevent banning admin users
    const user = await prisma.user.findUnique({
      where: { id },
      select: { isAdmin: true },
    });

    if (user?.isAdmin) {
      return NextResponse.json({ error: 'Cannot ban admin users' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isBanned },
      select: {
        id: true,
        name: true,
        email: true,
        isBanned: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user ban status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
