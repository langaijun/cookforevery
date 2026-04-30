import { NextResponse } from 'next/server'

/**
 * POST /api/auth/logout
 * 登出
 */
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: '登出成功',
  })

  // 清除 auth-token cookie
  response.cookies.delete('auth-token')

  return response
}
