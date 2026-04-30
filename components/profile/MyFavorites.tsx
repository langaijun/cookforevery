'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n'

type FavRow = {
  id: string
  recipeId: string
  recipe: {
    id: string
    name: string
    description: string
  } | null
}

type FavWithRecipe = FavRow & { recipe: NonNullable<FavRow['recipe']> }

export function MyFavorites() {
  const t = useTranslations('Profile')
  const tCommon = useTranslations('Common')
  const [favorites, setFavorites] = useState<FavRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchFavorites() {
      setLoading(true)
      setError(false)
      try {
        const res = await fetch(`/api/profile/favorites?page=${page}`)
        const data = await res.json()
        if (!cancelled) {
          if (res.ok && data.favorites) {
            setFavorites(data.favorites)
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
    fetchFavorites()
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
      {favorites.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground space-y-2">
          <p>{t('noFavorites')}</p>
          <Link href="/recipes" className="text-primary hover:underline inline-block">
            {t('browseRecipes')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites
            .filter((f): f is FavWithRecipe => f.recipe != null)
            .map((fav) => (
            <Link
              key={fav.id}
              href={`/recipes/${fav.recipe.id}`}
              className="border rounded-lg p-4 hover:border-primary transition-colors"
            >
              <h3 className="font-semibold mb-2">{fav.recipe.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {fav.recipe.description}
              </p>
            </Link>
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
