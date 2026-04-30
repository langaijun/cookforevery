import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { routing } from '@/i18n'
import { notFound } from 'next/navigation'
import { SessionProvider } from '@/components/providers/SessionProvider'
import "../globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cookforevery-production.up.railway.app'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  const languages: Record<string, string> = {
    'en': `${BASE_URL}/en`,
    'zh-CN': `${BASE_URL}/zh-CN`,
    'zh-TW': `${BASE_URL}/zh-TW`,
    'ja': `${BASE_URL}/ja`,
    'ko': `${BASE_URL}/ko`,
    'es': `${BASE_URL}/es`,
    'fr': `${BASE_URL}/fr`,
    'de': `${BASE_URL}/de`,
    'it': `${BASE_URL}/it`,
    'pt': `${BASE_URL}/pt`,
    'ru': `${BASE_URL}/ru`,
    'vi': `${BASE_URL}/vi`,
    'x-default': `${BASE_URL}/zh-CN`,
  }

  return {
    metadataBase: BASE_URL,
    title: {
      template: `%s | ${t('siteTitle')}`,
      default: t('siteTitle'),
    },
    description: t('siteDescription'),
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages,
    },
    openGraph: {
      title: t('siteTitle'),
      description: t('siteDescription'),
      url: `${BASE_URL}/${locale}`,
      siteName: 'HomeCookHub',
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('siteTitle'),
      description: t('siteDescription'),
    },
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
    children: React.ReactNode
    params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages({ locale })

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
