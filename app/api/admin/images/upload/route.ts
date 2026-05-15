/**
 * POST /api/admin/images/upload
 * 批量上传食谱图片到 Railway Bucket
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToBucket, isBucketConfigured } from '@/lib/railway-bucket'
import fs from 'fs'
import {
  absolutePublicImagePath,
  contentTypeForImageFilename,
  isLocalRecipeImageUrl,
} from '@/lib/recipe-local-image'

export const runtime = 'nodejs'

interface UploadResult {
  success: number
  failed: number
  results: Array<{
    recipeId: string
    success: boolean
    url?: string
    error?: string
  }>
}

function extractFilename(imageUrl: string): string {
  return imageUrl.split('/').pop() || ''
}

async function uploadSingleRecipe(recipeId: string): Promise<{
  success: boolean
  url?: string
  error?: string
}> {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { id: true, name: true, imageUrl: true }
  })

  if (!recipe) {
    return { success: false, error: '食谱不存在' }
  }

  const { name, imageUrl } = recipe

  if (!imageUrl || !isLocalRecipeImageUrl(imageUrl)) {
    return { success: false, error: '没有本地图片需要上传' }
  }

  const localImageUrl = imageUrl
  const filename = extractFilename(localImageUrl)
  if (!filename) {
    return { success: false, error: '无法解析文件名' }
  }

  const filepath = absolutePublicImagePath(localImageUrl)
  if (!fs.existsSync(filepath)) {
    return { success: false, error: '本地文件不存在' }
  }

  let buffer: Buffer
  try {
    buffer = fs.readFileSync(filepath)
  } catch {
    return { success: false, error: '读取文件失败' }
  }

  const bucketKey = `recipes/${filename}`
  const contentType = contentTypeForImageFilename(filename)
  try {
    const bucketUrl = await uploadToBucket(buffer, bucketKey, contentType)

    // 更新数据库
    await prisma.recipe.update({
      where: { id: recipeId },
      data: { imageUrl: bucketUrl }
    })

    return { success: true, url: bucketUrl }
  } catch (error) {
    return { success: false, error: `上传失败: ${error}` }
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 检查 bucket 配置
    if (!isBucketConfigured()) {
      return NextResponse.json({ error: 'Railway Bucket 未配置' }, { status: 500 })
    }

    const body = await request.json()
    const { recipeIds } = body

    if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
      return NextResponse.json({ error: 'recipeIds 是必需的' }, { status: 400 })
    }

    // 验证所有 recipeId 存在
    const validRecipes = await prisma.recipe.findMany({
      where: { id: { in: recipeIds } },
      select: { id: true }
    })

    const validIds = validRecipes.map(r => r.id)
    const invalidIds = recipeIds.filter(id => !validIds.includes(id))

    if (invalidIds.length > 0) {
      console.warn(`无效的 recipeId: ${invalidIds.join(', ')}`)
    }

    // 执行批量上传
    const results: UploadResult['results'] = []
    let successCount = 0
    let failedCount = 0

    for (const recipeId of validIds) {
      console.log(`正在上传食谱: ${recipeId}`)
      const result = await uploadSingleRecipe(recipeId)

      results.push({
        recipeId,
        success: result.success,
        url: result.url,
        error: result.error
      })

      if (result.success) {
        successCount++
      } else {
        failedCount++
      }
    }

    return NextResponse.json({
      success: successCount,
      failed: failedCount,
      results
    } as UploadResult)
  } catch (error) {
    console.error('Error uploading images:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}