import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    return NextResponse.redirect('/');
  }
}