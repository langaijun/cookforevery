import { NextRequest, NextResponse } from 'next/server'
import { verifyCode as verifyRedisCode } from '@/lib/resend'
import { prisma } from '@/lib/prisma'
import { Provider } from '@prisma/client'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production'
)

/**
 * 生成 JWT token
 */
async function generateToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

/**
 * POST /api/auth/verify-code
 * 验证邮箱验证码并登录
 */
export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    // 验证参数
    if (!email || !code) {
      return NextResponse.json(
        { error: '邮箱和验证码不能为空' },
        { status: 400 }
      )
    }

    // 验证验证码
    const result = await verifyRedisCode(email, code)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || '验证码不正确或已过期' },
        { status: 400 }
      )
    }

    // 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          provider: Provider.EMAIL,
          providerId: email,
        },
      })
    }

    // 如果用户被封禁
    if (user.isBanned) {
      return NextResponse.json(
        { error: '账户已被封禁' },
        { status: 403 }
      )
    }

    // 生成 JWT token
    const token = await generateToken(user.id)

    // 设置 cookie
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 天
      path: '/',
    })

    return response
  } catch (error) {
    console.error('验证码验证失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
