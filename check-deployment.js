// 检查Railway部署状态
const https = require('https')

console.log('=== Railway 部署状态检查 ===\n')

// 检查主页面
function checkURL(url, name) {
  return new Promise((resolve, reject) => {
    console.log(`检查 ${name}: ${url}`)

    const req = https.get(url, (res) => {
      console.log(`  状态码: ${res.statusCode}`)
      if (res.statusCode === 200) {
        console.log(`  ✅ ${name} 正常`)
        resolve(true)
      } else if (res.statusCode === 404) {
        console.log(`  ❌ ${name} 404 - 可能未部署`)
        resolve(false)
      } else {
        console.log(`  ⚠️  ${name} ${res.statusCode}`)
        resolve(false)
      }
    })

    req.on('error', (error) => {
      console.log(`  ❌ ${name} 连接失败: ${error.message}`)
      resolve(false)
    })

    req.setTimeout(5000, () => {
      req.destroy()
      console.log(`  ⏰ ${name} 超时`)
      resolve(false)
    })
  })
}

// 测试API端点
async function testAPI() {
  const testUrl = 'https://cookforevery-production.up.railway.app/api/test-image-generation'

  console.log('\n测试API端点:')
  console.log(`URL: ${testUrl}`)

  const postData = JSON.stringify({
    name: '测试菜品',
    description: '这是一个测试'
  })

  const options = {
    hostname: 'cookforevery-production.up.railway.app',
    port: 443,
    path: '/api/test-image-generation',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }

  const req = https.request(options, (res) => {
    let data = ''
    res.on('data', chunk => data += chunk)
    res.on('end', () => {
      console.log(`状态码: ${res.statusCode}`)
      if (res.statusCode === 200) {
        try {
          const response = JSON.parse(data)
          console.log('✅ API响应正常:', response.message)
        } catch (e) {
          console.log('❌ API响应解析失败')
        }
      } else {
        console.log('❌ API响应异常')
        console.log('响应内容:', data.substring(0, 200))
      }
    })
  })

  req.on('error', (error) => {
    console.log('❌ API请求失败:', error.message)
  })

  req.write(postData)
  req.end()
}

// 执行检查
async function runChecks() {
  // 检查各个页面
  await checkURL('https://cookforevery-production.up.railway.app/', '首页')
  await checkURL('https://cookforevery-production.up.railway.app/recipes', '食谱页')

  // 测试API
  await testAPI()

  console.log('\n=== 检查完成 ===')
}

runChecks()