// Test script to simulate Railway environment
require('dotenv').config({ path: '.env' })

console.log('=== Railway Environment Test ===')
console.log('DASHSCOPE_API_KEY:', process.env.DASHSCOPE_API_KEY ? 'Set' : 'Not set')
console.log('RAILWAY_BUCKET_NAME:', process.env.RAILWAY_BUCKET_NAME || 'Not set')
console.log('RAILWAY_BUCKET_ENDPOINT:', process.env.RAILWAY_BUCKET_ENDPOINT || 'Not set')
console.log('PUBLIC_BUCKETS_HOST:', process.env.PUBLIC_BUCKETS_HOST || 'Not set')

// Test API directly
async function testAPI() {
  try {
    const response = await fetch('https://cookforevery-production.up.railway.app/api/test-image-generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '测试菜品',
        description: '这是一个测试菜品'
      })
    })

    console.log('\n=== API Response ===')
    console.log('Status:', response.status)
    console.log('Headers:', response.headers)

    if (response.ok) {
      const data = await response.json()
      console.log('Response data:', data)
    } else {
      const text = await response.text()
      console.log('Error response:', text)
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testAPI()