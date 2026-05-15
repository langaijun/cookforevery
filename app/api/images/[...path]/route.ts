import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await context.params
  const relative = segments.join('/')
  if (!relative || relative.includes('..')) {
    return new NextResponse('Bad request', { status: 400 })
  }

  const filePath = join(process.cwd(), 'public', relative)

  try {
    const file = readFileSync(filePath)
    const ext = relative.split('.').pop()

    return new NextResponse(file, {
      headers: {
        'Content-Type': ext === 'svg' ? 'image/svg+xml' : 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return new NextResponse('File not found', { status: 404 })
  }
}
