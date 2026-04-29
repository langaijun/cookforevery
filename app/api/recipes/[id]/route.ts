import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/recipes/[id]
 * 获取食谱详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // 查询食谱详情
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        nameEn: true,
        description: true,
        difficulty: true,
        tasteTags: true,
        time: true,
        ingredients: true,
        steps: true,
        videoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!recipe) {
      return NextResponse.json(
        { error: '食谱不存在' },
        { status: 404 }
      )
    }

    // 获取点赞数和评论数
    const [likeCount, commentCount] = await Promise.all([
      prisma.like.count({
        where: { recipeId: id },
      }),
      prisma.comment.count({
        where: { recipeId: id },
      }),
    ])

    return NextResponse.json({
      ...recipe,
      likeCount,
      commentCount,
    })
  } catch (error) {
    console.error('获取食谱详情失败:', error)
    return NextResponse.json(
      { error: '获取食谱详情失败' },
      { status: 500 }
    )
  }
}
