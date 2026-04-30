import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Difficulty } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const difficulty = searchParams.get('difficulty') as Difficulty | null;

    const skip = (page - 1) * limit;

    const where: any = {
      AND: [],
    };

    if (search) {
      where.AND.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { nameEn: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (difficulty) {
      where.AND.push({ difficulty });
    }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where: where.AND.length > 0 ? where : undefined,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      }),
      prisma.recipe.count({
        where: where.AND.length > 0 ? where : undefined,
      }),
    ]);

    return NextResponse.json({
      recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.description || !body.difficulty || !body.ingredients || !body.steps) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate a unique providerId if not provided
    const providerId = body.providerId || `manual-${Date.now()}`;

    const recipe = await prisma.recipe.create({
      data: {
        name: body.name,
        nameEn: body.nameEn || null,
        description: body.description,
        difficulty: body.difficulty,
        tasteTags: body.tasteTags || [],
        time: body.time || 0,
        ingredients: body.ingredients,
        steps: body.steps,
        videoUrl: body.videoUrl || null,
        providerId,
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
