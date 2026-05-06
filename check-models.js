const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY
if (!DASHSCOPE_API_KEY) {
  console.error('请设置环境变量 DASHSCOPE_API_KEY（勿在仓库中硬编码）。')
  console.error('注意：Next.js 与常见工具会优先使用 .env.local，其中的同名变量会覆盖 .env。')
  process.exit(1)
}

console.log('Checking available models with Token Plan API...\n')

// 尝试不同的模型名称
const modelsToTry = [
  'wanx-v1',
  'wanx-image-generation',
  'wanx-v1.5',
  'wanx-image-v1',
  'wanx'
]

async function testModel(model) {
  try {
    console.log(`\nTrying model: ${model}`)

    const response = await fetch('https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        prompt: '测试图片：一只猫',
        size: '1024x1024',
        n: 1
      })
    })

    console.log(`  Status: ${response.status}`)

    if (response.ok) {
      const data = await response.json()
      console.log(`  ✅ Success with model: ${model}`)
      console.log(`  Response:`, JSON.stringify(data, null, 2))
    } else {
      const errorText = await response.text()
      console.log(`  ❌ Failed with model: ${model}`)
      console.log(`  Error: ${errorText}`)
    }
  } catch (error) {
    console.log(`  ⚠️  Error testing model ${model}:`, error.message)
  }
}

// 逐个测试模型
for (const model of modelsToTry) {
  await testModel(model)
  // 添加延迟避免请求过快
  await new Promise(resolve => setTimeout(resolve, 1000))
}