import { NextRequest, NextResponse } from 'next/server'
import { generateAndStoreAllRecipes } from '@/lib/recipe-image-generator'

/**
 * 测试接口：批量替换食谱图片（无认证，仅用于测试）
 * 部署到生产环境后访问此接口即可批量生成图片
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { limit = 10, concurrency = 2, force = true } = body

    console.log(`[批量替换] 开始生成图片，limit=${limit}, concurrency=${concurrency}, force=${force}`)

    const result = await generateAndStoreAllRecipes({
      limit,
      force,
      concurrency
    })

    return NextResponse.json({
      ...result,
      message: `批量替换完成! 成功: ${result.success}, 失败: ${result.failed}, 总计: ${result.total}`
    })
  } catch (error) {
    console.error('批量替换失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
