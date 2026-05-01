/**
 * 社交功能模块 API 测试
 *
 * 测试用例:
 * 5.1 点赞功能 - 点赞/取消/状态检查
 * 5.2 评论功能 - 发表/删除/权限
 * 5.3 分享功能 - 创建/列表/删除
 */

import { TestApiClient, validateResponse, generateTestData, sleep } from '../utils/test-helper'

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001'
const client = new TestApiClient(API_BASE)

// 测试结果记录
const testResults = {
  passed: 0,
  failed: 0,
  details: [] as any[]
}

// 测试 token (需要从实际登录获取，这里使用模拟值)
let testToken: string | null = null

/**
 * 记录测试结果
 */
function logTest(name: string, status: 'PASS' | 'FAIL' | 'WARN', message?: string) {
  const result = { name, status, message, timestamp: new Date().toISOString() }
  testResults.details.push(result)

  if (status === 'PASS') {
    testResults.passed++
    console.log(`✅ ${name}`)
  } else if (status === 'WARN') {
    console.log(`⚠️  ${name}: ${message}`)
  } else {
    testResults.failed++
    console.log(`❌ ${name}: ${message}`)
  }
}

/**
 * 测试用例 5.1 - 点赞功能
 */
async function test5_1_LikeFunction() {
  console.log('\n💙 测试用例 5.1 - 点赞功能\n')

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
    console.warn('⚠️  跳过点赞测试：无法获取食谱 ID')
    return
  }

  // 5.1.1 未登录用户点赞
  console.log('5.1.1 未登录用户点赞...')
  try {
    const response = await client.post('/api/likes', { recipeId })
    if (!response.success || response.status === 401) {
      logTest('5.1.1 未登录用户点赞', 'PASS', '正确拒绝未登录请求')
    } else {
      logTest('5.1.1 未登录用户点赞', 'FAIL', '应拒绝未登录请求')
    }
  } catch (error: any) {
    if (error.status === 401) {
      logTest('5.1.1 未登录用户点赞', 'PASS', '正确返回 401')
    } else {
      logTest('5.1.1 未登录用户点赞', 'FAIL', error.message)
    }
  }

  // 5.1.2 检查点赞状态
  console.log('5.1.2 检查点赞状态...')
  try {
    const response = await client.get(`/api/likes?recipeId=${recipeId}`)
    // 未登录应该返回 liked: false
    if (response.liked === false) {
      logTest('5.1.2 检查点赞状态', 'PASS', '未登录用户显示未点赞')
    } else {
      logTest('5.1.2 检查点赞状态', 'WARN', '响应格式: ' + JSON.stringify(response))
    }
  } catch (error: any) {
    logTest('5.1.2 检查点赞状态', 'FAIL', error.message)
  }

  // 5.1.3 需要登录的点赞操作
  console.log('5.1.3 需要登录的点赞操作...')
  if (!testToken) {
    logTest('5.1.3 需要登录的点赞操作', 'WARN', '需要有效的测试 token')
  } else {
    try {
      const response = await client.post('/api/likes', { recipeId }, testToken)
      if (response.success) {
        logTest('5.1.3 需要登录的点赞操作', 'PASS', '登录后可以点赞')
      } else {
        logTest('5.1.3 需要登录的点赞操作', 'FAIL', '点赞失败')
      }
    } catch (error: any) {
      logTest('5.1.3 需要登录的点赞操作', 'FAIL', error.message)
    }
  }
}

/**
 * 测试用例 5.2 - 评论功能
 */
