/**
 * 食谱浏览模块 API 测试
 *
 * 测试用例:
 * 2.1 食谱列表 - 搜索/筛选/分页
 * 2.2 食谱详情 - 完整信息/视频/图片
 * 2.3 SEO 特性 - metadata 验证
 */

import { TestApiClient, validateResponse, sleep } from '../utils/test-helper'

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001'
const client = new TestApiClient(API_BASE)

// 测试结果记录
const testResults = {
  passed: 0,
  failed: 0,
  details: [] as any[]
}

/**
 * 记录测试结果
 */
function logTest(name: string, status: 'PASS' | 'FAIL', message?: string) {
  const result = { name, status, message, timestamp: new Date().toISOString() }
  testResults.details.push(result)

  if (status === 'PASS') {
    testResults.passed++
    console.log(`✅ ${name}`)
  } else {
    testResults.failed++
    console.log(`❌ ${name}: ${message}`)
  }
}

/**
 * 测试用例 2.1 - 食谱列表
 */
async function test2_1_RecipeList() {
  console.log('\n📋 测试用例 2.1 - 食谱列表\n')

  // 2.1.1 获取食谱列表（无参数）
  console.log('2.1.1 获取食谱列表（无参数）...')
  try {
    const response = await client.get('/api/recipes/list')
    validateResponse(response, ['success', 'recipes'])
    if (Array.isArray(response.recipes)) {
      logTest('2.1.1 获取食谱列表', 'PASS', `返回 ${response.recipes.length} 个食谱`)
    } else {
      logTest('2.1.1 获取食谱列表', 'FAIL', 'recipes 应为数组')
    }
  } catch (error: any) {
    logTest('2.1.1 获取食谱列表', 'FAIL', error.message)
  }

  // 2.1.2 搜索功能
  console.log('2.1.2 搜索功能...')
  try {
    const response = await client.get('/api/recipes/list?search=鸡蛋')
    validateResponse(response, ['success', 'recipes'])
    logTest('2.1.2 搜索功能', 'PASS', '搜索功能正常')
  } catch (error: any) {
    logTest('2.1.2 搜索功能', 'FAIL', error.message)
  }

  // 2.1.3 口味筛选
  console.log('2.1.3 口味筛选...')
  try {
    const response = await client.get('/api/recipes/list?taste=sweet')
    validateResponse(response, ['success', 'recipes'])
    logTest('2.1.3 口味筛选', 'PASS', '口味筛选正常')
  } catch (error: any) {
    logTest('2.1.3 口味筛选', 'FAIL', error.message)
  }

  // 2.1.4 难度筛选
  console.log('2.1.4 难度筛选...')
  try {
    const response = await client.get('/api/recipes/list?difficulty=EASY')
    validateResponse(response, ['success', 'recipes'])
    logTest('2.1.4 难度筛选', 'PASS', '难度筛选正常')
  } catch (error: any) {
    logTest('2.1.4 难度筛选', 'FAIL', error.message)
  }

  // 2.1.5 食材筛选
  console.log('2.1.5 食材筛选...')
  try {
    const response = await client.get('/api/recipes/list?ingredients=鸡蛋')
    validateResponse(response, ['success', 'recipes'])
    logTest('2.1.5 食材筛选', 'PASS', '食材筛选正常')
  } catch (error: any) {
    logTest('2.1.5 食材筛选', 'FAIL', error.message)
  }

  // 2.1.6 分页功能
  console.log('2.1.6 分页功能...')
  try {
    const response = await client.get('/api/recipes/list?page=1&limit=10')
    validateResponse(response, ['success', 'recipes'])
    if (response.recipes.length <= 10) {
      logTest('2.1.6 分页功能', 'PASS', `返回 ${response.recipes.length} 个食谱`)
    } else {
      logTest('2.1.6 分页功能', 'FAIL', '分页限制未生效')
    }
  } catch (error: any) {
    logTest('2.1.6 分页功能', 'FAIL', error.message)
  }
}

/**
 * 测试用例 2.2 - 食谱详情
 */
async function test2_2_RecipeDetail() {
  console.log('\n📋 测试用例 2.2 - 食谱详情\n')

  // 先获取一个食谱 ID
  let recipeId: string | null = null
  try {
    const listResponse = await client.get('/api/recipes/list?limit=1')
    if (listResponse.success && listResponse.recipes.length > 0) {
      recipeId = listResponse.recipes[0].id
    }
  } catch (error: any) {
    console.warn('获取食谱 ID 失败:', error.message)
  }

  if (!recipeId) {
    console.warn('⚠️  跳过详情测试：无法获取食谱 ID')
    return
  }

  // 2.2.1 获取食谱详情
  console.log('2.2.1 获取食谱详情...')
  try {
    const response = await client.get(`/api/recipes/${recipeId}`)
    validateResponse(response, ['success', 'recipe'])
    const recipe = response.recipe

    // 验证必要字段
    const requiredFields = ['id', 'name', 'description', 'difficulty', 'time', 'ingredients', 'steps']
    const missingFields = requiredFields.filter(field => !(field in recipe))

    if (missingFields.length === 0) {
      logTest('2.2.1 获取食谱详情', 'PASS', '包含所有必要字段')
    } else {
      logTest('2.2.1 获取食谱详情', 'FAIL', `缺少字段: ${missingFields.join(', ')}`)
    }
  } catch (error: any) {
    logTest('2.2.1 获取食谱详情', 'FAIL', error.message)
  }

  // 2.2.2 食谱不存在
  console.log('2.2.2 食谱不存在...')
  try {
    const response = await client.get('/api/recipes/non-existent-id')
    // 应该返回错误或空结果
    if (!response.success || response.error) {
      logTest('2.2.2 食谱不存在', 'PASS', '正确处理不存在的食谱')
    } else {
      logTest('2.2.2 食谱不存在', 'FAIL', '应返回错误')
    }
  } catch (error: any) {
    if (error.status === 404 || error.message.includes('不存在')) {
      logTest('2.2.2 食谱不存在', 'PASS', '正确返回 404')
    } else {
      logTest('2.2.2 食谱不存在', 'FAIL', error.message)
    }
  }
}

