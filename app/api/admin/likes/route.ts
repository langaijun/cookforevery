import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || ''; // 'recipe' or 'share'

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' as const } } },
        { user: { email: { contains: search, mode: 'insensitive' as const } } },
      ];
    }

    if (type === 'recipe') {
      where.recipeId = { not: null };
    } else if (type === 'share') {
      where.shareId = { not: null };
    }

    const [likes, total] = await Promise.all([
      prisma.like.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          recipe: {
            select: {
              id: true,
              name: true,
            },
          },
          share: {
            select: {
              id: true,
              caption: true,
            },
          },
        },
      }),
      prisma.like.count({ where }),
    ]);

    return NextResponse.json({
      likes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, recipeId, shareId } = body;

    // Validate required fields
    if (!userId || (!recipeId && !shareId)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const where: any = { userId };
    if (recipeId) where.recipeId = recipeId;
    if (shareId) where.shareId = shareId;

    await prisma.like.deleteMany({ where });

    return NextResponse.json({ message: 'Like deleted successfully' });
  } catch (error) {
    console.error('Error deleting like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { prisma } from '@/lib/prisma';