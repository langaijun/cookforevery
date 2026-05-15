import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateAndStoreRecipeImage } from '@/lib/recipe-image-generator-enhanced'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const result = await generateAndStoreRecipeImage(id)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imageUrl: result.imageUrl,
      fromFallback: result.fromFallback,
    })
  } catch (error) {
    console.error('Error generating recipe image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
