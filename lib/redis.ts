import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export const codeCache = {
  async set(email: string, code: string, ttlSeconds: number): Promise<void> {
    await redis.set(`verify:${email}`, code, { ex: ttlSeconds })
  },
  async get(email: string): Promise<string | null> {
    const value = await redis.get<string>(`verify:${email}`)
    return value ?? null
  },
  async verifyAndDelete(email: string, code: string): Promise<boolean> {
    const key = `verify:${email}`
    const cached = await redis.get<string>(key)
    if (!cached || cached !== code) return false
    await redis.del(key)
    return true
  },
}
