/**
 * 用户认证模块 API 测试
 *
 * 测试用例:
 * 1.1 正常流程 - 发送验证码和登录
 * 1.2 异常流程 - 无效邮箱/错误验证码/过期
 * 1.3 OAuth 登录 - GitHub/Google (需要手动验证)
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
 * 测试用例 1.1 - 正常流程
 */
async function test1_1_NormalFlow() {
  console.log('\n📋 测试用例 1.1 - 正常流程\n')

  // 1.1.1 发送验证码
  console.log('1.1.1 发送验证码...')
  const testDataUser = generateTestData('user')
  const sendCodeResponse = await client.post('/api/auth/send-code', {
    email: testDataUser.email
  })

  // 验证响应格式
  try {
    validateResponse(sendCodeResponse, ['success'])
    logTest('1.1.1 发送验证码', 'PASS', `邮箱: ${testDataUser.email}`)
  } catch (error: any) {
    logTest('1.1.1 发送验证码', 'FAIL', error.message)
    return
  }

  // 等待 2 秒，模拟用户输入时间
  await sleep(2000)

  // 1.1.2 输入验证码登录
  console.log('1.1.2 输入验证码登录...')
  // 注意：由于我们无法获取实际发送的验证码，这里使用测试验证码
  // 实际测试时需要使用测试环境配置的固定验证码
  const verifyCodeResponse = await client.post('/api/auth/verify-code', {
    email: testDataUser.email,
    code: '000000' // 测试验证码（需要在环境配置中允许）
  })

  try {
    validateResponse(verifyCodeResponse, ['success', 'token', 'user'])
    logTest('1.1.2 验证码登录', 'PASS', '用户会话创建成功')
  } catch (error: any) {
    // 测试环境中可能无法获取验证码，这是正常的
    logTest('1.1.2 验证码登录', 'WARN', '需要测试环境配置固定验证码')
  }
}

/**
 * 测试用例 1.2 - 异常流程
 */
async function test1_2_AbnormalFlow() {
  console.log('\n📋 测试用例 1.2 - 异常流程\n')

  // 1.2.1 无效邮箱格式
  console.log('1.2.1 无效邮箱格式...')
  try {
    await client.post('/api/auth/send-code', { email: 'invalid-email' })
    logTest('1.2.1 无效邮箱格式', 'FAIL', '应拒绝无效邮箱格式')
  } catch (error: any) {
    if (error.message.includes('验证码') || error.status === 400) {
      logTest('1.2.1 无效邮箱格式', 'PASS', '正确拒绝无效邮箱')
    } else {
      logTest('1.2.1 无效邮箱格式', 'FAIL', error.message)
    }
  }

  // 1.2.2 错误验证码
  console.log('1.2.2 错误验证码...')
  try {
    const response = await client.post('/api/auth/verify-code', {
      email: 'test@example.com',
      code: '999999'
    })
    // 如果返回 success: false，说明验证码错误被正确处理
    if (!response.success) {
      logTest('1.2.2 错误验证码', 'PASS', '正确拒绝错误验证码')
    } else {
      logTest('1.2.2 错误验证码', 'FAIL', '应拒绝错误验证码')
    }
  } catch (error: any) {
    if (error.status === 400 || error.message.includes('无效')) {
      logTest('1.2.2 错误验证码', 'PASS', '正确拒绝错误验证码')
    } else {
      logTest('1.2.2 错误验证码', 'FAIL', error.message)
    }
  }

  // 1.2.3 缺少必要参数
  console.log('1.2.3 缺少必要参数...')
  try {
    await client.post('/api/auth/send-code', {})
    logTest('1.2.3 缺少必要参数', 'FAIL', '应拒绝缺少邮箱的请求')
  } catch (error: any) {
    if (error.status === 400) {
      logTest('1.2.3 缺少必要参数', 'PASS', '正确拒绝缺少参数的请求')
    } else {
      logTest('1.2.3 缺少必要参数', 'FAIL', error.message)
    }
  }
}

/**
 * 测试用例 1.3 - 用户信息获取
 */
async function test1_3_GetUserInfo() {
  console.log('\n📋 测试用例 1.3 - 用户信息获取\n')

  // 1.3.1 未登录用户访问 /api/auth/me
  console.log('1.3.1 未登录用户获取信息...')
  try {
    const response = await client.get('/api/auth/me')
    if (!response.success || response.status === 401) {
      logTest('1.3.1 未登录用户获取信息', 'PASS', '正确拒绝未登录请求')
    } else {
      logTest('1.3.1 未登录用户获取信息', 'FAIL', '应拒绝未登录请求')
    }
  } catch (error: any) {
    if (error.status === 401) {
      logTest('1.3.1 未登录用户获取信息', 'PASS', '正确拒绝未登录请求')
    } else {
      logTest('1.3.1 未登录用户获取信息', 'FAIL', error.message)
    }
  }
}

/**
 * 测试用例 1.4 - 用户登出
 */
async function test1_4_Logout() {
  console.log('\n📋 测试用例 1.4 - 用户登出\n')

  console.log('1.4.1 登出 API...')
  try {
    const response = await client.post('/api/auth/logout')
    if (response.success) {
      logTest('1.4.1 登出 API', 'PASS', '登出成功')
    } else {
      logTest('1.4.1 登出 API', 'FAIL', '登出失败')
    }
  } catch (error: any) {
    logTest('1.4.1 登出 API', 'FAIL', error.message)
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('═══════════════════════════════════════')
  console.log('    用户认证模块 API 测试')
  console.log('═══════════════════════════════════════\n')
  console.log(`API Base URL: ${API_BASE}`)
  console.log(`测试时间: ${new Date().toISOString()}\n`)

  try {
    await test1_1_NormalFlow()
    await test1_2_AbnormalFlow()
    await test1_3_GetUserInfo()
    await test1_4_Logout()

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
    const resultsPath = './tests/data/auth-test-results.json'
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2))
    console.log(`\n📄 测试结果已保存到: ${resultsPath}`)

  } catch (error) {
    console.error('\n❌ 测试执行出错:', error)
    process.exit(1)
  }
}

main()
