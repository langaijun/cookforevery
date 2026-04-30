import { MetadataRoute } from 'next'
import { routing } from '@/i18n'
import { prisma } from '@/lib/prisma'

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://cookforevery-production.up.railway.app'

function localePrefix(locale: string): string {
  return locale === routing.defaultLocale ? '' : `/${locale}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // 静态页面路径
  const staticPaths = ['/recipes', '/share', '/profile', '/login']

  // 获取所有活跃的食谱
  const recipes = await prisma.recipe.findMany({
    where: { isActive: true },
    select: { id: true, updatedAt: true },
  })

  for (const locale of routing.locales) {
    const prefix = localePrefix(locale)
    const localeRoot = `${BASE_URL}${prefix}`

    // 首页
    entries.push({
      url: localeRoot,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    })

    // 静态页面
    for (const path of staticPaths) {
      entries.push({
        url: `${localeRoot}${path}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }

    // 食谱详情页
    for (const recipe of recipes) {
      entries.push({
        url: `${localeRoot}/recipes/${recipe.id}`,
        lastModified: recipe.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  }

  return entries
}
