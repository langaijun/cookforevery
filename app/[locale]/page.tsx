import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Recipe } from '@/types/recipe'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n'
import type { Metadata } from 'next'
import { routing } from '@/i18n'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cookforevery-production.up.railway.app'

/**
 * 生成首页元数据
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: t('homeTitle'),
    description: t('homeDescription'),
    openGraph: {
      title: t('homeTitle'),
      description: t('homeDescription'),
      url: `${BASE_URL}/${locale === routing.defaultLocale ? '' : locale}`,
      siteName: 'HomeCookHub',
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('homeTitle'),
      description: t('homeDescription'),
    },
    alternates: {
      canonical: `${BASE_URL}/${locale === routing.defaultLocale ? '' : locale}`,
    },
  }
}

/**
 * 获取最新食谱
 */
async function getRecentRecipes(limit: number = 6) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/recipes/list?limit=${limit}`, {
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.recipes || []
}

/**
 * 难度标签颜色映射
 */
const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HARD: 'bg-red-100 text-red-800',
}

/**
 * 口味标签颜色映射（使用英文 key，配合 i18n）
 */
const TASTE_COLORS: Record<string, string> = {
  sour: 'bg-green-100 text-green-800',
  sweet: 'bg-pink-100 text-pink-800',
  spicy: 'bg-red-100 text-red-800',
  salty: 'bg-yellow-100 text-yellow-800',
  savory: 'bg-orange-100 text-orange-800',
  numb: 'bg-purple-100 text-purple-800',
  mild: 'bg-gray-100 text-gray-800',
}

export default async function Home() {
  const t = await getTranslations()
  const recentRecipes = await getRecentRecipes(6)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero 区域 */}
        <section className="bg-gradient-to-b from-orange-50 to-white dark:from-orange-950/20 dark:to-black py-20">
          <div className="container text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {t('Home.title')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t('Home.subtitle')}
            </p>

            {/* 搜索框 */}
            <div className="max-w-2xl mx-auto">
              <form action="/recipes" method="get">
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="search"
                    placeholder={t('Home.searchPlaceholder')}
                    className="flex-1 rounded-full border-2 border-orange-300 px-6 py-3 text-lg focus:outline-none focus:border-orange-500 dark:border-orange-800 dark:focus:border-orange-600"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="rounded-full bg-orange-600 hover:bg-orange-700"
                  >
                    {t('Home.searchButton')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* 最新食谱 */}
        <section className="container py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">{t('Home.latestRecipes')}</h2>
            <Link href="/recipes">
              <Button variant="outline">{t('Home.viewAll')} →</Button>
            </Link>
          </div>

          {recentRecipes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>{t('Home.emptyTitle')}</p>
              <p className="text-sm mt-2">{t('Home.emptyDesc')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentRecipes.map((recipe: Recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.id}`}
                  className="group rounded-lg border bg-card overflow-hidden hover:border-primary hover:shadow-lg transition-all"
                >
                  {/* 图片 */}
                  <div className="aspect-video bg-muted relative">
                    <img
                      src={recipe.imageUrl || `https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&h=600&fit=crop&sig=${recipe.id}`}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>

                  <div className="p-6 space-y-4">
                    {/* 标题 */}
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {recipe.name}
                    </h3>

                  {/* 元信息 */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span>⏱</span>
                      <span>{recipe.time} {t('Common.minutes')}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      DIFFICULTY_COLORS[recipe.difficulty]
                    }`}>
                      {t(`Difficulty.${recipe.difficulty}`)}
                    </span>
                  </div>

                  {/* 口味标签 */}
                  <div className="flex flex-wrap gap-1">
                    {recipe.tasteTags.map((taste: string) => (
                      <span
                        key={taste}
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          TASTE_COLORS[taste] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {t(`Taste.${taste}`)}
                      </span>
                    ))}
                  </div>

                  {/* 描述 */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {recipe.description}
                  </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
