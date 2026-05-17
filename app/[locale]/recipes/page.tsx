import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { RecipeFilters } from '@/components/recipe/RecipeFilters'
import { Recipe } from '@/types/recipe'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n'
import type { Metadata } from 'next'
import { routing } from '@/i18n'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cookforevery-production.up.railway.app'

/**
 * 生成食谱列表页元数据
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: t('recipesTitle'),
    description: t('recipesDescription'),
    openGraph: {
      title: t('recipesTitle'),
      description: t('recipesDescription'),
      url: `${BASE_URL}/${locale === routing.defaultLocale ? '' : locale}/recipes`,
      siteName: 'HomeCookHub',
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('recipesTitle'),
      description: t('recipesDescription'),
    },
    alternates: {
      canonical: `${BASE_URL}/${locale === routing.defaultLocale ? '' : locale}/recipes`,
    },
  }
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

function parseIngredientsParam(raw?: string): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * 获取食谱列表
 */
async function getRecipes(searchParams: {
  search?: string
  difficulty?: string
  taste?: string
  ingredients?: string
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const params = new URLSearchParams()

  if (searchParams?.search) params.set('search', searchParams.search)
  if (searchParams?.difficulty) params.set('difficulty', searchParams.difficulty)
  if (searchParams?.taste) params.set('taste', searchParams.taste)
  if (searchParams?.ingredients) params.set('ingredients', searchParams.ingredients)

  const res = await fetch(`${baseUrl}/api/recipes/list?${params.toString()}`, {
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.recipes || []
}

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    difficulty?: string
    taste?: string
    ingredients?: string
  }>
}) {
  const params = await searchParams
  const t = await getTranslations()
  const recipes = await getRecipes(params)
  const ingredientsFromUrl = parseIngredientsParam(params?.ingredients)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t('Recipes.title')}</h1>
          <p className="mt-2 text-muted-foreground">
            {t('Recipes.subtitle')}
          </p>
        </div>

        {/* 搜索和筛选 */}
        <RecipeFilters
          initialSearch={params?.search}
          initialDifficulty={params?.difficulty}
          initialTastes={params?.taste?.split(',').map((x) => x.trim()).filter(Boolean)}
          initialIngredients={ingredientsFromUrl}
        />

        {/* 食谱列表 */}
        {recipes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{t('Recipes.emptyTitle')}</p>
            <p className="text-sm mt-2">{t('Recipes.emptyDesc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe: Recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="rounded-lg border bg-card overflow-hidden hover:border-primary transition-colors hover:shadow-md"
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

                <div className="p-4 space-y-3">
                  {/* 标题 */}
                  <h3 className="font-semibold text-lg">{recipe.name}</h3>

                {/* 元信息 */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>⏱ {recipe.time} {t('Common.minutes')}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${DIFFICULTY_COLORS[recipe.difficulty]}`}>
                    {t(`Difficulty.${recipe.difficulty}`)}
                  </span>
                </div>

                {/* 口味标签 */}
                <div className="flex flex-wrap gap-1">
                  {recipe.tasteTags.map((taste: string) => (
                    <span
                      key={taste}
                      className={`px-2 py-0.5 rounded-full text-xs ${TASTE_COLORS[taste] || 'bg-gray-100 text-gray-800'}`}
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
      </main>

      <Footer />
    </div>
  )
}
