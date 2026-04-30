import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserId } from '@/lib/profile-auth'

/**
 * POST /api/shares
 * 创建分享
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { recipeId, imageUrl, caption } = await request.json()

    // 验证参数
    if (!imageUrl || imageUrl.trim().length === 0) {
      return NextResponse.json({ error: '图片URL不能为空' }, { status: 400 })
    }

    // 如果指定了食谱，检查食谱是否存在
    if (recipeId) {
      const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } })
      if (!recipe) {
        return NextResponse.json({ error: '食谱不存在' }, { status: 404 })
      }
    }

    // 创建分享
    const share = await prisma.share.create({
      data: {
        userId,
        recipeId: recipeId || null,
        imageUrl: imageUrl.trim(),
        caption: (caption || '').trim(),
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    })

    return NextResponse.json({
      success: true,
      share: {
        id: share.id,
        imageUrl: share.imageUrl,
        caption: share.caption,
        createdAt: share.createdAt,
        user: share.user,
      },
    })
  } catch (error) {
    console.error('创建分享失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

/**
 * GET /api/shares
 * 获取分享列表（分页）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('userId')

    // 构建查询条件
    const where: any = {}
    if (userId) {
      where.userId = userId
    }

    const [shares, total] = await Promise.all([
      prisma.share.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          _count: { select: { comments: true, likes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.share.count({ where }),
    ])

    return NextResponse.json({
      shares,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('获取分享列表失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
