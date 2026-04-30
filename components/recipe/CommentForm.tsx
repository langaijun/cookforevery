'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useTranslations } from 'next-intl'

interface CommentFormProps {
  recipeId?: string
  shareId?: string
  onSuccess?: () => void
  onCancel?: () => void
  autoFocus?: boolean
}

export function CommentForm({ recipeId, shareId, onSuccess, onCancel, autoFocus = false }: CommentFormProps) {
  const t = useTranslations()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const authToken = typeof document !== 'undefined'
    ? document.cookie.split('; ').find(c => c.trim().startsWith('auth-token='))?.split('=')[1]
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) return

    if (!authToken) {
      router.push('/login')
      return
    }

    if (!recipeId && !shareId) return

    setLoading(true)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `auth-token=${authToken}`,
        },
        body: JSON.stringify({
          recipeId: recipeId || undefined,
          shareId: shareId || undefined,
          content: content.trim(),
        }),
      })

      const data = await res.json()

      if (data.success) {
        setContent('')
        onSuccess?.()
      } else {
        console.error('Failed to post comment:', data.error)
      }
    } catch (error) {
      console.error('Failed to post comment:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('CommentForm.placeholder') || 'Write a comment...'}
        rows={3}
        autoFocus={autoFocus}
        disabled={loading}
      />
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={loading}>
            {t('Common.cancel') || 'Cancel'}
          </Button>
        )}
        <Button type="submit" size="sm" disabled={loading || !content.trim()}>
          {loading ? (t('Common.loading') || 'Loading...') : (t('CommentForm.submit') || 'Post comment')}
        </Button>
      </div>
    </form>
  )
}
