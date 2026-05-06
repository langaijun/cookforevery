import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

/**
 * 判断是否为 Token Plan 团队版 API Key
 * 格式：sk-sp-xxx
 */
export function isTokenPlanKey(key?: string): boolean {
  return key?.startsWith('sk-sp-') ?? false
}

/**
 * 从 .env 文本中解析单行 KEY（支持无引号、双引号、单引号）。
 */
function parseEnvLineValue(content: string, key: string): string | undefined {
  for (const line of content.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const prefix = `${key}=`
    if (!t.startsWith(prefix)) continue
    let v = t.slice(prefix.length).trim()
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1)
    }
    return v.replace(/^"|"$/g, '')
  }
  return undefined
}

/**
 * 本地开发时若根目录 `.env` 中配置了 `DASHSCOPE_API_KEY`，则固定采用该值，
 * 避免 `.env.local` 中同名变量（常为过期/测试 key）覆盖有效配置。
 * 生产环境无 `.env` 文件时不修改 process.env，沿用平台注入的变量。
 */
export function applyDashscopeApiKeyPreferDotenv(cwd: string = process.cwd()): void {
  const dotEnvPath = join(cwd, '.env')
  if (!existsSync(dotEnvPath)) return
  try {
    const val = parseEnvLineValue(readFileSync(dotEnvPath, 'utf8'), 'DASHSCOPE_API_KEY')
    if (val) {
      process.env.DASHSCOPE_API_KEY = val
      const keyType = val.startsWith('sk-sp-') ? 'Token Plan' : 'Standard'
      console.log(`[Dashscope] API Key loaded (${keyType})`)
    }
  } catch {
    // 忽略读文件错误，避免阻断构建
  }
}
