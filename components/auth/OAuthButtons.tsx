'use client'

import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export function OAuthButtons() {
  const t = useTranslations()

  const handleGitHubLogin = async () => {
    await signIn('github', { callbackUrl: '/' })
  }

  const handleGoogleLogin = async () => {
    await signIn('google', { callbackUrl: '/' })
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background">{t('OAuth.or')}</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGitHubLogin}
        className="w-full"
      >
        {t('OAuth.github')}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        className="w-full"
      >
        {t('OAuth.google')}
      </Button>
    </div>
  )
}
