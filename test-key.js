// 测试 Token Plan API Key
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// 从 .env 读取 key
const dotEnvPath = join(process.cwd(), '.env');
let key = '';

if (existsSync(dotEnvPath)) {
  const content = readFileSync(dotEnvPath, 'utf-8');
  const match = content.match(/^DASHSCOPE_API_KEY=(.*)$/m);
  if (match) {
    key = match[1].trim();
    // 移除引号
    if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
      key = key.slice(1, -1);
    }
  }
}

console.log('Key length:', key.length);
console.log('Key prefix:', key.substring(0, 20));
console.log('Key format: sk-sp-?', key.startsWith('sk-sp-'));

// 测试 API 调用
console.log('\n测试 API 调用...');
fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/image-generation/generation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${key}`,
    'X-DashScope-Async': 'enable',
  },
  body: JSON.stringify({
    model: 'wanx-v1',
    prompt: '一个简单的测试图片',
    size: '1280*720',
    n: 1,
    watermark: false
  })
})
  .then(r => r.text())
  .then(text => {
    console.log('API Response:');
    console.log(text);
  })
  .catch(e => console.error('Error:', e));
