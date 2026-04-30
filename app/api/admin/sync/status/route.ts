import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get sync statistics
    const totalRecipes = await prisma.recipe.count();
    const activeRecipes = await prisma.recipe.count({ where: { isActive: true } });
    const lastSync = await prisma.recipe.findFirst({
      orderBy: { syncedAt: 'desc' },
      select: { syncedAt: true },
    });

    return NextResponse.json({
      totalRecipes,
      activeRecipes,
      lastSync: lastSync?.syncedAt || null,
    });
  } catch (error) {
    console.error('Error fetching sync status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
