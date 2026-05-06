// 直接测试新 API key
const key = 'sk-21b7454677784d658ab8c91a8c5d15ed';

console.log('创建任务...');

fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${key}`,
    'X-DashScope-Async': 'enable',
  },
  body: JSON.stringify({
    model: 'wanx-v1',
    input: {
      prompt: '一个简单的测试图片，一个苹果',
    },
    parameters: {
      style: '<auto>',
      size: '1024*1024',
      n: 1
    }
  })
})
  .then(r => r.json())
  .then(data => {
    console.log('任务创建结果:');
    console.log(JSON.stringify(data, null, 2));

    if (data.output?.task_id) {
      const taskId = data.output.task_id;
      console.log('\n开始轮询任务结果...');

      function poll(count) {
        setTimeout(() => {
          fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
            headers: {
              'Authorization': `Bearer ${key}`,
            },
          })
            .then(r => r.json())
            .then(data => {
              const status = data.output?.task_status;
              console.log(`轮询 ${count}: 状态=${status}`);

              if (status === 'SUCCEEDED') {
                console.log('\n成功!');
                console.log('图片 URL:', data.output?.results?.[0]?.url);
              } else if (status === 'FAILED') {
                console.log('\n失败:', data.output?.message);
              } else {
                poll(count + 1);
              }
            });
        }, 3000);
      }

      poll(1);
    }
  })
  .catch(e => console.error('Error:', e));
