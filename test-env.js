require('dotenv').config({ path: '.env.local' });

console.log('=== Railway Bucket 环境变量测试 ===');
console.log('RAILWAY_BUCKET_ENDPOINT:', process.env.RAILWAY_BUCKET_ENDPOINT);
console.log('RAILWAY_BUCKET_NAME:', process.env.RAILWAY_BUCKET_NAME);
console.log('RAILWAY_ACCESS_KEY_ID:', process.env.RAILWAY_ACCESS_KEY_ID?.substring(0, 20) + '...');
console.log('RAILWAY_SECRET_ACCESS_KEY:', process.env.RAILWAY_SECRET_ACCESS_KEY?.substring(0, 20) + '...');
console.log('PUBLIC_BUCKETS_HOST:', process.env.PUBLIC_BUCKETS_HOST);

// 测试配置完整性
function checkConfig() {
  const config = {
    endpoint: process.env.RAILWAY_BUCKET_ENDPOINT,
    bucketName: process.env.RAILWAY_BUCKET_NAME,
    accessKeyId: process.env.RAILWAY_ACCESS_KEY_ID,
    secretAccessKey: process.env.RAILWAY_SECRET_ACCESS_KEY,
    publicHost: process.env.PUBLIC_BUCKETS_HOST
  };

  const missing = [];
  Object.entries(config).forEach(([key, value]) => {
    if (!value) missing.push(key);
  });

  console.log('\n=== 配置完整性检查 ===');
  if (missing.length === 0) {
    console.log('✅ 所有配置已加载');
    console.log('Bucket URL:', `https://${config.publicHost}/recipes/test.png`);
  } else {
    console.log('❌ 缺少配置:', missing);
  }
}

checkConfig();
