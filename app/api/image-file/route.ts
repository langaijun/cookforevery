import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET(request: NextRequest) {
  const filename = request.nextUrl.searchParams.get('filename')
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return new NextResponse('Bad request', { status: 400 })
  }

  const filePath = join(process.cwd(), 'public', 'recipes', filename)

  try {
    const file = readFileSync(filePath)
    const ext = filename.split('.').pop()

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
