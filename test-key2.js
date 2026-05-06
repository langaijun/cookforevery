// 测试 Token Plan key 解码
import { readFileSync } from 'fs';
import { join } from 'path';

const content = readFileSync(join(process.cwd(), '.env'), 'utf8');
const match = content.match(/^DASHSCOPE_API_KEY=(.*)$/m);
let key = match ? match[1].trim() : '';

// 移除引号
if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
  key = key.slice(1, -1);
}

console.log('原始 key 长度:', key.length);
console.log('原始 key 前缀:', key.substring(0, 20));

// 解码
const encoded = key.slice(6); // 移除 sk-sp-
const decoded = Buffer.from(encoded, 'base64').toString('utf8');

console.log('\n解码后 key 长度:', decoded.length);
console.log('解码后 key 前缀:', decoded.substring(0, 20));
console.log('解码后 key 后缀:', decoded.slice(-20));

// 测试 API 调用
console.log('\n测试 API 调用...');
fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/image-generation/generation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${decoded}`,
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
