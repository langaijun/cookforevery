import { NextResponse } from 'next/server'
import { generateAndStoreRecipeImage } from '@/lib/recipe-image-generator'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 获取第一个没有图片的食谱
    const recipe = await prisma.recipe.findFirst({
      where: {
        isActive: true,
        imageUrl: null
      },
      select: {
        id: true,
        name: true
      }
    })

    if (!recipe) {
      return NextResponse.json({ message: '没有需要生成图片的食谱' })
    }

    console.log(`开始为食谱 [${recipe.id}] ${recipe.name} 生成图片...`)

    const result = await generateAndStoreRecipeImage(recipe.id)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      recipeId: recipe.id,
      recipeName: recipe.name,
      imageUrl: result.imageUrl
    })
  } catch (error) {
    console.error('Error generating recipe image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