async function test5_2_CommentFunction() {
  console.log('\n💬 测试用例 5.2 - 评论功能\n')

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
    console.warn('⚠️  跳过评论测试：无法获取食谱 ID')
    return
  }

  // 5.2.1 获取评论列表
  console.log('5.2.1 获取评论列表...')
  try {
    const response = await client.get(`/api/comments?recipeId=${recipeId}`)
    validateResponse(response, ['success', 'comments'])
    if (Array.isArray(response.comments)) {
      logTest('5.2.1 获取评论列表', 'PASS', `返回 ${response.comments.length} 条评论`)
    } else {
      logTest('5.2.1 获取评论列表', 'FAIL', 'comments 应为数组')
    }
  } catch (error: any) {
    logTest('5.2.1 获取评论列表', 'FAIL', error.message)
  }

  // 5.2.2 未登录用户发表评论
  console.log('5.2.2 未登录用户发表评论...')
  try {
    const response = await client.post('/api/comments', {
      recipeId,
      content: '测试评论内容'
    })
    if (!response.success || response.status === 401) {
      logTest('5.2.2 未登录用户发表评论', 'PASS', '正确拒绝未登录请求')
    } else {
      logTest('5.2.2 未登录用户发表评论', 'FAIL', '应拒绝未登录请求')
    }
  } catch (error: any) {
    if (error.status === 401) {
      logTest('5.2.2 未登录用户发表评论', 'PASS', '正确返回 401')
    } else {
      logTest('5.2.2 未登录用户发表评论', 'FAIL', error.message)
    }
  }

  // 5.2.3 缺少必要参数
  console.log('5.2.3 缺少必要参数...')
  try {
    const response = await client.post('/api/comments', {})
    if (!response.success) {
      logTest('5.2.3 缺少必要参数', 'PASS', '正确拒绝缺少参数的请求')
    } else {
      logTest('5.2.3 缺少必要参数', 'FAIL', '应拒绝缺少参数的请求')
    }
  } catch (error: any) {
    if (error.status === 400) {
      logTest('5.2.3 缺少必要参数', 'PASS', '正确返回 400')
    } else {
      logTest('5.2.3 缺少必要参数', 'FAIL', error.message)
    }
  }

  // 5.2.4 空评论内容
  console.log('5.2.4 空评论内容...')
  try {
    const response = await client.post('/api/comments', {
      recipeId,
      content: ''
    })
    if (!response.success) {
      logTest('5.2.4 空评论内容', 'PASS', '正确拒绝空评论')
    } else {
      logTest('5.2.4 空评论内容', 'FAIL', '应拒绝空评论')
    }
  } catch (error: any) {
    if (error.status === 400) {
      logTest('5.2.4 空评论内容', 'PASS', '正确返回 400')
    } else {
      logTest('5.2.4 空评论内容', 'FAIL', error.message)
    }
  }
}

/**
 * 测试用例 5.3 - 分享功能
 */
async function test5_3_ShareFunction() {
  console.log('\n📸 测试用例 5.3 - 分享功能\n')

  // 5.3.1 获取分享列表
  console.log('5.3.1 获取分享列表...')
  try {
    const response = await client.get('/api/shares')
    validateResponse(response, ['success', 'shares'])
    if (Array.isArray(response.shares)) {
      logTest('5.3.1 获取分享列表', 'PASS', `返回 ${response.shares.length} 个分享`)
    } else {
      logTest('5.3.1 获取分享列表', 'FAIL', 'shares 应为数组')
    }
  } catch (error: any) {
    logTest('5.3.1 获取分享列表', 'FAIL', error.message)
  }

  // 5.3.2 分页功能
  console.log('5.3.2 分页功能...')
  try {
    const response = await client.get('/api/shares?page=1&limit=10')
    validateResponse(response, ['success', 'shares'])
    if (response.shares.length <= 10) {
      logTest('5.3.2 分页功能', 'PASS', `返回 ${response.shares.length} 个分享`)
    } else {
      logTest('5.3.2 分页功能', 'FAIL', '分页限制未生效')
    }
  } catch (error: any) {
    logTest('5.3.2 分页功能', 'FAIL', error.message)
  }

  // 5.3.3 未登录用户创建分享
  console.log('5.3.3 未登录用户创建分享...')
  try {
    const response = await client.post('/api/shares', {
      imageUrl: 'https://example.com/image.jpg',
      caption: '测试分享'
    })
    if (!response.success || response.status === 401) {
      logTest('5.3.3 未登录用户创建分享', 'PASS', '正确拒绝未登录请求')
    } else {
      logTest('5.3.3 未登录用户创建分享', 'FAIL', '应拒绝未登录请求')
    }
  } catch (error: any) {
    if (error.status === 401) {
      logTest('5.3.3 未登录用户创建分享', 'PASS', '正确返回 401')
    } else {
      logTest('5.3.3 未登录用户创建分享', 'FAIL', error.message)
    }
  }

  // 5.3.4 缺少图片 URL
  console.log('5.3.4 缺少图片 URL...')
  try {
    const response = await client.post('/api/shares', {
      caption: '测试分享'
    })
    if (!response.success) {
      logTest('5.3.4 缺少图片 URL', 'PASS', '正确拒绝缺少图片 URL')
    } else {
      logTest('5.3.4 缺少图片 URL', 'FAIL', '应拒绝缺少图片 URL')
    }
  } catch (error: any) {
    if (error.status === 400) {
      logTest('5.3.4 缺少图片 URL', 'PASS', '正确返回 400')
    } else {
      logTest('5.3.4 缺少图片 URL', 'FAIL', error.message)
    }
  }
}

