import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  // 读取 .env 文件
  let envFileContent = ''
  try {
    const envPath = join(process.cwd(), '.env')
    envFileContent = readFileSync(envPath, 'utf-8')
  } catch (e) {
    envFileContent = `Error: ${e}`
  }

  // 查找 DASHSCOPE_API_KEY
  const match = envFileContent.match(/DASHSCOPE_API_KEY="([^"]+)"/)
  const fileKey = match ? match[1].substring(0, 30) + '...' : 'Not found in file'

  return NextResponse.json({
    processEnvKey: process.env.DASHSCOPE_API_KEY?.substring(0, 30) + '...' || 'Not set',
    fileKey,
    envFileExists: envFileContent.includes('DASHSCOPE_API_KEY'),
  })
}
