// 检查API路由
const https = require('https')
const fs = require('fs')

console.log('=== API路由检查 ===\n')

// API路由列表
const apiRoutes = [
  '/api/test-image-generation',
  '/api/test',
  '/api/debug'
]

// 检查路由
async function checkRoute(route) {
  const url = `https://cookforevery-production.up.railway.app${route}`

  return new Promise((resolve, reject) => {
    console.log(`检查 ${route}:`)
    console.log(`URL: ${url}`)

    const req = https.get(url, (res) => {
      console.log(`  状态码: ${res.statusCode}`)
      console.log(`  Content-Type: ${res.headers['content-type']}`)

      if (res.statusCode === 200 && res.headers['content-type']?.includes('json')) {
        console.log(`  ✅ ${route} 正常`)
      } else {
        console.log(`  ❌ ${route} 异常`)
      }

      resolve(res.statusCode)
    })

    req.on('error', (error) => {
      console.log(`  ❌ ${route} 连接失败: ${error.message}`)
      resolve(null)
    })

    req.setTimeout(3000, () => {
      req.destroy()
      console.log(`  ⏰ ${route} 超时`)
      resolve(null)
    })
  })
}

// 检查Next.js配置
function checkNextConfig() {
  console.log('\n=== Next.js配置检查 ===')

  if (fs.existsSync('next.config.ts')) {
    console.log('✅ next.config.ts 存在')
    const config = fs.readFileSync('next.config.ts', 'utf8')
    if (config.includes('images')) {
      console.log('✅ 图片域名配置已设置')
    }
  } else {
    console.log('❌ next.config.ts 不存在')
  }
}

// 检查API文件
function checkAPIFiles() {
  console.log('\n=== API文件检查 ===')

  const apiFiles = [
    'app/api/test-image-generation.ts',
    'app/api/test.ts',
    'app/api/debug.ts'
  ]

  apiFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} 存在`)
    } else {
      console.log(`❌ ${file} 不存在`)
    }
  })
}

// 执行检查
async function runChecks() {
  console.log('正在检查Railway上的API路由...\n')

  // 检查API文件
  checkAPIFiles()

  // 检查Next.js配置
  checkNextConfig()

  // 检查API路由
  console.log('\n=== Railway API路由检查 ===')
  for (const route of apiRoutes) {
    await checkRoute(route)
  }

  console.log('\n=== 检查完成 ===')
  console.log('\n建议:')
  console.log('1. 如果所有API路由都返回404，请确保在Railway控制台重新部署')
  console.log('2. 检查部署日志是否有错误')
  console.log('3. 确保环境变量已正确设置')
}

runChecks()