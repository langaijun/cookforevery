import { getRequestConfig } from 'next-intl/server'
import { routing } from '@/i18n'

// 导入所有翻译文件（使用静态导入确保在构建时可用）
async function loadMessages(locale: string): Promise<Record<string, any>> {
  const messages: Record<string, any> = {}

  // 使用 require 加载 JSON 文件（在 Node.js 环境中更可靠）
  try {
    const modules = [
      'common', 'recipe', 'auth', 'user', 'share', 'social',
      'layout', 'metadata', 'home', 'ingredientInput', 'commentList',
      'commentForm', 'recipeDetail', 'recipes', 'login', 'loginForm',
      'header', 'footer', 'oauth', 'sharePage', 'shareForm', 'shareCard'
    ]

    for (const module of modules) {
      try {
        const filePath = `./messages/${locale}/${module}.json`
        const moduleMessages = await import(filePath)
        Object.assign(messages, moduleMessages.default)
      } catch (error) {
        console.warn(`Failed to load ${module}.json for ${locale}:`, error)
      }
    }
  } catch (error) {
    console.error(`Error loading messages for ${locale}:`, error)
  }

  return messages
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // 确保使用支持的语言
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  const messages = await loadMessages(locale)

  return {
    locale,
    messages,
  }
})
