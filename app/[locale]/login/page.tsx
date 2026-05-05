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

          {/* 邮箱验证码登录（暂时禁用） */}
          {/* <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              {t('Login.emailLogin')}
            </h2>
            <LoginForm />
          </div> */}

          {/* OAuth 登录 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              {t('Login.oauthLogin')}
            </h2>
            <OAuthButtons />
          </div>

          {/* 邮箱登录维护提示 */}
          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-center">
              📧 邮箱验证码登录功能暂时维护中，请使用 GitHub/Google 方式登录
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
