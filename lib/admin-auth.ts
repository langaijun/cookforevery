import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'

/**
 * 在服务器端获取当前用户认证状态
 */
export async function getAuthenticatedServerUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.isAdmin) {
    return null
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    isAdmin: session.user.isAdmin,
  }
}

/**
 * 包装 API 路由的认证检查
 */
export async function requireAdmin() {
  const user = await getAuthenticatedServerUser()

  if (!user) {
    throw new Error('Unauthorized: Admin access required')
  }

  return user
}

/**
 * 检查用户是否已认证
 */
export async function isAuthenticated() {
  const session = await getServerSession(authOptions)
  return !!session?.user
}