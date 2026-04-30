import { requireAdmin } from '@/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { caption: { contains: search, mode: 'insensitive' as const } },
            { user: { name: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : undefined;

    const [shares, total] = await Promise.all([
      prisma.share.findMany({
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
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      }),
      prisma.share.count({ where }),
    ]);

    return NextResponse.json({
      shares,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching shares:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { prisma } from '@/lib/prisma';