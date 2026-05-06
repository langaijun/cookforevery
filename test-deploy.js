// 检查部署状态
const fs = require('fs')
const path = require('path')

console.log('=== 检查项目部署状态 ===')

// 检查必要的文件
const files = [
  'package.json',
  'next.config.ts',
  'app/api/test-image-generation.ts',
  'lib/tongyi-image.ts',
  '.env'
]

files.forEach(file => {
  const exists = fs.existsSync(file)
  console.log(`${file}: ${exists ? '✅' : '❌'}`)
})

// 检查环境变量
const env = require('dotenv').config({ path: '.env' })
const requiredVars = [
  'DASHSCOPE_API_KEY',
  'RAILWAY_BUCKET_NAME',
  'RAILWAY_BUCKET_ENDPOINT',
  'RAILWAY_ACCESS_KEY_ID',
  'RAILWAY_SECRET_ACCESS_KEY',
  'PUBLIC_BUCKETS_HOST'
]

console.log('\n=== 环境变量检查 ===')
requiredVars.forEach(varName => {
  const value = process.env[varName]
  console.log(`${varName}: ${value ? '✅' : '❌'}`)
  if (value) {
    console.log(`  长度: ${value.length}`)
    if (varName.includes('KEY') && value.length > 10) {
      console.log(`  前10位: ${value.substring(0, 10)}...`)
    }
  }
})

// 检查Railway部署配置
console.log('\n=== Railway配置检查 ===')
if (fs.existsSync('railway.toml')) {
  console.log('railway.toml: ✅')
  const config = fs.readFileSync('railway.toml', 'utf8')
  console.log('配置内容:')
  console.log(config)
} else {
  console.log('railway.toml: ❌')
}