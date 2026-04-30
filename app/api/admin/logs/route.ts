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
    const adminId = searchParams.get('adminId') || '';
    const action = searchParams.get('action') || '';
    const entityType = searchParams.get('entityType') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (adminId) {
      where.adminId = adminId;
    }

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.adminLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { prisma } from '@/lib/prisma';