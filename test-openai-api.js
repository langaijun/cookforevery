const OPENAI_API_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_API_KEY) {
  console.error('请设置 OPENAI_API_KEY（本脚本用于兼容模式网关，勿使用仓库内硬编码密钥）。')
  process.exit(1)
}

console.log('Testing OpenAI compatible API with team key...')
console.log('API Key length:', OPENAI_API_KEY.length)
console.log('API Key prefix:', OPENAI_API_KEY.substring(0, 15))

// 测试 OpenAI 兼容接口
async function testOpenAI() {
  try {
    const response = await fetch('https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: '测试图片生成：一盘红烧肉，色泽红亮，汤汁浓郁，配以青菜点缀，美食摄影风格，高分辨率',
        size: '1024x1024',
        quality: 'standard',
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

    if (data.data && data.data[0] && data.data[0].url) {
      console.log('\n✅ Image generated successfully!')
      console.log('Image URL:', data.data[0].url)
    } else {
      console.log('\n❌ No image URL returned')
    }
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testOpenAI()