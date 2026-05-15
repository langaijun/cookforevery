/**
 * 食谱图片生成完整流程
 * 整合 AI 生成、下载存储、数据库更新
 */

import { prisma } from './prisma'
import { generateRecipeImage } from './tongyi-image'

export interface GenerateOptions {
  limit?: number
  force?: boolean
  concurrency?: number
}

export interface GenerateResult {
  success: number
  failed: number
  total: number
  errors: Array<{ recipeId: string; name: string; error: string }>
}

/**
 * 为单个食谱生成并保存图片
 */
export async function generateAndStoreRecipeImage(
  recipeId: string
): Promise<{ imageUrl: string | null; error: string | null }> {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: {
      id: true,
      name: true,
      nameEn: true,
      description: true,
      ingredients: true,
      tasteTags: true,
      steps: true,
      imageUrl: true,
    },
  })

  if (!recipe) {
    return { imageUrl: null, error: '食谱不存在' }
  }

  try {
    // generateRecipeImage 内部已完成下载、本地/Bucket 存储，直接得到最终 URL
    const result = await generateRecipeImage({
      name: recipe.name,
      nameEn: recipe.nameEn ?? undefined,
      description: recipe.description,
      ingredients: recipe.ingredients,
      tasteTags: recipe.tasteTags,
      steps: recipe.steps,
    })

    if (result.error) {
      return { imageUrl: null, error: result.error }
    }

    if (!result.imageUrl) {
      return { imageUrl: null, error: '未生成图片' }
    }

    await prisma.recipe.update({
      where: { id: recipeId },
      data: { imageUrl: result.imageUrl },
    })

    return { imageUrl: result.imageUrl, error: null }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error(`生成食谱 ${recipeId} 图片失败:`, errorMsg)
    return { imageUrl: null, error: errorMsg }
  }
}

/**
 * 批量生成食谱图片
 */
export async function generateAndStoreAllRecipes(
  options: GenerateOptions = {}
): Promise<GenerateResult> {
  const { limit, force = false, concurrency = 2 } = options

  const result: GenerateResult = {
    success: 0,
    failed: 0,
    total: 0,
    errors: []
  }

  try {
    // 获取需要生成图片的食谱
    const recipes = await prisma.recipe.findMany({
      where: {
        isActive: true,
        imageUrl: force ? undefined : null
      },
      select: {
        id: true,
        name: true,
        nameEn: true,
        description: true,
        ingredients: true,
        tasteTags: true,
        steps: true,
      },
      take: limit,
      orderBy: { createdAt: 'asc' }
    })

    result.total = recipes.length

    if (recipes.length === 0) {
      console.log('没有需要生成图片的食谱')
      return result
    }

    console.log(`开始为 ${recipes.length} 个食谱生成图片...`)

    // 并发处理（控制并发数）
    const chunks: typeof recipes[] = []
    for (let i = 0; i < recipes.length; i += concurrency) {
      chunks.push(recipes.slice(i, i + concurrency))
    }

    let processed = 0
    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async (recipe) => {
          processed++
          console.log(`[${processed}/${recipes.length}] 生成 ${recipe.name} 的图片...`)

          const genResult = await generateRecipeImage({
            name: recipe.name,
            nameEn: recipe.nameEn ?? undefined,
            description: recipe.description,
            ingredients: recipe.ingredients,
            tasteTags: recipe.tasteTags,
            steps: recipe.steps,
          })

          if (genResult.error) {
            result.failed++
            result.errors.push({
              recipeId: recipe.id,
              name: recipe.name,
              error: genResult.error
            })
            console.error(`  失败: ${genResult.error}`)
          } else if (genResult.imageUrl) {
            // generateRecipeImage 已经处理了下载和上传，直接使用返回的 URL
            await prisma.recipe.update({
              where: { id: recipe.id },
              data: { imageUrl: genResult.imageUrl }
            })
            result.success++
            console.log(`  成功: ${genResult.imageUrl}`)
          } else {
            result.failed++
            result.errors.push({
              recipeId: recipe.id,
              name: recipe.name,
              error: '未生成图片'
            })
          }
        })
      )
    }

    console.log(`\n生成完成! 成功: ${result.success}, 失败: ${result.failed}`)

    return result
  } catch (error) {
    console.error('批量生成失败:', error)
    throw error
  }
}
