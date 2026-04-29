import { Redis } from '@upstash/redis'

// Redis 客户端实例
let redisClient: IORedis

// 初始化 Redis 客户端
if (process.env.UPSTASH_REDIS_REST_URL) {
  // 使用 Upstash Redis
  redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  }) as IORedis
  isUpstash = true
} else if (process.env.REDIS_URL) {
  // 使用标准 Redis (Railway, 等）
  redisClient = new Redis(process.env.REDIS_URL) as IORedis
  isUpstash = false
} else {
  throw new Error('Neither UPSTASH_REDIS_REST_URL nor REDIS_URL is configured')
}

// 类型定义
interface UpstashRedis {
  set(key: string, value: string, options?: { ex: number }): Promise<string | null>
  get(key: string): Promise<string | null>
  del(key: string | string[]): Promise<number>
}
