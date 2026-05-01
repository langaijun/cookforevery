/**
 * 快速 API 健康检查测试
 * 用于验证 API 基本可用性
 */

import { writeFileSync } from 'fs'

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000'

interface TestResult {
  name: string
  status: 'PASS' | 'FAIL' | 'WARN'
  responseTime: number
  message?: string
}

const results: TestResult[] = []

/**
 * 执行 API 请求并记录结果
 */
async function checkEndpoint(name: string, url: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<TestResult> {
  const startTime = Date.now()

  try {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' }
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${API_BASE}${url}`, options)
    const responseTime = Date.now() - startTime
    const responseText = await response.text()

    // 尝试解析 JSON
    let jsonResponse
    try {
      jsonResponse = JSON.parse(responseText)
    } catch {
      jsonResponse = responseText
    }

    // 检查状态码
    if (response.ok) {
      return {
        name,
        status: 'PASS',
        responseTime,
        message: `Status: ${response.status}`
      }
    } else {
      return {
        name,
        status: 'FAIL',
        responseTime,
        message: `Status: ${response.status}, Error: ${typeof jsonResponse === 'string' ? jsonResponse : JSON.stringify(jsonResponse)}`
      }
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime
    return {
      name,
      status: 'FAIL',
      responseTime,
      message: error.message || 'Unknown error'
    }
  }
}

/**
 * 执行所有测试
 */
async function runTests() {
  console.log('═══════════════════════════════════════')
  console.log('      API 快速健康检查')
  console.log('═══════════════════════════════════════')
  console.log(`API Base URL: ${API_BASE}`)
  console.log(`测试时间: ${new Date().toISOString()}\n`)

  // 基础路由测试
  console.log('📋 基础路由测试\n')

  results.push(await checkEndpoint('首页 GET', '/'))
  results.push(await checkEndpoint('食谱列表 GET', '/api/recipes/list'))
  results.push(await checkEndpoint('分享列表 GET', '/api/shares'))
  results.push(await checkEndpoint('sitemap GET', '/sitemap.xml'))
  results.push(await checkEndpoint('robots GET', '/robots.txt'))

  // 多语言路由测试
  console.log('\n🌍 多语言路由测试\n')

  results.push(await checkEndpoint('中文首页 GET', '/zh-CN'))
  results.push(await checkEndpoint('英文首页 GET', '/en'))
  results.push(await checkEndpoint('日文首页 GET', '/ja'))
  results.push(await checkEndpoint('韩文首页 GET', '/ko'))

  // API 端点测试
  console.log('\n🔌 API 端点测试\n')

  results.push(await checkEndpoint('发送验证码 POST', '/api/auth/send-code', 'POST', { email: 'test@example.com' }))
  results.push(await checkEndpoint('食谱列表 (搜索) GET', '/api/recipes/list?search=鸡蛋'))
  results.push(await checkEndpoint('食谱列表 (筛选) GET', '/api/recipes/list?difficulty=EASY&taste=sweet'))
  results.push(await checkEndpoint('获取评论 GET', '/api/comments?recipeId=test'))

  // 管理员路由测试
  console.log('\n🔐 管理员路由测试\n')

  results.push(await checkEndpoint('管理员首页 GET', '/admin'))
  results.push(await checkEndpoint('管理员登录 GET', '/admin/login'))
  results.push(await checkEndpoint('管理员用户 GET', '/admin/users'))

  // 输出结果
  console.log('\n═══════════════════════════════════════')
  console.log('           测试结果')
  console.log('═══════════════════════════════════════\n')

  const passed = results.filter(r => r.status === 'PASS')
  const failed = results.filter(r => r.status === 'FAIL')
  const total = results.length

  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : '❌'
    const timeStr = `${result.responseTime}ms`
    console.log(`${icon} ${result.name.padEnd(40)} (${timeStr})`)
    if (result.message) {
      console.log(`   ${result.message}`)
    }
  })

  // 性能统计
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / total
  const maxResponseTime = Math.max(...results.map(r => r.responseTime))

  console.log('\n📊 性能统计')
  console.log(`平均响应时间: ${avgResponseTime.toFixed(0)}ms`)
  console.log(`最大响应时间: ${maxResponseTime}ms`)
  console.log(`慢响应 (>500ms): ${results.filter(r => r.responseTime > 500).length}`)

  // 通过率
  console.log('\n📈 测试摘要')
  console.log(`总测试数: ${total}`)
  console.log(`通过: ${passed.length}`)
  console.log(`失败: ${failed.length}`)
  console.log(`通过率: ${((passed.length / total) * 100).toFixed(2)}%`)

  if (failed.length > 0) {
    console.log('\n❌ 失败的测试:')
    failed.forEach(f => {
      console.log(`  - ${f.name}`)
      console.log(`    ${f.message}`)
    })

    // 保存测试结果
    const fs = await import('fs')
    fs.writeFileSync('./tests/data/quick-test-results.json', JSON.stringify(results, null, 2))
    console.log('\n📄 测试结果已保存')

    process.exit(1)
  } else {
    console.log('\n✅ 所有测试通过！')
    process.exit(0)
  }
}

// 检查环境
console.log('🔍 检查测试环境...\n')

const testUrl = process.env.API_BASE_URL || 'http://localhost:3001'

// 包装 runTests 函数
async function main() {
  try {
    const checkResponse = await fetch(testUrl, { method: 'HEAD' })
    if (checkResponse.ok || checkResponse.status === 404) {
      console.log(`✅ 服务器可达: ${testUrl}`)
      await runTests()
    } else {
      console.log(`❌ 服务器不可达: ${testUrl}`)
      console.log('请先启动开发服务器: npm run dev')
      process.exit(1)
    }
  } catch (error: any) {
    console.log(`❌ 连接服务器失败: ${error.message}`)
    console.log('请先启动开发服务器: npm run dev')
    process.exit(1)
  }
}

// 运行主函数
main()
