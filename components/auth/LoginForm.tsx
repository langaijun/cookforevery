'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export function LoginForm() {
  const t = useTranslations()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [error, setError] = useState('')

  const handleSendCode = async () => {
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || '发送失败，请稍后再试')
      } else {
        setCodeSent(true)
      }
    } catch (err) {
      console.error('发送验证码失败:', err)
      setError('发送失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || '验证码不正确或已过期')
        setLoading(false)
        return
      }

      // 登录成功，跳转到首页
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('登录失败:', err)
      setError('登录失败，请稍后再试')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('LoginForm.emailLabel')}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('LoginForm.codeLabel')}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2"
            required
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleSendCode}
            disabled={loading || codeSent}
            className="whitespace-nowrap"
          >
            {codeSent ? t('LoginForm.codeSent') : t('LoginForm.sendCode')}
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? t('LoginForm.loading') : t('LoginForm.login')}
      </Button>
    </form>
  )
}
