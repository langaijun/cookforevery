import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { LikeButton } from '@/components/recipe/LikeButton'
import { CommentList } from '@/components/recipe/CommentList'
import { VideoPlayer } from '@/components/recipe/VideoPlayer'
import type { Metadata } from 'next'
import { routing } from '@/i18n'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cookforevery-production.up.railway.app'

/**
 * 生成食谱详情页的元数据
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string; locale: string }>
}): Promise<Metadata> {
  const { id, locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  // 获取食谱数据
  const recipe = await getRecipe(id)

  if (!recipe) {
    return {
      title: t('recipeDetailTitle'),
      description: t('recipeDetailDescription'),
    }
  }

  return {
    title: `${recipe.name} | ${t('siteTitle')}`,
    description: recipe.description,
    openGraph: {
      title: recipe.name,
      description: recipe.description,
      url: `${BASE_URL}/${locale === routing.defaultLocale ? '' : locale}/recipes/${id}`,
      siteName: 'HomeCookHub',
      locale: locale,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: recipe.name,
      description: recipe.description,
    },
    alternates: {
      canonical: `${BASE_URL}/${locale === routing.defaultLocale ? '' : locale}/recipes/${id}`,
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

/**
 * 获取食谱详情
 */
async function getRecipe(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/recipes/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}

export default async function RecipeDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const t = await getTranslations()
  const { id } = await params
  const recipe = await getRecipe(id)

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <Link href="/recipes">
            <Button variant="ghost" className="mb-6">
              ← {t('RecipeDetail.backToList')}
            </Button>
          </Link>
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold mb-2">{t('RecipeDetail.recipeNotFound')}</h1>
            <p className="text-muted-foreground">{t('RecipeDetail.checkLink')}</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8">
        {/* 返回按钮 */}
        <Link href="/recipes">
          <Button variant="ghost" className="mb-6">
            ← {t('RecipeDetail.backToList')}
          </Button>
        </Link>

        {/* 食谱详情 */}
        <div className="max-w-3xl mx-auto space-y-8">
          {/* 图片 */}
          <div className="rounded-lg overflow-hidden border bg-muted aspect-video relative">
            <img
              src={recipe.imageUrl || `https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&h=675&fit=crop&sig=${recipe.id}`}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 标题区域 */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{recipe.name}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {/* 难度 */}
              <div className="flex items-center gap-1">
                <span>{t('RecipeDetail.difficulty')}:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  DIFFICULTY_COLORS[recipe.difficulty]
                }`}>
                  {t(`Difficulty.${recipe.difficulty}`)}
                </span>
              </div>

              {/* 时间 */}
              <div className="flex items-center gap-1">
                <span>⏱</span>
                <span>{recipe.time} {t('Common.minutes')}</span>
              </div>

              {/* 点赞按钮 */}
              <LikeButton recipeId={recipe.id} initialLikeCount={recipe.likeCount || 0} />

              {/* 评论数 */}
              <div className="flex items-center gap-1">
                <span>💬</span>
                <span>{t('RecipeDetail.comments')}: {recipe.commentCount || 0}</span>
              </div>
            </div>

            {/* 口味标签 */}
            <div className="flex flex-wrap gap-2">
              {recipe.tasteTags.map((taste: string) => (
                <span
                  key={taste}
                  className={`px-3 py-1 rounded-full text-sm ${TASTE_COLORS[taste] || 'bg-gray-100 text-gray-800'}`}
                >
                  {t(`Taste.${taste}`)}
                </span>
              ))}
            </div>
          </div>

          {/* 描述 */}
          <div className="prose prose-stone max-w-none">
            <p>{recipe.description}</p>
          </div>

          {/* 食材 */}
          <section>
            <h2 className="mb-4 text-xl font-semibold">{t('RecipeDetail.ingredients')}</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient: string, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-primary rounded-full" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 制作步骤 */}
          <section>
            <h2 className="mb-4 text-xl font-semibold">{t('RecipeDetail.steps')}</h2>
            <ol className="space-y-4">
              {recipe.steps.map((step: string, i: number) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {i + 1}
                  </span>
                  <p className="flex-1 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* 视频教程 */}
          {recipe.videoUrl && (
            <section className="rounded-lg border p-4">
              <h2 className="mb-4 text-xl font-semibold">{t('RecipeDetail.videoTutorial')}</h2>
              <VideoPlayer url={recipe.videoUrl} title={recipe.name} />
              <p className="mt-3 text-sm text-muted-foreground">
                {t('RecipeDetail.watchVideo')}
              </p>
            </section>
          )}

          {/* 评论区 */}
          <section className="pt-8 border-t">
            <CommentList recipeId={recipe.id} />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
