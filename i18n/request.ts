import { getRequestConfig } from 'next-intl/server'
import { routing } from '@/i18n'

// 定义翻译模块列表
const TRANSLATION_MODULES = [
  'common',
  'recipe',
  'auth',
  'user',
  'share',
  'social',
  'layout',
  'metadata',
]

/**
 * 加载并合并指定语言的所有翻译模块
 */
async function loadMessages(locale: string): Promise<Record<string, any>> {
  const messages: Record<string, any> = {}

  for (const module of TRANSLATION_MODULES) {
    try {
      // 使用动态导入，兼容 Edge Runtime
      const moduleMessages = (await import(`../messages/${locale}/${module}.json`)).default
      Object.assign(messages, moduleMessages)
    } catch (error) {
      console.warn(`Failed to load ${module}.json for ${locale}:`, error)
    }
  }

  return messages
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // 确保使用支持的语言
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: await loadMessages(locale),
  }
})
