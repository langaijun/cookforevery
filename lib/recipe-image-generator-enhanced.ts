/**
 * 食谱图片：优先通义/OpenAI 按食谱真实文生图，失败时降级为本地 PNG 占位图
 */

import { prisma } from './prisma'
import { generateRecipeImage } from './tongyi-image'
import { generateRecipeImageWithFallback } from './recipe-image-fallback'
import { downloadAndStoreImageLocal } from './image-storage'
import { existsSync, renameSync, mkdirSync } from 'fs'
import { join } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'recipes')
const RECIPES_DIR = join(process.cwd(), 'public', 'recipes')

/**
 * 将 recipes/ 目录的图片移动到 uploads/recipes/
 */
function moveRecipeToUploads(oldPath: string, recipeId: string): string | null {
  try {
    // 确保目标目录存在
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true })
    }

    // 提取文件名
    const filename = oldPath.split('/').pop()
    if (!filename) return null

    const oldFilePath = join(RECIPES_DIR, filename)
    const newFilePath = join(UPLOAD_DIR, filename)

    if (!existsSync(oldFilePath)) {
      console.warn(`  原文件不存在: ${oldFilePath}`)
      return null
    }

    // 移动文件
    renameSync(oldFilePath, newFilePath)
    console.log(`  移动文件: /recipes/${filename} -> /uploads/recipes/${filename}`)

    return `/uploads/recipes/${filename}`
  } catch (error) {
    console.error('  移动文件失败:', error)
    return null
  }
}

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
  fallbackUsed: number
}

/**
 * 为单个食谱生成并保存图片（AI 优先，失败则用占位图）
 */
export async function generateAndStoreRecipeImage(
  recipeId: string
): Promise<{ imageUrl: string | null; error: string | null; fromFallback: boolean }> {
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
    return { imageUrl: null, error: '食谱不存在', fromFallback: false }
  }

  try {
    console.log(`为 ${recipe.name} 尝试 AI 文生图（按食谱字段）…`)
    const ai = await generateRecipeImage({
      name: recipe.name,
      nameEn: recipe.nameEn ?? undefined,
      description: recipe.description,
      ingredients: recipe.ingredients,
      tasteTags: recipe.tasteTags,
      steps: recipe.steps,
    })

    if (ai.imageUrl && !ai.error) {
      let finalPath: string | null = null

      // 如果已经是本地路径（/recipes/），移动到 uploads/recipes/
      if (ai.imageUrl.startsWith('/recipes/')) {
        finalPath = moveRecipeToUploads(ai.imageUrl, recipeId)
      } else {
        // 否则下载到本地
        finalPath = await downloadAndStoreImageLocal(ai.imageUrl, recipeId)
      }

      if (finalPath) {
        await prisma.recipe.update({
          where: { id: recipeId },
          data: { imageUrl: finalPath },
        })
        return {
          imageUrl: finalPath,
          error: null,
          fromFallback: false,
        }
      }
    }

    const reason = ai.error || '未返回图片'
    console.warn(`AI 生成不可用 (${reason})，改用本地占位图`)

    const fallback = await generateRecipeImageWithFallback(recipe.name)

    // 如果 fallback 返回的是本地路径，直接使用
    if (fallback.imageUrl?.startsWith('/recipes/')) {
      // 移动到 uploads/recipes 目录
      await prisma.recipe.update({
        where: { id: recipeId },
        data: { imageUrl: fallback.imageUrl },
      })
      return {
        imageUrl: fallback.imageUrl,
        error: null,
        fromFallback: true,
      }
    }

    // 否则下载到本地
    const localPath = await downloadAndStoreImageLocal(fallback.imageUrl!, recipeId)
    if (localPath) {
      await prisma.recipe.update({
        where: { id: recipeId },
        data: { imageUrl: localPath },
      })
      return {
        imageUrl: localPath,
        error: null,
        fromFallback: true,
      }
    }

    return {
      imageUrl: null,
      error: '本地保存失败',
      fromFallback: true,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return { imageUrl: null, error: errorMsg, fromFallback: false }
  }
}
