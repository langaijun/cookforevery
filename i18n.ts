import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // 支持的语言（12 种）
  locales: ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'vi'],
  // 默认语言
  defaultLocale: 'zh-CN',
  // 默认语言不显示前缀
  localePrefix: 'as-needed',
})

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)
