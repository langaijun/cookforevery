/**
 * Railway Bucket 图片上传工具
 * 使用 AWS S3 SDK (Railway Bucket 兼容 S3 协议)
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// 初始化 S3 客户端
const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.RAILWAY_BUCKET_ENDPOINT,
  credentials: {
    accessKeyId: process.env.RAILWAY_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.RAILWAY_SECRET_ACCESS_KEY || '',
  },
})

/**
 * 上传图片到 Railway Bucket
 * @param buffer 图片二进制数据
 * @param key 文件路径，如 'recipes/1234567890-红烧肉.png'
 * @param contentType 内容类型，默认为 'image/png'
 * @returns CDN 公开 URL
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

    // 返回 CDN 公开 URL
    const cdnHost = process.env.PUBLIC_BUCKETS_HOST
    const url = `https://${cdnHost}/${key}`
    console.log(`  CDN URL: ${url}`)

    return url
  } catch (error) {
    console.error('上传到 Bucket 失败:', error)
    throw error
  }
}

/**
 * 检查 Bucket 配置是否完整
 */
export function isBucketConfigured(): boolean {
  return !!(
    process.env.RAILWAY_ACCESS_KEY_ID &&
    process.env.RAILWAY_SECRET_ACCESS_KEY &&
    process.env.RAILWAY_BUCKET_NAME &&
    process.env.RAILWAY_BUCKET_ENDPOINT &&
    process.env.PUBLIC_BUCKETS_HOST
  )
}
