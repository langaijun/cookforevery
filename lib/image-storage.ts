/**
 * 图片下载和存储工具
 * 用于将生成的图片下载并存储到本地 public 目录
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'recipes')

/**
 * 确保上传目录存在
 */
function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

/**
 * 从 URL 下载图片并保存到本地
 */
export async function downloadAndStoreImage(
  tempUrl: string,
  recipeId: string
): Promise<string | null> {
  try {
    ensureUploadDir()

    const response = await fetch(tempUrl)
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    // 生成文件名：recipeId-timestamp.png
    const timestamp = Date.now()
    const filename = `${recipeId}-${timestamp}.png`
    const filepath = path.join(UPLOAD_DIR, filename)

    fs.writeFileSync(filepath, buffer)

    // 返回可访问的 URL
    return `/uploads/recipes/${filename}`
  } catch (error) {
    console.error('下载图片失败:', error)
    return null
  }
}

/**
 * 删除图片文件
 */
export function deleteImage(imageUrl: string): boolean {
  try {
    // 从 URL 提取文件名
    const filename = imageUrl.split('/').pop()
    if (!filename) return false

    const filepath = path.join(UPLOAD_DIR, filename)
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath)
      return true
    }
    return false
  } catch (error) {
    console.error('删除图片失败:', error)
    return false
  }
}
