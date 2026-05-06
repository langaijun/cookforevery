/**
 * 食谱图片生成 - 增强版（支持降级）
 */

import { prisma } from './prisma'
import { generateRecipeImage } from './tongyi-image'
import { generateRecipeImageWithFallback } from '../scripts/generate-recipe-image-fallback'

export interface GenerateOptions {
  limit?: number
  force?: boolean
  concurrency?: number
  useFallback?: boolean  // 是否允许降级到占位图片
}

export interface GenerateResult {
  success: number
  failed: number
  total: number
  errors: Array<{ recipeId: string; name: string; error: string }>
  fallbackUsed: number  // 使用降级方案的次数
}

/**
 * 为单个食谱生成并保存图片（支持降级）
 */
export async function generateAndStoreRecipeImage(
  recipeId: string,
  useFallback = true
): Promise<{ imageUrl: string | null; error: string | null; fromFallback: boolean }> {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: {
      id: true,
      name: true,
      description: true,
      ingredients: true,
      tasteTags: true,
      steps: true,
      imageUrl: true
    }
  })

  if (!recipe) {
    return { imageUrl: null, error: '食谱不存在', fromFallback: false }
  }

  try {
    // 先尝试 WanX
    const result = await generateRecipeImage({
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.ingredients,
      tasteTags: recipe.tasteTags,
      steps: recipe.steps
    })

    if (!result.error && result.imageUrl) {
      // WanX 成功
      const storedUrl = await downloadAndStoreImage(result.imageUrl, recipeId)
      if (storedUrl) {
        await prisma.recipe.update({
          where: { id: recipeId },
          data: { imageUrl: storedUrl }
        })
        return { imageUrl: storedUrl, error: null, fromFallback: false }
      }
    }

    // WanX 失败，检查是否使用降级方案
    if (useFallback) {
      console.log(`WanX 生成失败，为 ${recipe.name} 使用降级方案...`)
      const fallbackImageUrl = await generateRecipeImageWithFallback(recipe.name)

      await prisma.recipe.update({
        where: { id: recipeId },
        data: { imageUrl: fallbackImageUrl.imageUrl }
      })

      return {
        imageUrl: fallbackImageUrl.imageUrl,
        error: null,
        fromFallback: true
      }
    }

    return { imageUrl: null, error: result.error || '图片生成失败', fromFallback: false }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)

    // 发生错误，检查是否使用降级方案
    if (useFallback) {
      console.log(`发生异常，为 ${recipe.name} 使用降级方案...`)
      try {
        const fallbackImageUrl = await generateRecipeImageWithFallback(recipe.name)

        await prisma.recipe.update({
          where: { id: recipeId },
          data: { imageUrl: fallbackImageUrl.imageUrl }
        })

        return {
          imageUrl: fallbackImageUrl.imageUrl,
          error: null,
          fromFallback: true
        }
      } catch (fallbackError) {
        return {
          imageUrl: null,
          error: `图片生成失败: ${errorMsg}, 降级方案也失败: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`,
          fromFallback: false
        }
      }
    }

    return { imageUrl: null, error: errorMsg, fromFallback: false }
  }
}