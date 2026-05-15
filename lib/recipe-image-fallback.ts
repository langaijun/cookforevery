/**
 * 食谱占位图：SVG 排版后经 sharp 输出 PNG，写入 public/recipes/
 */

import { mkdirSync } from 'fs'
import { join } from 'path'
import sharp from 'sharp'

const publicDir = join(process.cwd(), 'public', 'recipes')

function escapeSvgText(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildPlaceholderSvg(title: string): string {
  const t = escapeSvgText(title.slice(0, 40) || '食谱')
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fef3c7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fde68a;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <text x="400" y="300" text-anchor="middle" font-family="system-ui,Segoe UI,sans-serif" font-size="36" fill="#78350f">${t}</text>
</svg>`
}

export async function generateRecipeImageWithFallback(
  name: string
): Promise<{ imageUrl: string }> {
  mkdirSync(publicDir, { recursive: true })

  const timestamp = Date.now()
  const safeName = name.replace(/[^\w一-龥]/g, '') || 'recipe'
  const fileName = `${timestamp}-${safeName}.png`
  const localPath = join(publicDir, fileName)

  const svg = Buffer.from(buildPlaceholderSvg(name), 'utf8')
  await sharp(svg).resize(800, 600).png({ compressionLevel: 9 }).toFile(localPath)

  const imageUrl = `/recipes/${fileName}`
  console.log(`生成 PNG 占位图: ${imageUrl}`)

  return { imageUrl }
}

/** 兼容旧名称 */
export const generateRecipeImageFallback = async (
  name: string
): Promise<string> => {
  const { imageUrl } = await generateRecipeImageWithFallback(name)
  return imageUrl
}