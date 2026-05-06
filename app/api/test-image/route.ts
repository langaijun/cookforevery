import { NextResponse } from 'next/server'
import { generateRecipeImage } from '@/lib/tongyi-image'

export async function GET() {
  console.log('DASHSCOPE_API_KEY from process.env:', process.env.DASHSCOPE_API_KEY?.substring(0, 30) + '...')

  const result = await generateRecipeImage({
    name: '红烧肉',
    description: '经典家常菜，肥瘦相间，色泽红亮',
    ingredients: ['五花肉', '冰糖', '生抽', '老抽', '料酒', '八角'],
    tasteTags: ['sweet', 'salty', 'savory'],
    steps: ['五花肉切块焯水', '炒糖色', '加入肉块翻炒', '加调料炖煮']
  })

  if (result.error) {
    console.error('生成失败:', result.error)
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ success: true, imageUrl: result.imageUrl })
}
