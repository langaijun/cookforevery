import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'
import { authOptions } from '@/lib/auth'

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production'
)

const userSelect = {
  id: true,
  email: true,
  name: true,
  avatar: true,
  provider: true,
  isBanned: true,
} as const

/**
 * GET /api/auth/me
 * 获取当前登录用户信息（OAuth：NextAuth session；邮箱验证码：auth-token）
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.email) {
      const oauthUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: userSelect,
      })

      if (!oauthUser) {
        return NextResponse.json({ error: '用户不存在' }, { status: 404 })
      }
      if (oauthUser.isBanned) {
        return NextResponse.json({ error: '账户已被封禁' }, { status: 403 })
      }
      return NextResponse.json({ user: oauthUser })
    }

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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
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
