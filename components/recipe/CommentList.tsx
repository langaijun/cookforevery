'use client'

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { Trash2 } from 'lucide-react'
import { CommentForm } from './CommentForm'
import { useRouter } from '@/i18n'

interface Comment {
  id: string
  content: string
  createdAt: Date
  userId: string
  user: {
    id: string
    name: string
    avatar: string | null
  }
}

interface CommentListProps {
  recipeId?: string
  shareId?: string
  currentUserId?: string | null
}

export function CommentList({ recipeId, shareId, currentUserId }: CommentListProps) {
  const t = useTranslations()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Comment[]>([])
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const authToken = typeof document !== 'undefined'
    ? document.cookie.split('; ').find(c => c.trim().startsWith('auth-token='))?.split('=')[1]
    : null

  useEffect(() => {
    if (!recipeId && !shareId) return

    const fetchComments = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (recipeId) params.append('recipeId', recipeId)
        if (shareId) params.append('shareId', shareId)

        const res = await fetch(`/api/comments?${params.toString()}`, {
          cache: 'no-store',
        })

        if (res.ok) {
          const data = await res.json()
          setComments(data.comments || [])
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [recipeId, shareId])

  const handleDeleteComment = async (commentId: string) => {
    if (!authToken) {
      router.push('/login')
      return
    }

    if (!confirm(t('CommentList.confirmDelete') || 'Are you sure you want to delete this comment?')) {
      return
    }

    setDeletingId(commentId)

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Cookie': `auth-token=${authToken}`,
        },
      })

      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId))
      } else {
        const data = await res.json()
        console.error('Failed to delete comment:', data.error)
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleCommentSuccess = () => {
    // Refresh comments
    const fetchComments = async () => {
      try {
        const params = new URLSearchParams()
        if (recipeId) params.append('recipeId', recipeId)
        if (shareId) params.append('shareId', shareId)

        const res = await fetch(`/api/comments?${params.toString()}`, {
          cache: 'no-store',
        })

        if (res.ok) {
          const data = await res.json()
          setComments(data.comments || [])
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error)
      }
    }

    fetchComments()
    setShowForm(false)
  }

  const getRelativeTime = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)

    if (diffInSeconds < 60) return t('CommentList.justNow') || 'Just now'
    if (diffInSeconds < 3600) return t('CommentList.minutesAgo', { time: Math.floor(diffInSeconds / 60) }) || `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return t('CommentList.hoursAgo', { time: Math.floor(diffInSeconds / 3600) }) || `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return t('CommentList.daysAgo', { time: Math.floor(diffInSeconds / 86400) }) || `${Math.floor(diffInSeconds / 86400)} days ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {t('CommentList.title') || 'Comments'} ({comments.length})
        </h2>
        {!showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            {t('CommentForm.submit') || 'Add comment'}
          </Button>
        )}
      </div>

      {showForm && (
        <div className="border rounded-lg p-4">
          <CommentForm
            recipeId={recipeId}
            shareId={shareId}
            onSuccess={handleCommentSuccess}
            onCancel={() => setShowForm(false)}
            autoFocus
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-16 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {t('CommentList.empty') || 'No comments yet. Be the first!'}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={comment.user.avatar || undefined} alt={comment.user.name} />
                <AvatarFallback>{comment.user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{comment.user.name}</span>
                  <span className="text-xs text-muted-foreground">{getRelativeTime(comment.createdAt)}</span>
                  {comment.userId === currentUserId && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={deletingId === comment.id}
                      className="ml-auto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <p className="text-sm leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