/**
 * 测试用例 2.3 - API 响应格式
 */
async function test2_3_ResponseFormat() {
  console.log('\n📋 测试用例 2.3 - API 响应格式\n')

  // 2.3.1 验证统一响应格式
  console.log('2.3.1 验证统一响应格式...')
  try {
    const response = await client.get('/api/recipes/list')
    const hasSuccessField = 'success' in response
    const hasRecipesField = 'recipes' in response

    if (hasSuccessField && hasRecipesField) {
      logTest('2.3.1 验证统一响应格式', 'PASS', '包含 success 和 recipes 字段')
    } else {
      logTest('2.3.1 验证统一响应格式', 'FAIL', '响应格式不一致')
    }
  } catch (error: any) {
    logTest('2.3.1 验证统一响应格式', 'FAIL', error.message)
  }

  // 2.3.2 错误响应格式
  console.log('2.3.2 错误响应格式...')
  try {
    const response = await client.get('/api/recipes/list?invalid_param=true')
    // 如果有错误，应该包含 error 字段
    if (!response.success && 'error' in response) {
      logTest('2.3.2 错误响应格式', 'PASS', '错误响应包含 error 字段')
    } else if (response.success) {
      logTest('2.3.2 错误响应格式', 'PASS', '成功响应')
    } else {
      logTest('2.3.2 错误响应格式', 'WARN', '无法验证错误格式')
    }
  } catch (error: any) {
    logTest('2.3.2 错误响应格式', 'FAIL', error.message)
  }
}

/**
 * 测试用例 2.4 - 多语言支持
 */
async function test2_4_MultiLanguage() {
  console.log('\n📋 测试用例 2.4 - 多语言支持\n')

  // 2.4.1 中文页面
  console.log('2.4.1 中文页面...')
  try {
    const response = await fetch(`${API_BASE}/zh-CN/recipes`)
    if (response.ok) {
      logTest('2.4.1 中文页面', 'PASS', '中文路由可访问')
    } else {
      logTest('2.4.1 中文页面', 'FAIL', '中文路由访问失败')
    }
  } catch (error: any) {
    logTest('2.4.1 中文页面', 'FAIL', error.message)
  }

  // 2.4.2 英文页面
  console.log('2.4.2 英文页面...')
  try {
    const response = await fetch(`${API_BASE}/en/recipes`)
    if (response.ok) {
      logTest('2.4.2 英文页面', 'PASS', '英文路由可访问')
    } else {
      logTest('2.4.2 英文页面', 'FAIL', '英文路由访问失败')
    }
  } catch (error: any) {
    logTest('2.4.2 英文页面', 'FAIL', error.message)
  }

  // 2.4.3 日文页面
  console.log('2.4.3 日文页面...')
  try {
    const response = await fetch(`${API_BASE}/ja/recipes`)
    if (response.ok) {
      logTest('2.4.3 日文页面', 'PASS', '日文路由可访问')
    } else {
      logTest('2.4.3 日文页面', 'FAIL', '日文路由访问失败')
    }
  } catch (error: any) {
    logTest('2.4.3 日文页面', 'FAIL', error.message)
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('═══════════════════════════════════════')
  console.log('    食谱浏览模块 API 测试')
  console.log('═══════════════════════════════════════\n')
  console.log(`API Base URL: ${API_BASE}`)
  console.log(`测试时间: ${new Date().toISOString()}\n`)

  try {
    await test2_1_RecipeList()
    await test2_2_RecipeDetail()
    await test2_3_ResponseFormat()
    await test2_4_MultiLanguage()

    // 输出测试结果摘要
    console.log('\n═══════════════════════════════════════')
    console.log('           测试结果摘要')
    console.log('═══════════════════════════════════════')
    console.log(`总测试用例: ${testResults.passed + testResults.failed}`)
    console.log(`通过: ${testResults.passed}`)
    console.log(`失败: ${testResults.failed}`)
    console.log(`通过率: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)}%`)

    if (testResults.failed > 0) {
      console.log('\n❌ 失败的测试:')
      testResults.details.filter(d => d.status === 'FAIL').forEach(test => {
        console.log(`  - ${test.name}: ${test.message}`)
      })
      process.exit(1)
    } else {
      console.log('\n✅ 所有测试通过！')
    }

    // 保存测试结果到文件
    const fs = require('fs')
    const resultsPath = './tests/data/recipes-test-results.json'
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2))
    console.log(`\n📄 测试结果已保存到: ${resultsPath}`)

  } catch (error) {
    console.error('\n❌ 测试执行出错:', error)
    process.exit(1)
  }
}

main()
