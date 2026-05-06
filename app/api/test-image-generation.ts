import { NextRequest, NextResponse } from 'next/server'
import { generateRecipeImage } from '@/lib/tongyi-image'

export async function POST(request: NextRequest) {
  try {
    const { recipe } = await request.json()

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe data is required' }, { status: 400 })
    }

    console.log('Testing image generation with recipe:', recipe.name)

    // 测试用的简单食谱数据
    const testRecipe = {
      name: recipe.name || '宫保鸡丁',
      description: recipe.description || '经典川菜，鸡肉嫩滑，花生香脆，口感丰富',
      ingredients: recipe.ingredients || ['鸡胸肉', '花生米', '干辣椒', '葱', '姜', '蒜', '花椒'],
      tasteTags: recipe.tasteTags || ['spicy', 'savory'],
      steps: recipe.steps || [
        '鸡胸肉切丁，用料酒、生抽、淀粉腌制15分钟',
        '花生米炸至金黄，备用',
        '热锅下油，爆香葱姜蒜和干辣椒',
        '下鸡丁翻炒至变色',
        '加入调味料，炒匀后加入花生米即可'
      ]
    }

    // 生成图片
    const result = await generateRecipeImage(testRecipe)

    if (result.error) {
      console.error('Image generation failed:', result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    console.log('Image generation successful:', result.imageUrl)

    return NextResponse.json({
      success: true,
      imageUrl: result.imageUrl,
      message: 'Image generated successfully'
    })

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}