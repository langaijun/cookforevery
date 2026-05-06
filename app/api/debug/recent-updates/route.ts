import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const recipes = await prisma.recipe.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      updatedAt: true
    },
    orderBy: { updatedAt: 'desc' },
    take: 10
  })

  return NextResponse.json(recipes)
}
