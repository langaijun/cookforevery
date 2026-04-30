'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { Heart, HeartOff } from 'lucide-react'

interface LikeButtonProps {
  recipeId?: string
  shareId?: string
  initialLikeCount?: number
  className?: string
}

interface LikeStatus {
  liked: boolean
  likeId: string | null
}

export function LikeButton({ recipeId, shareId, initialLikeCount = 0, className }: LikeButtonProps) {
  const t = useTranslations()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [likeStatus, setLikeStatus] = useState<LikeStatus>({ liked: false, likeId: null })
  const [likeCount, setLikeCount] = useState(initialLikeCount)

  const authToken = typeof document !== 'undefined'
    ? document.cookie.split('; ').find(c => c.trim().startsWith('auth-token='))?.split('=')[1]
    : null

  // Fetch initial like status
  useEffect(() => {
    if (!recipeId && !shareId) return

    const fetchLikeStatus = async () => {
      try {
        const params = new URLSearchParams()
        if (recipeId) params.append('recipeId', recipeId)
        if (shareId) params.append('shareId', shareId)

        const res = await fetch(`/api/likes?${params.toString()}`, {
          cache: 'no-store',
        })

        if (res.ok) {
          const data: LikeStatus = await res.json()
          setLikeStatus(data)
        }
      } catch (error) {
        console.error('Failed to fetch like status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLikeStatus()
  }, [recipeId, shareId])

  const handleToggleLike = async () => {
    if (!authToken) {
      router.push('/login')
      return
    }

    if (toggling) return

    setToggling(true)

    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `auth-token=${authToken}`,
        },
        body: JSON.stringify({
          recipeId: recipeId || undefined,
          shareId: shareId || undefined,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setLikeStatus({ liked: data.liked, likeId: data.like?.id || null })
        setLikeCount(prev => data.liked ? prev + 1 : prev - 1)
      } else {
        console.error('Failed to toggle like:', data.error)
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
    } finally {
      setToggling(false)
    }
  }

  return (
    <Button
      variant={likeStatus.liked ? 'destructive' : 'outline'}
      size="sm"
      onClick={handleToggleLike}
      disabled={loading || toggling}
      className={className}
    >
      {loading || toggling ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : likeStatus.liked ? (
        <Heart className="w-4 h-4" fill="currentColor" />
      ) : (
        <HeartOff className="w-4 h-4" />
      )}
      <span className="ml-1.5">{likeCount}</span>
    </Button>
  )
}
