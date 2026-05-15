/**
 * Railway Bucket 图片上传工具
 * 使用 AWS S3 SDK (Railway Bucket 兼容 S3 协议)
 *
 * 公开访问：Railway Bucket 默认无私网直链，统一通过本应用 GET /api/storage/* 代理读对象。
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

// 初始化 S3 客户端 (Tigris / Railway Bucket)
const s3 = new S3Client({
  region: 'auto', // Tigris 推荐使用 'auto'
  endpoint: process.env.RAILWAY_BUCKET_ENDPOINT || 'https://t3.storageapi.dev',
  credentials: {
    accessKeyId: (process.env.RAILWAY_ACCESS_KEY_ID || '').trim(),
    secretAccessKey: (process.env.RAILWAY_SECRET_ACCESS_KEY || '').trim(),
  },
  // Tigris 需要强制使用路径风格
  forcePathStyle: true,
})

/** 允许经 HTTP 代理读取的 Object Key 前缀（与上传脚本一致） */
export function isAllowedPublicBucketKey(key: string): boolean {
  if (!key || key.includes('..') || key.startsWith('/')) return false
  return key.startsWith('recipes/') || key.startsWith('uploads/recipes/')
}

/**
 * 本应用内可浏览器访问的 Bucket 图片路径（同域代理）
 */
export function publicUrlForBucketKey(key: string): string {
  return `/api/storage/${key.split('/').map(encodeURIComponent).join('/')}`
}

export async function readBucketObject(
  key: string
): Promise<{ buffer: Buffer; contentType: string }> {
  const command = new GetObjectCommand({
    Bucket: process.env.RAILWAY_BUCKET_NAME,
    Key: key,
  })
  const response = await s3.send(command)
  if (!response.Body) {
    throw new Error('Empty body')
  }
  const buffer = Buffer.from(await response.Body.transformToByteArray())
  return {
    buffer,
    contentType: response.ContentType || 'application/octet-stream',
  }
}

/**
 * 上传图片到 Railway Bucket
 * @param buffer 图片二进制数据
 * @param key 文件路径，如 'recipes/1234567890-红烧肉.png'
 * @param contentType 内容类型，默认为 'image/png'
 * @returns 同域代理 URL（写入 recipe.imageUrl）
 */
export async function uploadToBucket(
  buffer: Buffer,
  key: string,
  contentType: string = 'image/png'
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.RAILWAY_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })

    await s3.send(command)
    console.log(`  上传到 Bucket 成功: ${key}`)

    const url = publicUrlForBucketKey(key)
    console.log(`  公开 URL（代理）: ${url}`)

    return url
  } catch (error) {
    console.error('上传到 Bucket 失败:', error)
    throw error
  }
}

/**
 * 检查 Bucket 配置是否完整（上传与代理读共用）
 */
export function isBucketConfigured(): boolean {
  return !!(
    process.env.RAILWAY_ACCESS_KEY_ID &&
    process.env.RAILWAY_SECRET_ACCESS_KEY &&
    process.env.RAILWAY_BUCKET_NAME &&
    process.env.RAILWAY_BUCKET_ENDPOINT
  )
}
