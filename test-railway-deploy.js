// 模拟Railway部署环境测试
const http = require('http')
const url = require('url')
const fs = require('fs')
const path = require('path')

// 设置模拟的Railway环境变量
process.env.RAILWAY_ACCESS_KEY_ID = 'tid_AYMPyA_EtFgJzlOBiZbDytroVyz_ZWeKCuVHsk_WNPVtuJNnie'
process.env.RAILWAY_SECRET_ACCESS_KEY = 'tsec_SM+VhNhBqs9rfM-kh9cxY8FSXhkpOykbkWCdZkLcw2Ljq3k7-+uGlSHt0yenLAx9KAY_Pw'

console.log('=== 模拟Railway环境测试 ===')

// 创建模拟的Next.js API处理器
const createMockServer = () => {
  const server = http.createServer((req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }

    if (req.method === 'POST' && req.url === '/api/test-image-generation') {
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      req.on('end', async () => {
        try {
          const data = JSON.parse(body)
          console.log('Received data:', data)

          // 模拟处理延迟
          await new Promise(resolve => setTimeout(resolve, 1000))

          // 返回模拟的成功响应
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            success: true,
            imageUrl: 'https://example.com/generated-image.png',
            message: 'Image generated successfully'
          }))
        } catch (error) {
          console.error('Error:', error)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            error: error.message
          }))
        }
      })
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Not found' }))
    }
  })

  return server
}

// 启动模拟服务器
const server = createMockServer()
server.listen(3001, () => {
  console.log('Mock server running on http://localhost:3001')

  // 测试API
  const testData = {
    name: '测试菜品',
    description: '这是一个测试菜品'
  }

  const req = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/test-image-generation',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(testData))
    }
  }, (res) => {
    let data = ''
    res.on('data', chunk => {
      data += chunk
    })
    res.on('end', () => {
      console.log('Response:', data)
      server.close()
    })
  })

  req.on('error', (e) => {
    console.error('Request error:', e.message)
    server.close()
  })

  req.write(JSON.stringify(testData))
  req.end()
})