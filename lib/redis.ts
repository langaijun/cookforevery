import { Redis } from '@upstash/redis'
import IORedis from 'ioredis'

// Redis 客户端实例
let redisClient: IORedis
let isUpstash = false

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
  redisClient = new IORedis(process.env.REDIS_URL) as IORedis
  isUpstash = false
} else {
  throw new Error('Neither UPSTASH_REDIS_REST_URL nor REDIS_URL is configured')
}

// 类型定义
interface IORedis {
  set(key: string, value: string, options?: { ex: number }): Promise<string | null>
  get(key: string): Promise<string | null>
  del(key: string | string[]): Promise<number>
}

/**
 * 验证码存储操作
 */
export const codeCache = {
  /**
   * 存储验证码
   * @param email 邮箱地址
   * @param code 验证码
   * @param ttl 过期时间（秒），默认 600（10分钟）
   */
  async set(email: string, code: string, ttl: number = 600) {
    const key = `code:${email}`
    if (isUpstash) {
      await (redisClient as IORedis).set(key, code, { ex: ttl })
    } else {
      await (redisClient as IORedis).set(key, code, 'EX', ttl)
    }
  },

  /**
   * 获取验证码
   * @param email 邮箱地址
   */
  async get(email: string) {
    const key = `code:${email}`
    if (isUpstash) {
      return await (redisClient as IORedis).get(key)
    } else {
      return await (redisClient as IORedis).get(key)
    }
  },

  /**
   * 验证并删除验证码
   * @param email 邮箱地址
   * @param code 验证码
   * @returns 是否验证成功
   */
  async verifyAndDelete(email: string, code: string): Promise<boolean> {
    const storedCode = await this.get(email)
    if (storedCode === code) {
      const key = `code:${email}`
      await (redisClient as IORedis).del(key)
      return true
    }
    return false
  },

  /**
   * 删除验证码
   * @param email 邮箱地址
   */
  async delete(email: string) {
    const key = `code:${email}`
    await (redisClient as IORedis).del(key)
  },
}
