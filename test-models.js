const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY
if (!DASHSCOPE_API_KEY) {
  console.error('请设置 DASHSCOPE_API_KEY，例如：')
  console.error('  PowerShell: $env:DASHSCOPE_API_KEY="你的key"; node test-models.js')
  process.exit(1)
}

console.log('Testing different models with Token Plan...\n')

const models = [
  'wanx-v1',
  'wan2.7-image',
  'wanx-image-generation',
  'wanx-v1.5',
  'wan2.6-image',
  'wanx-image-v1',
  'wanx',
  'wan2.5-image'
]

async function testModel(model) {
  try {
    console.log(`\n🔄 Testing model: ${model}`)

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

    console.log(`   Status: ${response.status}`)

    if (response.ok) {
      const data = await response.json()
      console.log(`   ✅ Success! Model: ${model}`)
      console.log(`   Task ID: ${data.id}`)
      return { success: true, model, taskId: data.id }
    } else {
      const errorText = await response.text()
      console.log(`   ❌ Failed. Model: ${model}`)
      console.log(`   Error: ${errorText}`)
      return { success: false, model, error: errorText }
    }
  } catch (error) {
    console.log(`   ⚠️  Error: ${error.message}`)
    return { success: false, model, error: error.message }
  }
}

// 逐个测试模型
for (const model of models) {
  const result = await testModel(model)
  if (result.success) {
    console.log(`\n🎉 Found working model: ${model}`)
    break
  }
  // 等待 1 秒
  await new Promise(resolve => setTimeout(resolve, 1000))
}