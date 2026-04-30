import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserId } from '@/lib/profile-auth'

/**
 * POST /api/likes
 * 点赞/取消点赞
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { recipeId, shareId } = await request.json()

    // 验证参数
    if (!recipeId && !shareId) {
      return NextResponse.json({ error: '必须指定食谱或分享ID' }, { status: 400 })
    }

    // 检查是否已点赞
    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        ...(recipeId ? { recipeId } : {}),
        ...(shareId ? { shareId } : {}),
      },
    })

    if (existingLike) {
      // 取消点赞
      await prisma.like.delete({ where: { id: existingLike.id } })
      return NextResponse.json({
        success: true,
        liked: false,
      })
    } else {
      // 添加点赞
      const like = await prisma.like.create({
        data: {
          userId,
          ...(recipeId ? { recipeId } : {}),
          ...(shareId ? { shareId } : {}),
        },
      })
      return NextResponse.json({
        success: true,
        liked: true,
        like: {
          id: like.id,
          createdAt: like.createdAt,
        },
      })
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

/**
 * GET /api/likes/check
 * 检查是否已点赞
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ liked: false })
    }

    const { searchParams } = new URL(request.url)
    const recipeId = searchParams.get('recipeId')
    const shareId = searchParams.get('shareId')

    // 验证参数
    if (!recipeId && !shareId) {
      return NextResponse.json({ error: '必须指定食谱或分享ID' }, { status: 400 })
    }

    // 检查是否已点赞
    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        ...(recipeId ? { recipeId } : {}),
        ...(shareId ? { shareId } : {}),
      },
    })

    return NextResponse.json({
      liked: !!existingLike,
      likeId: existingLike?.id || null,
    })
  } catch (error) {
    console.error('检查点赞失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
