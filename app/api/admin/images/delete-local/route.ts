/**
 * DELETE /api/admin/images/delete-local?recipeId=xxx
 * 删除食谱的本地图片文件
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import {
  absolutePublicImagePath,
  isLocalRecipeImageUrl,
} from '@/lib/recipe-local-image'

export const runtime = 'nodejs'

export async function DELETE(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recipeId = request.nextUrl.searchParams.get('recipeId')

    if (!recipeId) {
      return NextResponse.json({ error: 'recipeId 参数是必需的' }, { status: 400 })
    }

    // 获取食谱信息
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { id: true, name: true, imageUrl: true }
    })

    if (!recipe) {
      return NextResponse.json({ error: '食谱不存在' }, { status: 404 })
    }

    const { name, imageUrl } = recipe

    if (!imageUrl || !isLocalRecipeImageUrl(imageUrl)) {
      return NextResponse.json({
        success: false,
        message: '该食谱没有本地图片',
        filename: null
      })
    }

    const filepath = absolutePublicImagePath(imageUrl)

    // 删除文件
    let fileDeleted = false
    if (fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath)
        fileDeleted = true
        console.log(`✓ 删除文件: ${filepath}`)
      } catch (error) {
        console.error(`删除文件失败: ${filepath}`, error)
      }
    } else {
      console.log(`文件不存在: ${filepath}`)
    }

    // 更新数据库，清除 imageUrl（设为 null）
    await prisma.recipe.update({
      where: { id: recipeId },
      data: { imageUrl: null }
    })

    return NextResponse.json({
      success: fileDeleted,
      message: fileDeleted ? `已删除 ${name} 的本地图片` : `图片文件已不存在`,
      filename: imageUrl ? imageUrl.split('/').pop() : null
    })
  } catch (error) {
    console.error('Error deleting local image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}