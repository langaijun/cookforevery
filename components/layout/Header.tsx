'use client'

import { useEffect, useState } from 'react'
import { Link, useRouter } from '@/i18n'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { useSession, signOut } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={displayImage} alt={displayName || 'User'} />
                    <AvatarFallback>
                      {(displayName || displayEmail || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    {displayEmail ? (
                      <p className="text-xs leading-none text-muted-foreground">
                        {displayEmail}
                      </p>
                    ) : null}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push('/profile')}>
                  {t('Header.profile')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  {t('Header.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
