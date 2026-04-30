'use client'

import { useSession } from 'next-auth/react'

function hasAuthTokenCookie(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split('; ').some((c) => c.trim().startsWith('auth-token='))
}

/**
 * OAuth（NextAuth session）与邮箱验证码（auth-token）任一存在即视为已登录。
 */
export function useSessionOrJwt() {
  const { status } = useSession()

  const pending = status === 'loading'
  const loggedIn = status === 'authenticated' || hasAuthTokenCookie()

  return { pending, loggedIn }
}
