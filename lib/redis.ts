import { Redis as UpstashRedis } from '@upstash/redis'
import IORedis from 'ioredis'

type RedisBackend = UpstashRedis | IORedis

const hasUpstashConfig =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN

const hasRedisUrl = !!process.env.REDIS_URL

let backend: RedisBackend | null = null
let isUpstash = false

function createBackend(): RedisBackend {
  if (hasUpstashConfig) {
    isUpstash = true
    return new UpstashRedis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }
  if (hasRedisUrl) {
    const client = new IORedis(process.env.REDIS_URL!, {
      lazyConnect: true,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
    })
    // 避免 DNS / 连接失败时 Node 报 “Unhandled 'error' event”（本地 Railway 内网 URL 等）
    client.on('error', () => {})
    isUpstash = false
    return client
  }
  throw new Error(
    'Redis is not configured. Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN or REDIS_URL.'
  )
}

/** 仅在首次读写时创建客户端；纯 import 不会在 `next build` 阶段连 Redis */
function getRedisClient(): RedisBackend {
  if (!backend) {
    backend = createBackend()
  }
  return backend
}

export const codeCache = {
  async set(email: string, code: string, ttlSeconds: number): Promise<void> {
    const r = getRedisClient()
    const key = `verify:${email}`
    if (isUpstash) {
      await (r as UpstashRedis).set(key, code, { ex: ttlSeconds })
      return
    }
    await (r as IORedis).set(key, code, 'EX', ttlSeconds)
  },
  async get(email: string): Promise<string | null> {
    const r = getRedisClient()
    const key = `verify:${email}`
    const value = isUpstash
      ? await (r as UpstashRedis).get<string>(key)
      : await (r as IORedis).get(key)
    return value ?? null
  },
  async verifyAndDelete(email: string, code: string): Promise<boolean> {
    const r = getRedisClient()
    const key = `verify:${email}`
    const cached = isUpstash
      ? await (r as UpstashRedis).get<string>(key)
      : await (r as IORedis).get(key)
    if (!cached || cached !== code) return false
    if (isUpstash) {
      await (r as UpstashRedis).del(key)
    } else {
      await (r as IORedis).del(key)
    }
    return true
  },
}
