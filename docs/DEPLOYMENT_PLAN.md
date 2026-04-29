# Railway 部署修复计划

## 优先级排序

### P0: 立即修复 railway.toml 语法
- 重复 [env] 表导致 duplicated tables 错误
- Railway 最新日志已明确报错
- 阻塞：构建无法正常开始

### P1: 修复 @tailwindcss/postcss 依赖
- devDependencies 在生产构建时缺失
- postcss.config.mjs 需要 @tailwindcss/postcss
- 阻塞：npm run build 会失败

### P1: 确保依赖同步
- package-lock.json 已同步
- 需要推送到远端

## 执行步骤

```bash
# 1. 修复 railway.toml 语法
# 移除重复 [env]，简化配置
git add railway.toml && git commit

# 2. 修复依赖位置
# @tailwindcss/postcss 从 devDependencies 移到 dependencies
npm install @tailwindcss/postcss --save-prod
git add package.json package-lock.json && git commit

# 3. 推送并触发部署
git push origin master

# 4. 验证部署
railway service cookforevery logs
```
