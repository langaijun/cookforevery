import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Difficulty } from '@/types/recipe'
import { getRecipeImage } from '@/lib/unsplash'

/**
 * GET /api/recipes/list
 * 获取食谱列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 解析查询参数
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20))
    const search = searchParams.get('search') || undefined
    const difficultyRaw = searchParams.get('difficulty')
    const difficulty =
      difficultyRaw && ['EASY', 'MEDIUM', 'HARD'].includes(difficultyRaw)
        ? (difficultyRaw as Difficulty)
        : undefined
    const tasteParam = searchParams.get('taste')
    const ingredientsParam = searchParams.get('ingredients')

    // 解析口味标签
    const tastes = tasteParam
      ? tasteParam
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined

    // 解析食材列表
    const ingredients = ingredientsParam
      ? ingredientsParam
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined

    // 构建查询条件
    const where: {
      isActive: boolean
      OR?: Array<
        | { name?: { contains?: string } }
        | { nameEn?: { contains?: string } }
        | { ingredients?: { has?: string } }
      >
      difficulty?: Difficulty
      tasteTags?: { hasSome: string[] }
    } = {
      isActive: true,
    }

    // 搜索菜名（中文名或英文名）
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameEn: { contains: search } },
      ]
    }

    // 按难度筛选
    if (difficulty !== undefined) {
      where.difficulty = difficulty
    }

    // 按口味标签筛选
    if (tastes && tastes.length > 0) {
      where.tasteTags = { hasSome: tastes }
    }

    // 按食材筛选（查找包含任一指定食材的食谱）
    if (ingredients && ingredients.length > 0) {
      const ingredientConditions = ingredients.map((ing) => ({
        ingredients: { has: ing.trim() },
      }))
      // 如果有其他条件，需要合并 OR 条件
      where.OR = [...(where.OR || []), ...ingredientConditions]
    }

    // 查询食谱列表
    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
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
          imageUrl: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ])

    // 生成图片 URL（优先使用数据库中的图片，否则使用 Unsplash 或占位符）
    const recipesWithImages = await Promise.all(
      recipes.map(async (recipe) => {
        // 优先使用数据库中的 imageUrl
        if (recipe.imageUrl) {
          return recipe
        }

        // 否则使用 Unsplash 获取图片或占位符
        const imageUrl = await getRecipeImage(recipe.name, recipe.tasteTags)
        return {
          ...recipe,
          imageUrl: imageUrl || `https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&h=600&fit=crop&sig=${recipe.id}`,
        }
      })
    )

    // 计算总页数
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      recipes: recipesWithImages,
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
