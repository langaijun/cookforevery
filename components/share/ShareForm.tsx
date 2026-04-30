'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

interface ShareFormProps {
  onSuccess?: () => void
}

export function ShareForm({ onSuccess }: ShareFormProps) {
  const t = useTranslations()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [recipeId, setRecipeId] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          imageUrl,
          caption,
          recipeId: recipeId || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setRecipeId('')
        setImageUrl('')
        setCaption('')
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/profile')
        }
      } else if (response.status === 401) {
        router.push('/login')
      } else {
        alert(data.error || '分享失败')
      }
    } catch (error) {
      console.error('分享失败:', error)
      alert('分享失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value)
  }

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaption(e.target.value)
  }

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">{t('ShareForm.title')}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 图片URL */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('ShareForm.imageUrl')}
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={handleImageUrlChange}
            placeholder="https://example.com/image.jpg"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            required
          />
          <p className="text-sm text-muted-foreground">
            {t('ShareForm.imageUrlHint')}
          </p>
        </div>

        {/* 关联食谱（可选） */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('ShareForm.relatedRecipe')}（{t('ShareForm.optional')}）
          </label>
          <select
            value={recipeId}
            onChange={(e) => setRecipeId(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="">{t('ShareForm.selectRecipe')}</option>
          </select>
        </div>

        {/* 文案 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('ShareForm.caption')}
          </label>
          <textarea
            value={caption}
            onChange={handleCaptionChange}
            placeholder={t('ShareForm.captionPlaceholder')}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            required
          />
        </div>

        {/* 提交按钮 */}
        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? t('Common.loading') : t('ShareForm.submit')}
          </Button>
          <Button type="button" variant="outline" onClick={() => {
            setRecipeId('')
            setImageUrl('')
            setCaption('')
          }}>
            {t('Common.reset')}
          </Button>
        </div>
      </form>

      {/* 提示 */}
      <div className="mt-4 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
        <p className="font-medium mb-2">{t('ShareForm.tipsTitle')}</p>
        <ul className="space-y-2">
          <li>• {t('ShareForm.tip1')}</li>
          <li>• {t('ShareForm.tip2')}</li>
          <li>• {t('ShareForm.tip3')}</li>
        </ul>
      </div>
    </div>
  )
}
