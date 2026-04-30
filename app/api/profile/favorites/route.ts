import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserId } from '@/lib/profile-auth'

/**
 * GET /api/profile/favorites
 * 当前用户收藏列表（分页）
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

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        include: {
          recipe: {
            select: {
              id: true,
              name: true,
              description: true,
              difficulty: true,
              time: true,
              tasteTags: true,
              _count: { select: { likes: true, comments: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.favorite.count({ where: { userId } }),
    ])

    return NextResponse.json({
      favorites,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    })
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    return NextResponse.json({ error: '获取收藏列表失败' }, { status: 500 })
  }
}

/**
 * POST /api/profile/favorites
 * 切换收藏：已收藏则取消，否则添加
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const recipeId = body?.recipeId as string | undefined

    if (!recipeId) {
      return NextResponse.json({ error: '食谱ID不能为空' }, { status: 400 })
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { id: true },
    })

    if (!recipe) {
      return NextResponse.json({ error: '食谱不存在' }, { status: 404 })
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_recipeId: { userId, recipeId } },
    })

    if (existing) {
      await prisma.favorite.delete({
        where: { userId_recipeId: { userId, recipeId } },
      })
      return NextResponse.json({ success: true, favorited: false })
    }

    await prisma.favorite.create({
      data: { userId, recipeId },
    })
    return NextResponse.json({ success: true, favorited: true })
  } catch (error) {
    console.error('收藏操作失败:', error)
    return NextResponse.json({ error: '收藏操作失败' }, { status: 500 })
  }
}
