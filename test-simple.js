// Simple test to check if Railway environment is working
console.log('Testing Railway environment...')

// Check if we can access environment variables
console.log('DASHSCOPE_API_KEY:', process.env.DASHSCOPE_API_KEY ? 'Set' : 'Not set')
console.log('RAILWAY_BUCKET_NAME:', process.env.RAILWAY_BUCKET_NAME || 'Not set')

// Try to load the library
try {
  const { generateRecipeImage } = require('./lib/tongyi-image')
  console.log('✅ Library loaded successfully')

  // Test with simple recipe
  const testRecipe = {
    name: '宫保鸡丁',
    description: '经典川菜',
    ingredients: ['鸡胸肉', '花生米'],
    tasteTags: ['spicy']
  }

  console.log('Testing image generation...')
  generateRecipeImage(testRecipe).then(result => {
    console.log('Result:', result)
  }).catch(err => {
    console.error('Error:', err)
  })

} catch (error) {
  console.error('❌ Error loading library:', error.message)
}