import { requireAdmin } from '@/lib/admin-auth';
import { NextRequest, NextResponse } from 'next/server';
import { logAdminAction, AdminAction, EntityType } from '@/lib/admin-log';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();

    const body = await request.json();
    const { userId, type } = body; // type: 'all', 'recipe', 'share'

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let deleteCount = 0;

    if (type === 'all' || type === 'recipe') {
      const result = await prisma.like.deleteMany({
        where: { userId, recipeId: { not: null } },
      });
      deleteCount += result.count;
    }

    if (type === 'all' || type === 'share') {
      const result = await prisma.like.deleteMany({
        where: { userId, shareId: { not: null } },
      });
      deleteCount += result.count;
    }

    // Log the bulk delete action
    await logAdminAction({
      adminId: user.id,
      action: AdminAction.LIKE_BULK_DELETE,
      entityType: EntityType.LIKE,
      entityName: `User ${userId}`,
      details: { userId, type, deleteCount },
    });

    return NextResponse.json({
      message: `Successfully deleted ${deleteCount} likes`,
      deleteCount,
    });
  } catch (error) {
    console.error('Error bulk deleting likes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { prisma } from '@/lib/prisma';