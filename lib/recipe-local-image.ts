/**
 * 食谱「本地静态图」URL 约定：/recipes/*（主）与 /uploads/recipes/*（历史）
 */

import path from 'path'

export function isLocalRecipeImageUrl(imageUrl: string | null | undefined): boolean {
  if (!imageUrl) return false
  return imageUrl.startsWith('/recipes/') || imageUrl.startsWith('/uploads/recipes/')
}

export function absolutePublicImagePath(imageUrl: string): string {
  const trimmed = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl
  return path.join(process.cwd(), 'public', ...trimmed.split('/'))
}

/** 与 public 下相对路径一致，用作 S3 Key */
export function bucketKeyFromPublicImageUrl(imageUrl: string): string {
  return imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl
}

export function contentTypeForImageFilename(filename: string): string {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.svg')) return 'image/svg+xml'
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  if (lower.endsWith('.webp')) return 'image/webp'
  return 'application/octet-stream'
}
