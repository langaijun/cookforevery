const apiKey = process.env.DASHSCOPE_API_KEY
if (!apiKey) {
  console.error('请设置 DASHSCOPE_API_KEY 后运行本脚本。')
  process.exit(1)
}

console.log('Testing different model formats...\n')

const models = [
  'wanx-v1',
  'wanx-v1.5',
  'wanx',
  'wanx-image',
  'wanx-image-v1',
  'wan2-image',
  'wan2.1-image',
  'wan2.5-image',
  'wan2.6-image',
  'wan2.7-image',
  'wan2.8-image',
  'wan2.9-image',
  'wan3-image',
  'wan3.1-image'
]

async function testModel(model) {
  try {
    console.log(`\n🔄 Testing: ${model}`)

    const response = await fetch('https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        prompt: 'test image',
        size: '1024x1024',
        n: 1
      })
    })

    console.log(`   Status: ${response.status}`)

    if (response.ok) {
      const data = await response.json()
      console.log(`   ✅ SUCCESS! Model: ${model}`)
      console.log(`   Task ID: ${data.id}`)
      return { success: true, model }
    } else {
      const errorText = await response.text()
      console.log(`   ❌ Failed: ${errorText}`)

      if (errorText.includes('Model not exist')) {
        console.log(`   → This model doesn't exist`)
      } else if (errorText.includes('AccessDenied')) {
        console.log(`   → No access to this model`)
      }
    }
  } catch (error) {
    console.log(`   ⚠️ Error: ${error.message}`)
  }
  return null
}

// 快速测试所有模型
for (const model of models) {
  await testModel(model)
  await new Promise(resolve => setTimeout(resolve, 500))
}