import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { auth } from '@/lib/auth'

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production'
)

/**
 * OAuth（NextAuth session）与邮箱验证码（auth-token JWT）统一解析用户 id。
 */
export async function getAuthenticatedUserId(
  request: NextRequest
): Promise<string | null> {
  const session = await auth()
  if (session?.user?.id) return session.user.id

  const token = request.cookies.get('auth-token')?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.userId as string
  } catch {
    return null
  }
}
