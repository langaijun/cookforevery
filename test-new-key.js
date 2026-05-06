// 测试新 API key
const newKey = 'sk-21b7454677784d658ab8c91a8c5d15ed';

console.log('测试新 key...');

fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${newKey}`,
    'X-DashScope-Async': 'enable',
  },
  body: JSON.stringify({
    model: 'wanx-v1',
    input: {
      prompt: '一个简单的测试图片',
    },
    parameters: {
      style: '<auto>',
      size: '1024*1024',
      n: 1
    }
  })
})
  .then(r => r.text())
  .then(text => {
    console.log('API Response:');
    console.log(text);
  })
  .catch(e => console.error('Error:', e));
