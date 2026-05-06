import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { LoginForm } from '@/components/auth/LoginForm'
import { OAuthButtons } from '@/components/auth/OAuthButtons'
import { getTranslations } from 'next-intl/server'

export default async function LoginPage() {
  const t = await getTranslations()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8">
        <div className="max-w-md mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {t('Login.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('Login.subtitle')}
            </p>
          </div>

          {/* 邮箱验证码登录 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              {t('Login.emailLogin')}
            </h2>
            <LoginForm />
          </div>

          {/* OAuth 登录 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              {t('Login.oauthLogin')}
            </h2>
            <OAuthButtons />
          </div>

          {/* OAuth 登录 */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">或</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <h2 className="text-xl font-semibold mb-4">
              {t('Login.oauthLogin')}
            </h2>
            <OAuthButtons />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
