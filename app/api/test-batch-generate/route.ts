import { NextRequest, NextResponse } from 'next/server'
import { generateAndStoreAllRecipes } from '@/lib/recipe-image-generator'

/**
 * 测试接口：批量生成食谱图片（替换默认 Unsplash 图片）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { limit = 5, concurrency = 1 } = body

    console.log(`开始批量生成食谱图片，limit=${limit}, concurrency=${concurrency}`)

    const result = await generateAndStoreAllRecipes({
      limit,
      force: true,  // 强制替换现有图片
      concurrency
    })

    return NextResponse.json({
      ...result,
      message: `生成完成! 成功: ${result.success}, 失败: ${result.failed}, 总计: ${result.total}`
    })
  } catch (error) {
    console.error('Error batch generating recipe images:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
