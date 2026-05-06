const { uploadToBucket, isBucketConfigured } = require('./lib/railway-bucket.ts');

console.log('=== Railway Bucket 上传测试 ===');
console.log('Bucket 已配置:', isBucketConfigured());

// 测试上传
const fs = require('fs');
const path = require('path');

// 创建一个测试图片文件
const testImagePath = path.join(__dirname, 'test-image.png');
const testBuffer = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 1, 0, 0, 0, 58, 83, 69, 84]); // 简单的PNG头部

fs.writeFileSync(testImagePath, testBuffer);

async function testUpload() {
  try {
    console.log('开始测试上传...');
    const result = await uploadToBucket(testBuffer, 'recipes/test-upload.png', 'image/png');
    console.log('✅ 上传成功!');
    console.log('URL:', result);
    
    // 清理
    fs.unlinkSync(testImagePath);
  } catch (error) {
    console.log('❌ 上传失败:', error.message);
    fs.unlinkSync(testImagePath);
  }
}

testUpload();
