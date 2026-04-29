import { Redis as UpstashRedis } from '@upstash/redis'
import IORedis from 'ioredis'

type RedisBackend = UpstashRedis | IORedis

const hasUpstashConfig =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN

const hasRedisUrl = !!process.env.REDIS_URL

let redis: RedisBackend
let isUpstash = false

if (hasUpstashConfig) {
  redis = new UpstashRedis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  isUpstash = true
} else if (hasRedisUrl) {
  redis = new IORedis(process.env.REDIS_URL!)
  isUpstash = false
} else {
  throw new Error(
    'Redis is not configured. Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN or REDIS_URL.'
  )
}

export { redis, isUpstash }

export const codeCache = {
  async set(email: string, code: string, ttlSeconds: number): Promise<void> {
    const key = `verify:${email}`
    if (isUpstash) {
      await (redis as UpstashRedis).set(key, code, { ex: ttlSeconds })
      return
    }
    await (redis as IORedis).set(key, code, 'EX', ttlSeconds)
  },
  async get(email: string): Promise<string | null> {
    const key = `verify:${email}`
    const value = isUpstash
      ? await (redis as UpstashRedis).get<string>(key)
      : await (redis as IORedis).get(key)
    return value ?? null
  },
  async verifyAndDelete(email: string, code: string): Promise<boolean> {
    const key = `verify:${email}`
    const cached = isUpstash
      ? await (redis as UpstashRedis).get<string>(key)
      : await (redis as IORedis).get(key)
    if (!cached || cached !== code) return false
    await redis.del(key)
    return true
  },
}
