'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { MessageCircle, Link as LinkIcon } from 'lucide-react'
import { LikeButton } from '@/components/recipe/LikeButton'
import Link from 'next/link'

interface ShareCardProps {
  id: string
  imageUrl: string
  caption: string
  createdAt: Date
  user: {
    id: string
    name: string
    avatar: string | null
  }
  recipe?: {
    id: string
    name: string
  } | null
  _count: {
    comments: number
    likes: number
  }
}

export function ShareCard({ id, imageUrl, caption, createdAt, user, recipe, _count }: ShareCardProps) {
  const t = useTranslations()

  const getRelativeTime = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)

    if (diffInSeconds < 60) return t('Common.justNow') || 'Just now'
    if (diffInSeconds < 3600) return t('Common.minutesAgo', { time: Math.floor(diffInSeconds / 60) }) || `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return t('Common.hoursAgo', { time: Math.floor(diffInSeconds / 3600) }) || `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 604800) return t('Common.daysAgo', { time: Math.floor(diffInSeconds / 86400) }) || `${Math.floor(diffInSeconds / 86400)}d`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      {/* Image */}
      <div className="aspect-square bg-muted relative">
        <img
          src={imageUrl}
          alt={caption || 'Share'}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* User info */}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || undefined} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {t('ShareCard.sharedBy', { name: user.name }) || user.name}
            </p>
            <p className="text-xs text-muted-foreground">{getRelativeTime(createdAt)}</p>
          </div>
        </div>

        {/* Caption */}
        {caption && (
          <p className="text-sm line-clamp-2">{caption}</p>
        )}

        {/* Linked recipe */}
        {recipe && (
          <Link
            href={`/recipes/${recipe.id}`}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <LinkIcon className="w-3 h-3" />
            <span className="line-clamp-1">
              {t('ShareCard.linkedRecipe', { name: recipe.name }) || recipe.name}
            </span>
          </Link>
        )}

        {/* Engagement */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{_count.comments}</span>
            </div>
          </div>
          <LikeButton shareId={id} initialLikeCount={_count.likes} />
        </div>
      </div>
    </div>
  )
}
