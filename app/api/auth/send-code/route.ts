import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationCode } from '@/lib/resend'
import { codeCache } from '@/lib/redis'

/**
 * POST /api/auth/send-code
 * 发送邮箱验证码
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // 验证邮箱格式
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      )
    }

    // 检查 Redis 是否有未过期的验证码（防止重复发送）
    const existingCode = await codeCache.get(email)
    if (existingCode) {
      return NextResponse.json(
        { error: '验证码已发送，请稍后再试' },
        { status: 429 }
      )
    }

    // 发送验证码
    const result = await sendVerificationCode(email)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || '发送失败，请稍后再试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '验证码已发送，请查收邮件'
    })
  } catch (error) {
    console.error('发送验证码失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
