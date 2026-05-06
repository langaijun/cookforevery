'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

export function UserInfo() {
  const tCommon = useTranslations('Common')
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchUser() {
      try {
        const res = await fetch('/api/profile/me')
        const data = await res.json()
        if (!cancelled && res.ok && data.user) {
          setUserName(data.user.name)
          setUserEmail(data.user.email || '')
        }
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

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="space-y-4">
        {userName && (
          <h2 className="text-xl font-bold">{userName}</h2>
        )}
        {userEmail && (
          <p className="text-muted-foreground">{userEmail}</p>
        )}
      </div>

      <Button onClick={handleLogout} variant="outline" type="button" className="mt-6 w-full">
        {tCommon('logout')}
      </Button>
    </div>
  )
}
