'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

type ShareRow = {
  id: string
  imageUrl: string
  caption: string
  _count: { comments: number; likes: number }
}

export function MyShares() {
  const t = useTranslations('Profile')
  const tCommon = useTranslations('Common')
  const [shares, setShares] = useState<ShareRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchShares() {
      setLoading(true)
      setError(false)
      try {
        const res = await fetch(`/api/profile/shares?page=${page}`)
        const data = await res.json()
        if (!cancelled) {
          if (res.ok && data.shares) {
            setShares(data.shares)
            setTotalPages(data.totalPages ?? 1)
          } else {
            setError(true)
          }
        }
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchShares()
    return () => {
      cancelled = true
    }
  }, [page])

  if (loading) {
    return (
      <div className="text-muted-foreground py-8 text-center">{tCommon('loading')}</div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive text-sm">{t('loadFailed')}</div>
    )
  }

  return (
    <div>
      {shares.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>{t('noShares')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shares.map((share) => (
            <div key={share.id} className="border rounded-lg p-4">
              {share.imageUrl ? (
                <img
                  src={share.imageUrl}
                  alt=""
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              ) : null}
              <p className="mb-2">{share.caption}</p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>💬 {share._count?.comments ?? 0}</span>
                <span>👍 {share._count?.likes ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex justify-center flex-wrap gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`px-4 py-2 rounded-md text-sm ${
                p === page
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {t('page', { n: p })}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
