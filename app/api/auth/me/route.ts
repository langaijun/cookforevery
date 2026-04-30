import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production'
)

/**
 * GET /api/auth/me
 * 获取当前登录用户信息
 */
export async function GET(request: NextRequest) {
  try {
    // 从 cookie 获取 token
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    // 验证 token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        provider: true,
        isBanned: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    if (user.isBanned) {
      return NextResponse.json(
        { error: '账户已被封禁' },
        { status: 403 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    )
  }
}
