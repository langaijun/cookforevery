import { prisma } from './prisma';
import { headers } from 'next/headers';

export async function logAdminAction({
  adminId,
  action,
  entityType,
  entityId = null,
  entityName = null,
  details = null,
}: {
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  entityName?: string | null;
  details?: any;
}) {
  try {
    const headersList = await headers();

    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId,
        entityName,
        details: details,
        ipAddress: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || null,
        userAgent: headersList.get('user-agent') || null,
      },
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't throw error - logging failure shouldn't break the operation
  }
}

// Predefined action types
export const AdminAction = {
  RECIPE_CREATE: 'CREATE_RECIPE',
  RECIPE_UPDATE: 'UPDATE_RECIPE',
  RECIPE_DELETE: 'DELETE_RECIPE',
  USER_BAN: 'BAN_USER',
  USER_UNBAN: 'UNBAN_USER',
  USER_DELETE: 'DELETE_USER',
  COMMENT_DELETE: 'DELETE_COMMENT',
  SHARE_DELETE: 'DELETE_SHARE',
  SYNC_START: 'START_SYNC',
  SYNC_COMPLETE: 'SYNC_COMPLETE',
  LIKE_DELETE: 'DELETE_LIKE',
  LIKE_BULK_DELETE: 'BULK_DELETE_LIKES',
} as const;

export const EntityType = {
  RECIPE: 'RECIPE',
  USER: 'USER',
  COMMENT: 'COMMENT',
  SHARE: 'SHARE',
  SYNC: 'SYNC',
  LIKE: 'LIKE',
} as const;
