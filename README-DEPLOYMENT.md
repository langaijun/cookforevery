# Railway 部署指南

## 部署失败问题修复

### 问题：install mise packages: node

这个错误是因为Railway的新版本尝试使用mise包管理器，但我们的项目配置不兼容。

### 解决方案：

1. **更新 railway.toml**：
   - 已更新配置文件，使用自定义部署脚本
   - 脚本会按顺序执行：安装依赖 → 生成Prisma → 执行数据库补丁 → 构建项目

2. **环境变量设置**：
   在Railway控制台设置以下环境变量：

   ```
   # 通义万相 API Key
   DASHSCOPE_API_KEY=sk-21b7454677784d658ab8c91a8c5d15ed
   
   # Railway Bucket 配置
   RAILWAY_BUCKET_NAME=allocated-tray-xqjwxtlmff
   RAILWAY_BUCKET_ENDPOINT=https://t3.storageapi.dev
   PUBLIC_BUCKETS_HOST=webserver-production-a8c2.up.railway.app
   
   # Railway Storage 认证
   RAILWAY_ACCESS_KEY_ID=tid_AYMPyA_EtFgJzlOBiZbDytroVyz_ZWeKCuVHsk_WNPVtuJNnie
   RAILWAY_SECRET_ACCESS_KEY=tsec_SM+VhNhBqs9rfM-kh9cxY8FSXhkpOykbkWCdZkLcw2Ljq3k7-+uGlSHt0yenLAx9KAY_Pw
   ```

### 部署步骤：

1. **推送代码到Git**：
   ```bash
   git add .
   git commit -m "Fix Railway deployment configuration"
   git push origin master
   ```

2. **在Railway控制台重新部署**：
   - 进入Railway项目页面
   - 点击 "Deploy" 按钮
   - 等待部署完成

### 验证部署：

1. 访问应用：https://cookforevery-production.up.railway.app
2. 测试图片生成API：
   ```bash
   curl -X POST "https://cookforevery-production.up.railway.app/api/test-image-generation" \
   -H "Content-Type: application/json" \
   -d '{"name":"测试菜品"}'
   ```

### 常见问题：

1. **如果还是失败**：
   - 检查Railway控制台的构建日志
   - 确保所有依赖都在package.json中

2. **如果API返回404**：
   - 确认API路由文件存在：`app/api/test-image-generation.ts`
   - 检查Next.js路由配置