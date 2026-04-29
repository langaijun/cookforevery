import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Difficulty } from '@/types/recipe'

/**
 * GET /api/recipes/list
 * 获取食谱列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 解析查询参数
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || undefined
    const difficulty = searchParams.get('difficulty') as Difficulty | null
    const tasteParam = searchParams.get('taste')

    // 解析口味标签
    const tastes = tasteParam ? tasteParam.split(',') : undefined

    // 构建查询条件
    const where: any = {
      isActive: true,
    }

    // 搜索菜名（中文名或英文名）
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
      ]
    }

    // 难度筛选
    if (difficulty) {
      where.difficulty = difficulty
    }

    // 口味筛选
    if (tastes && tastes.length > 0) {
      where.tasteTags = {
        hasSome: tastes,
      }
    }

    // 计算跳过的数量
    const skip = (page - 1) * limit

    // 查询总数
    const total = await prisma.recipe.count({ where })

    // 查询食谱列表
    const recipes = await prisma.recipe.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        nameEn: true,
        description: true,
        difficulty: true,
        tasteTags: true,
        time: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 计算总页数
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      recipes,
      total,
      page,
      limit,
      totalPages,
    })
  } catch (error) {
    console.error('获取食谱列表失败:', error)
    return NextResponse.json(
      { error: '获取食谱列表失败' },
      { status: 500 }
    )
  }
}
