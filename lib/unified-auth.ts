import { NextRequest, cookies } from 'next/server'
import { jwtVerify } from 'jose'
import { auth } from '@/lib/auth'

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production'
)

interface AuthUser {
  id: string
  email: string | null
  name: string | null
  avatar: string | null
  isAdmin: boolean
}

/**
 * 统一认证：支持 NextAuth session 和 JWT token
 */
export async function getAuthenticatedUser(request?: NextRequest): Promise<AuthUser | null> {
  // 首先检查 NextAuth session（OAuth 登录）
  const session = await auth()
  if (session?.user?.id) {
    return {
      id: session.user.id,
      email: session.user.email ?? null,
      name: session.user.name ?? null,
      avatar: session.user.avatar ?? null,
      isAdmin: session.user.isAdmin ?? false,
    }
  }

  // 然后检查 JWT token（邮箱验证码登录）
  const cookieStore = request?.cookies || cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      id: payload.userId as string,
      email: '', // JWT 只存储 userId，需要从数据库获取
      name: '',
      avatar: null,
      isAdmin: false, // 需要从数据库获取
    }
  } catch {
    return null
  }
}

/**
 * 获取认证用户信息（包含 isAdmin）
 * 从数据库查询完整信息
 */
export async function getAuthenticatedUserWithDb(
  request?: NextRequest
): Promise<AuthUser | null> {
  const user = await getAuthenticatedUser(request)
  if (!user) return null

  // 如果是 OAuth 登录，直接返回 session 数据
  if (user.email) {
    return user
  }

  // 如果是 JWT 登录，从数据库查询完整信息
  const { prisma } = await import('@/lib/prisma')
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      isAdmin: true,
    },
  })

  if (!dbUser) return null

  return dbUser
}

/**
 * 检查用户是否已认证
 */
export async function isAuthenticated(request?: NextRequest): Promise<boolean> {
  const user = await getAuthenticatedUser(request)
  return user !== null
}

/**
 * 要求管理员权限
 */
export async function requireAdmin(
  request?: NextRequest
): Promise<AuthUser> {
  const user = await getAuthenticatedUserWithDb(request)

  if (!user) {
    throw new Error('Unauthorized: Authentication required')
  }

  if (!user.isAdmin) {
    throw new Error('Forbidden: Admin access required')
  }

  return user
}
