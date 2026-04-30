'use client'

import { useMemo } from 'react'

interface VideoPlayerProps {
  url: string
  title?: string
  className?: string
}

/**
 * 解析视频 URL 并返回嵌入代码
 */
function parseVideoUrl(url: string): { type: 'youtube' | 'bilibili' | 'generic' | null; embedUrl: string } | null {
  if (!url) return null

  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (youtubeMatch) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}` }
  }

  // Bilibili
  const bilibiliMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/)
  if (bilibiliMatch) {
    return { type: 'bilibili', embedUrl: `https://player.bilibili.com/player.html?bvid=${bilibiliMatch[1]}` }
  }

  // Generic - try to use the URL directly (might work for direct video files)
  return { type: 'generic', embedUrl: url }
}

export function VideoPlayer({ url, title, className }: VideoPlayerProps) {
  const videoInfo = useMemo(() => parseVideoUrl(url), [url])

  if (!videoInfo) {
    return (
      <div className={`bg-muted rounded-lg p-8 text-center ${className || ''}`}>
        <p className="text-muted-foreground">
          {title || 'No video available'}
        </p>
      </div>
    )
  }

  return (
    <div className={`rounded-lg overflow-hidden bg-black ${className || ''}`}>
      {videoInfo.type === 'youtube' ? (
        <iframe
          width="100%"
          height="100%"
          src={videoInfo.embedUrl}
          title={title || 'Video'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="aspect-video"
        />
      ) : videoInfo.type === 'bilibili' ? (
        <iframe
          src={videoInfo.embedUrl}
          title={title || 'Video'}
          scrolling="no"
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="w-full aspect-video"
          sandbox="allow-top-navigation allow-same-origin allow-forms allow-scripts"
        />
      ) : (
        <video
          src={videoInfo.embedUrl}
          controls
          title={title || 'Video'}
          className="w-full aspect-video"
        >
          <track kind="captions" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  )
}
