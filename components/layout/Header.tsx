'use client'

import { useEffect, useState } from 'react'
import { Link, useRouter } from '@/i18n'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { useSession, signOut } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SearchBar } from './SearchBar'

type JwtUserBrief = {
  name: string
  email: string | null
  avatar: string | null
}

export function Header() {
  const t = useTranslations()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [jwtUser, setJwtUser] = useState<JwtUserBrief | null>(null)
  const [jwtDone, setJwtDone] = useState(false)
  const [userInfoExpanded, setUserInfoExpanded] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'authenticated') {
      setJwtDone(true)
      return
    }
    let cancelled = false
    fetch('/api/auth/me')
      .then(async (res) => {
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (data.user && !cancelled) {
          setJwtUser({
            name: data.user.name,
            email: data.user.email ?? null,
            avatar: data.user.avatar ?? null,
          })
        }
      })
      .finally(() => {
        if (!cancelled) setJwtDone(true)
      })
    return () => {
      cancelled = true
    }
  }, [status])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setJwtUser(null)
    await signOut({ callbackUrl: '/' })
  }

  const showUserMenu = Boolean(session?.user || jwtUser)
  const displayName = session?.user?.name ?? jwtUser?.name ?? ''
  const displayEmail = session?.user?.email ?? jwtUser?.email ?? ''
  const displayImage = session?.user?.image ?? jwtUser?.avatar ?? undefined

  const navLoading =
    status === 'loading' || (status === 'unauthenticated' && !jwtDone)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">HomeCookHub</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/recipes"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t('Header.recipes')}
          </Link>
          <Link
            href="/share"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {t('Header.share')}
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <SearchBar />

          {navLoading ? (
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
          ) : showUserMenu ? (
            <div className="relative">
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
                onClick={() => setUserInfoExpanded(!userInfoExpanded)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={displayImage} alt={displayName || 'User'} />
                  <AvatarFallback>
                    {(displayName || displayEmail || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>

              {userInfoExpanded && (
                <div className="absolute right-0 top-12 w-64 p-4 bg-white border rounded-lg shadow-lg z-50">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={displayImage} alt={displayName || 'User'} />
                        <AvatarFallback>
                          {(displayName || displayEmail || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{displayName}</p>
                        {displayEmail && (
                          <p className="text-xs text-muted-foreground">{displayEmail}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 pt-2 border-t">
                      <button
                        onClick={() => { router.push('/profile'); setUserInfoExpanded(false) }}
                        className="text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {t('Header.profile')}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {t('Header.logout')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {t('Header.login')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
