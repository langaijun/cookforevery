// 直接读取 .env 文件
import { readFileSync } from 'fs'
import { join } from 'path'

const envPath = join(process.cwd(), '.env')
const envContent = readFileSync(envPath, 'utf8')

const match = envContent.match(/DASHSCOPE_API_KEY="([^"]+)"/)
const apiKey = match ? match[1] : null

console.log('API Key from .env:', apiKey ? `${apiKey.substring(0, 30)}...` : 'Not found')
console.log('API Key length:', apiKey?.length || 0)

async function testAPI() {
  if (!apiKey) {
    console.error('No API key found')
    return
  }

  try {
    console.log('\n🔄 Testing with direct API key...')

    const response = await fetch('https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'wanx-v1',
        prompt: '测试图片：红烧肉',
        size: '1024x1024',
        n: 1
      })
    })

    console.log('Status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error:', errorText)
      return
    }

    const data = await response.json()
    console.log('Success! Task ID:', data.id)

  } catch (error) {
    console.error('Test failed:', error)
  }
}

testAPI()