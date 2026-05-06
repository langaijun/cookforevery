const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY
if (!DASHSCOPE_API_KEY) {
  console.error('请设置 DASHSCOPE_API_KEY。若 .env 有效但请求仍失败，检查 .env.local 是否覆盖了该变量。')
  process.exit(1)
}

console.log('Testing Token Plan team API...')
console.log('API Key length:', DASHSCOPE_API_KEY.length)
console.log('API Key prefix:', DASHSCOPE_API_KEY.substring(0, 15))

// 测试异步任务创建
async function testAPI() {
  try {
    const response = await fetch('https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'wanx-v1',
        prompt: '测试图片生成：一盘红烧肉，色泽红亮，汤汁浓郁，配以青菜点缀，美食摄影风格，高分辨率',
        size: '1024x1024',
        n: 1
      })
    })

    console.log('\nResponse status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', errorText)
      return
    }

    const data = await response.json()
    console.log('\nAPI Response:', JSON.stringify(data, null, 2))

    if (data.id) {
      console.log('\n✅ Task created successfully!')
      console.log('Task ID:', data.id)
    } else {
      console.log('\n❌ No task ID returned')
    }
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testAPI()