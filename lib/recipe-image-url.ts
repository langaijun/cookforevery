/**
 * 食谱图片对外 URL：纠正误指向 Next 服务域名的 Bucket 路径，改为走 /api/storage 代理。
 */

export function normalizeRecipeImageUrl(url: string | null | undefined): string | null | undefined {
  if (url == null || url === '') return url
  if (!url.startsWith('http://') && !url.startsWith('https://')) return url
  try {
    const u = new URL(url)
    if (u.hostname.endsWith('.up.railway.app')) {
      const p = u.pathname
      if (p.startsWith('/recipes/') || p.startsWith('/uploads/recipes/')) {
        const key = p.startsWith('/') ? p.slice(1) : p
        return `/api/storage/${key}`
      }
    }
  } catch {
    /* ignore invalid URL */
  }
  return url
}
