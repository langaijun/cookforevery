import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserId } from '@/lib/profile-auth'

/**
 * GET /api/profile/me
 * 当前用户完整信息（含统计）
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        provider: true,
        createdAt: true,
        isBanned: true,
        _count: {
          select: {
            shares: true,
            comments: true,
            likes: true,
            favorites: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    if (user.isBanned) {
      return NextResponse.json({ error: '账户已被封禁' }, { status: 403 })
    }

    const { isBanned, ...safe } = user

    return NextResponse.json({ user: safe })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 })
  }
}
