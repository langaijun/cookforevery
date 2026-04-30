'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

type ProfileUser = {
  id: string
  email: string | null
  name: string
  avatar: string | null
  provider: string
  createdAt: string
  _count: {
    shares: number
    comments: number
    likes: number
    favorites: number
  }
}

export function UserInfo() {
  const t = useTranslations('Profile')
  const tCommon = useTranslations('Common')
  const [user, setUser] = useState<ProfileUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchUser() {
      try {
        const res = await fetch('/api/profile/me')
        const data = await res.json()
        if (!cancelled && res.ok && data.user) {
          setUser(data.user as ProfileUser)
        } else if (!cancelled && !res.ok) {
          setError(true)
        }
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchUser()
    return () => {
      cancelled = true
    }
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    await signOut({ callbackUrl: '/' })
  }

  if (loading) {
    return (
      <div className="text-muted-foreground py-8 text-center">{tCommon('loading')}</div>
    )
  }

  if (error || !user) {
    return (
      <div className="text-center py-8 text-destructive text-sm">{t('loadFailed')}</div>
    )
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center mb-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatar || undefined} alt={user.name} />
          <AvatarFallback>
            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          {user.email ? (
            <p className="text-muted-foreground">{user.email}</p>
          ) : null}
          <p className="text-sm text-muted-foreground mt-1">
            {t('joinedAt')}: {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold">{user._count.shares}</div>
          <div className="text-sm text-muted-foreground">{t('shares')}</div>
        </div>
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold">{user._count.comments}</div>
          <div className="text-sm text-muted-foreground">{t('comments')}</div>
        </div>
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold">{user._count.likes}</div>
          <div className="text-sm text-muted-foreground">{t('likes')}</div>
        </div>
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold">{user._count.favorites}</div>
          <div className="text-sm text-muted-foreground">{t('favorites')}</div>
        </div>
      </div>

      <Button onClick={handleLogout} variant="outline" type="button">
        {t('logout')}
      </Button>
    </div>
  )
}
