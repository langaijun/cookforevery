import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserId } from '@/lib/profile-auth'

/**
 * GET /api/comments
 * 获取评论列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recipeId = searchParams.get('recipeId')
    const shareId = searchParams.get('shareId')

    if (!recipeId && !shareId) {
      return NextResponse.json({ error: '必须指定食谱或分享ID' }, { status: 400 })
    }

    // 查询评论列表
    const comments = await prisma.comment.findMany({
      where: {
        recipeId: recipeId || undefined,
        shareId: shareId || undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      comments: comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        userId: comment.userId,
        user: comment.user,
      })),
    })
  } catch (error) {
    console.error('获取评论列表失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

/**
 * POST /api/comments
 * 创建评论
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { recipeId, shareId, content } = await request.json()

    // 验证参数
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: '评论内容不能为空' }, { status: 400 })
    }

    if (!recipeId && !shareId) {
      return NextResponse.json({ error: '必须指定食谱或分享ID' }, { status: 400 })
    }

    // 如果是食谱评论，检查食谱是否存在
    if (recipeId) {
      const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } })
      if (!recipe) {
        return NextResponse.json({ error: '食谱不存在' }, { status: 404 })
      }
    }

    // 如果是分享评论，检查分享是否存在
    if (shareId) {
      const share = await prisma.share.findUnique({ where: { id: shareId } })
      if (!share) {
        return NextResponse.json({ error: '分享不存在' }, { status: 404 })
      }
    }

    // 创建评论
    const comment = await prisma.comment.create({
      data: {
        userId,
        recipeId,
        shareId,
        content: content.trim(),
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    })

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: comment.user,
      },
    })
  } catch (error) {
    console.error('创建评论失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
