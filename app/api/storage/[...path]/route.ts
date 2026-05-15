import { NextRequest, NextResponse } from 'next/server'
import { isAllowedPublicBucketKey, readBucketObject, isBucketConfigured } from '@/lib/railway-bucket'

export const runtime = 'nodejs'

/**
 * 匿名读取 Bucket 中食谱图片（Railway Bucket 无私网直链时使用本代理）
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  if (!isBucketConfigured()) {
    return new NextResponse('Storage not configured', { status: 503 })
  }

  const { path: segments } = await context.params
  // 部分运行环境/反向代理下 path 仍带百分号编码，与 S3 上 Unicode Key 不一致会导致 404
  const key = segments
    .map((seg) => {
      try {
        return decodeURIComponent(seg)
      } catch {
        return seg
      }
    })
    .join('/')

  if (!key || !isAllowedPublicBucketKey(key)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const { buffer, contentType } = await readBucketObject(key)
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
