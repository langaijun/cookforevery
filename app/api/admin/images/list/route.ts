/**
 * GET /api/admin/images/list
 * 获取食谱图片列表，支持按状态筛选
 */

import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { isLocalRecipeImageUrl } from '@/lib/recipe-local-image'
import { normalizeRecipeImageUrl } from '@/lib/recipe-image-url'

export const runtime = 'nodejs'

interface ImageStatus {
  recipeId: string
  name: string
  description: string
  imageUrl: string | null
  status: 'local' | 'uploaded' | 'none'
  localPath: string
  bucketUrl: string
}

function getStatus(imageUrl: string | null): ImageStatus['status'] {
  if (!imageUrl) return 'none'
  if (isLocalRecipeImageUrl(imageUrl)) return 'local'
  if (imageUrl.startsWith('/api/storage/')) return 'uploaded'
  if (imageUrl.startsWith('https://')) return 'uploaded'
  return 'none'
}

function extractLocalPath(imageUrl: string | null): string {
  if (isLocalRecipeImageUrl(imageUrl)) {
    return imageUrl!
  }
  return ''
}

function isBucketUrl(imageUrl: string | null): boolean {
  return !!imageUrl && (imageUrl.startsWith('https://') || imageUrl.startsWith('/api/storage/'))
}

const localWhere: Prisma.RecipeWhereInput = {
  OR: [
    { imageUrl: { startsWith: '/recipes/' } },
    { imageUrl: { startsWith: '/uploads/recipes/' } },
  ],
}

const uploadedWhere: Prisma.RecipeWhereInput = {
  OR: [
    { imageUrl: { startsWith: 'https://' } },
    { imageUrl: { startsWith: '/api/storage/' } },
  ],
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const rawStatus = searchParams.get('status')
    const status =
      rawStatus === 'local' || rawStatus === 'uploaded' || rawStatus === 'none'
        ? rawStatus
        : 'all'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))

    const skip = (page - 1) * limit

    let whereClause: Prisma.RecipeWhereInput = {}
    if (status === 'local') {
      whereClause = localWhere
    } else if (status === 'uploaded') {
      whereClause = uploadedWhere
    } else if (status === 'none') {
      whereClause = { OR: [{ imageUrl: null }, { imageUrl: '' }] }
    }

    const [total, recipes, statsLocal, statsUploaded, statsNone] = await Promise.all([
      prisma.recipe.count({ where: whereClause }),
      prisma.recipe.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true,
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.recipe.count({ where: localWhere }),
      prisma.recipe.count({ where: uploadedWhere }),
      prisma.recipe.count({
        where: { OR: [{ imageUrl: null }, { imageUrl: '' }] },
      }),
    ])

    const items: ImageStatus[] = recipes.map((recipe) => {
      const imageUrl = normalizeRecipeImageUrl(recipe.imageUrl) ?? recipe.imageUrl
      return {
        recipeId: recipe.id,
        name: recipe.name,
        description: recipe.description,
        imageUrl,
        status: getStatus(imageUrl),
        localPath: extractLocalPath(recipe.imageUrl),
        bucketUrl: isBucketUrl(imageUrl) ? (imageUrl as string) : '',
      }
    })

    return NextResponse.json({
      recipes: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        local: statsLocal,
        uploaded: statsUploaded,
        none: statsNone,
      },
    })
  } catch (error) {
    console.error('Error fetching image list:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
