/**
 * 测试辅助工具
 */

// 测试数据集
export const testData = {
  users: [
    { email: 'test@example.com', name: '测试用户', isAdmin: false },
    { email: 'admin@example.com', name: '管理员', isAdmin: true }
  ],
  recipes: Array.from({ length: 10 }, (_, i) => ({
    id: `recipe-${i}`,
    name: `测试食谱${i}`,
    description: `这是测试食谱${i}的描述`,
    difficulty: ['EASY', 'MEDIUM', 'HARD'][i % 3],
    time: 30 + i * 5,
    tasteTags: ['sweet', 'salty'][i % 2],
    ingredients: ['食材1', '食材2'],
    steps: ['步骤1', '步骤2']
  })),
  comments: Array.from({ length: 5 }, (_, i) => ({
    content: `测试评论${i}`,
    userId: 'user123'
  }))
}

// API 测试基类
export class TestApiClient {
  private baseUrl: string

  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl
  }

  async get(endpoint: string, token?: string) {
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: { ...headers, 'Content-Type': 'application/json' }
    })
    return response.json()
  }

  async post(endpoint: string, data: any, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })
    return response.json()
  }

  async delete(endpoint: string, token?: string) {
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: { ...headers, 'Content-Type': 'application/json' }
    })
    return response.json()
  }
}

// 验证响应格式
export function validateResponse(response: any, expectedKeys: string[]) {
  if (!response.success) {
    throw new Error(`API 失败: ${response.error || '未知错误'}`)
  }

  for (const key of expectedKeys) {
    if (!(key in response)) {
      throw new Error(`缺少期望的字段: ${key}`)
    }
  }

  return true
}

// 等待函数
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 生成随机测试数据
export function generateTestData(type: 'user' | 'recipe' | 'comment') {
  switch (type) {
    case 'user':
      return {
        email: `test-${Date.now()}@example.com`,
        name: `测试用户${Date.now()}`,
        provider: 'EMAIL' as const
      }
    case 'recipe':
      return {
        name: `测试食谱${Date.now()}`,
        description: `测试描述${Date.now()}`,
        difficulty: 'EASY' as const,
        time: 30,
        ingredients: ['测试食材'],
        steps: ['测试步骤']
      }
    case 'comment':
      return {
        content: `测试评论${Date.now()}`,
        recipeId: 'test-recipe-id'
      }
    default:
      throw new Error('未知的测试数据类型')
  }
}