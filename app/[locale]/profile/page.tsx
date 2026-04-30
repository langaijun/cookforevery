'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { UserInfo } from '@/components/profile/UserInfo'
import { MyShares } from '@/components/profile/MyShares'
import { MyFavorites } from '@/components/profile/MyFavorites'

type Tab = 'info' | 'shares' | 'favorites'

export default function ProfilePage() {
  const t = useTranslations('Profile')
  const tCommon = useTranslations('Common')
  const tAll = useTranslations()
  const { status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const [jwtChecked, setJwtChecked] = useState(false)
  const [hasJwtAuth, setHasJwtAuth] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/me')
      .then((res) => {
        if (!cancelled) setHasJwtAuth(res.ok)
      })
      .finally(() => {
        if (!cancelled) setJwtChecked(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!jwtChecked || status === 'loading') return
    if (status === 'unauthenticated' && !hasJwtAuth) {
      router.replace('/login')
    }
  }, [status, jwtChecked, hasJwtAuth, router])

  if (!jwtChecked || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        {tCommon('loading')}
      </div>
    )
  }

  if (status === 'unauthenticated' && !hasJwtAuth) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">{tAll('Header.profile')}</h1>

          <div className="flex gap-2 sm:gap-4 border-b mb-8 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`pb-2 px-3 sm:px-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === 'info'
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {t('info')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shares')}
              className={`pb-2 px-3 sm:px-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === 'shares'
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {t('myShares')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('favorites')}
              className={`pb-2 px-3 sm:px-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === 'favorites'
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {t('myFavorites')}
            </button>
          </div>

          {activeTab === 'info' ? <UserInfo /> : null}
          {activeTab === 'shares' ? <MyShares /> : null}
          {activeTab === 'favorites' ? <MyFavorites /> : null}
        </div>
      </main>

      <Footer />
    </div>
  )
}
