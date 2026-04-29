import { Redis } from '@upstash/redis'

// Redis 客户端实例
let redisClient: Redis

// 初始化 Redis 客户端
if (process.env.UPSTASH_REDIS_REST_URL) {
  // 使用 Upstash Redis
  redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  isUpstash = true
} else if (process.env.REDIS_URL) {
  // 使用标准 Redis (Railway, 等）
  redisClient = new Redis(process.env.REDIS_URL)
  isUpstash = false
}
