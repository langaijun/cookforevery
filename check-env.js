// 直接检查环境变量，不通过模块系统
console.log('=== 直接环境变量检查 ===');
console.log('RAILWAY_BUCKET_ENDPOINT:', process.env.RAILWAY_BUCKET_ENDPOINT);
console.log('RAILWAY_BUCKET_NAME:', process.env.RAILWAY_BUCKET_NAME);
console.log('RAILWAY_ACCESS_KEY_ID:', process.env.RAILWAY_ACCESS_KEY_ID ? '存在' : '不存在');
console.log('RAILWAY_SECRET_ACCESS_KEY:', process.env.RAILWAY_SECRET_ACCESS_KEY ? '存在' : '不存在');
console.log('PUBLIC_BUCKETS_HOST:', process.env.PUBLIC_BUCKETS_HOST);

// 检查配置
const isConfigured = !!(process.env.RAILWAY_ACCESS_KEY_ID && 
                        process.env.RAILWAY_SECRET_ACCESS_KEY && 
                        process.env.RAILWAY_BUCKET_NAME && 
                        process.env.RAILWAY_BUCKET_ENDPOINT && 
                        process.env.PUBLIC_BUCKETS_HOST);

console.log('\n=== 配置状态 ===');
console.log('Bucket 已配置:', isConfigured);

if (isConfigured) {
  console.log('✅ 所有环境变量已正确设置');
  console.log('Bucket URL:', `https://${process.env.PUBLIC_BUCKETS_HOST}/recipes/test.png`);
} else {
  console.log('❌ 缺少环境变量');
  const missing = [];
  if (!process.env.RAILWAY_BUCKET_ENDPOINT) missing.push('RAILWAY_BUCKET_ENDPOINT');
  if (!process.env.RAILWAY_BUCKET_NAME) missing.push('RAILWAY_BUCKET_NAME');
  if (!process.env.RAILWAY_ACCESS_KEY_ID) missing.push('RAILWAY_ACCESS_KEY_ID');
  if (!process.env.RAILWAY_SECRET_ACCESS_KEY) missing.push('RAILWAY_SECRET_ACCESS_KEY');
  if (!process.env.PUBLIC_BUCKETS_HOST) missing.push('PUBLIC_BUCKETS_HOST');
  console.log('缺失:', missing);
}
