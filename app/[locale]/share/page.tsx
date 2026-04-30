import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ShareCard } from '@/components/share/ShareCard'
import { SharePageForm } from '@/components/share/SharePageForm'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cookforevery-production.up.railway.app'

/**
 * 生成分享广场页元数据
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SharePage' })
  const tMeta = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: t('title'),
    description: t('subtitle'),
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      url: `${BASE_URL}/${locale === routing.defaultLocale ? '' : locale}/share`,
      siteName: 'HomeCookHub',
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('subtitle'),
    },
    alternates: {
      canonical: `${BASE_URL}/${locale === routing.defaultLocale ? '' : locale}/share`,
    },
  }
}

type ShareListItem = {
  id: string
  imageUrl: string
  caption: string
  createdAt: string
  user: { id: string; name: string; avatar: string | null }
  recipe: { id: string; name: string } | null
  _count: { comments: number; likes: number }
}

async function getShares(): Promise<ShareListItem[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/shares?limit=24`, {
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.shares ?? []
}

export default async function SharePage() {
  const t = await getTranslations()
  const shares = await getShares()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8 space-y-10">
        <div>
          <h1 className="text-3xl font-bold">{t('SharePage.title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('SharePage.subtitle')}</p>
        </div>

        {shares.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{t('SharePage.emptyTitle')}</p>
            <p className="text-sm mt-2">{t('SharePage.emptyDesc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {shares.map((s) => (
              <ShareCard
                key={s.id}
                id={s.id}
                imageUrl={s.imageUrl}
                caption={s.caption}
                createdAt={new Date(s.createdAt)}
                user={s.user}
                recipe={s.recipe}
                _count={s._count}
              />
            ))}
          </div>
        )}

        <SharePageForm />
      </main>

      <Footer />
    </div>
  )
}