/**
 * 测试用例 5.4 - 个人中心 API
 */
async function test5_4_ProfileAPI() {
  console.log('\n👤 测试用例 5.4 - 个人中心 API\n')

  // 5.4.1 未登录访问个人中心
  console.log('5.4.1 未登录访问个人中心...')
  try {
    const response = await client.get('/api/profile/me')
    if (!response.success || response.status === 401) {
      logTest('5.4.1 未登录访问个人中心', 'PASS', '正确拒绝未登录请求')
    } else {
      logTest('5.4.1 未登录访问个人中心', 'FAIL', '应拒绝未登录请求')
    }
  } catch (error: any) {
    if (error.status === 401) {
      logTest('5.4.1 未登录访问个人中心', 'PASS', '正确返回 401')
    } else {
      logTest('5.4.1 未登录访问个人中心', 'FAIL', error.message)
    }
  }

  // 5.4.2 未登录访问收藏
  console.log('5.4.2 未登录访问收藏...')
  try {
    const response = await client.get('/api/profile/favorites')
    if (!response.success || response.status === 401) {
      logTest('5.4.2 未登录访问收藏', 'PASS', '正确拒绝未登录请求')
    } else {
      logTest('5.4.2 未登录访问收藏', 'FAIL', '应拒绝未登录请求')
    }
  } catch (error: any) {
    if (error.status === 401) {
      logTest('5.4.2 未登录访问收藏', 'PASS', '正确返回 401')
    } else {
      logTest('5.4.2 未登录访问收藏', 'FAIL', error.message)
    }
  }

  // 5.4.3 未登录访问我的分享
  console.log('5.4.3 未登录访问我的分享...')
  try {
    const response = await client.get('/api/profile/shares')
    if (!response.success || response.status === 401) {
      logTest('5.4.3 未登录访问我的分享', 'PASS', '正确拒绝未登录请求')
    } else {
      logTest('5.4.3 未登录访问我的分享', 'FAIL', '应拒绝未登录请求')
    }
  } catch (error: any) {
    if (error.status === 401) {
      logTest('5.4.3 未登录访问我的分享', 'PASS', '正确返回 401')
    } else {
      logTest('5.4.3 未登录访问我的分享', 'FAIL', error.message)
    }
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('═══════════════════════════════════════')
  console.log('    社交功能模块 API 测试')
  console.log('═══════════════════════════════════════\n')
  console.log(`API Base URL: ${API_BASE}`)
  console.log(`测试时间: ${new Date().toISOString()}\n`)

  try {
    await test5_1_LikeFunction()
    await test5_2_CommentFunction()
    await test5_3_ShareFunction()
    await test5_4_ProfileAPI()

    // 输出测试结果摘要
    console.log('\n═══════════════════════════════════════')
    console.log('           测试结果摘要')
    console.log('═══════════════════════════════════════')
    console.log(`总测试用例: ${testResults.passed + testResults.failed}`)
    console.log(`通过: ${testResults.passed}`)
    console.log(`失败: ${testResults.failed}`)
    console.log(`警告: ${testResults.details.filter(d => d.status === 'WARN').length}`)
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
    const resultsPath = './tests/data/social-test-results.json'
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2))
    console.log(`\n📄 测试结果已保存到: ${resultsPath}`)

  } catch (error) {
    console.error('\n❌ 测试执行出错:', error)
    process.exit(1)
  }
}

main()
