import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateAndStoreAllRecipes } from '@/lib/recipe-image-generator'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { limit, force, concurrency } = body

    const result = await generateAndStoreAllRecipes({
      limit,
      force: force ?? true,  // 默认强制替换现有图片
      concurrency: concurrency ?? 2
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error replacing recipe images:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
