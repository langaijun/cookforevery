import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserId } from '@/lib/profile-auth'

/**
 * GET /api/profile/shares
 * 当前用户分享列表（分页）
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10)
    )

    const [shares, total] = await Promise.all([
      prisma.share.findMany({
        where: { userId },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          _count: { select: { comments: true, likes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.share.count({ where: { userId } }),
    ])

    return NextResponse.json({
      shares,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    })
  } catch (error) {
    console.error('获取分享列表失败:', error)
    return NextResponse.json({ error: '获取分享列表失败' }, { status: 500 })
  }
}
