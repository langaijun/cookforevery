import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

// 加载环境变量
config()

console.log('=== 环境变量调试 ===')
console.log('1. process.env.DASHSCOPE_API_KEY:', process.env.DASHSCOPE_API_KEY ? 'SET' : 'NOT SET')
console.log('2. process.env.DASHSCOPE_API_KEY length:', process.env.DASHSCOPE_API_KEY?.length || 0)
console.log('3. process.env.DASHSCOPE_API_KEY prefix:', process.env.DASHSCOPE_API_KEY?.substring(0, 20))

// 直接读取 .env 文件
const envPath = join(process.cwd(), '.env')
const envContent = readFileSync(envPath, 'utf8')
console.log('\n4. .env file content DASHSCOPE_API_KEY line:')
console.log(envContent.split('\n').find(line => line.includes('DASHSCOPE_API_KEY')))

// 检查是否有其他环境变量文件
const envFiles = ['.env.local', '.env.production', '.env.development']
envFiles.forEach(file => {
  try {
    const content = readFileSync(join(process.cwd(), file), 'utf8')
    const line = content.split('\n').find(l => l.includes('DASHSCOPE_API_KEY'))
    if (line) {
      console.log(`\n5. ${file} content:`, line)
    }
  } catch (e) {
    // 文件不存在
  }
})