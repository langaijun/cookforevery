# Railway 部署失败修复计划

## 根因分析

```
GitHub Push → Railway 触发 → Railpack 检测 lockfile
→ 执行 `npm ci` → lockfile 与 package.json 不一致
→ 构建立即失败 ❌
```

### 具体原因
- package.json 要求 `prisma@^7.8.0`
- 但 lockfile 中记录的是 `prisma@6.19.3`
- `npm ci` 严格模式检测到不一致，直接报错退出

**关键点**：在依赖安装阶段就失败，根本没到 Next.js/Prisma 运行逻辑。

## 修复步骤

```bash
# 1. 恢复 package.json 到 Git HEAD 版本
git checkout HEAD -- package.json

# 2. 删除旧 lockfile（强制同步）
rm package-lock.json

# 3. 重新生成 lockfile（此时 package.json 和 lockfile 完全一致）
npm install

# 4. 提交并推送，触发 Railway 自动部署
git add package.json package-lock.json
git commit -m "fix: sync package.json and lockfile for Railway deployment"
git push origin master

# 5. 监控 Railway 自动部署
railway service cookforevery logs
```

## 验证部署成功

1. Railway 构建日志显示 `npm ci` 成功
2. `npm run build` 成功执行
3. 服务正常启动
4. 访问生产 URL: https://cookforevery-production.up.railway.app

## 锁文件策略

**保留并提交 package-lock.json** - 这是最佳实践：
- ✅ 确保依赖一致性
- ✅ 提高构建可靠性
- ✅ 加快构建速度（Railway 缓存）
- ✅ 避免版本漂移

## 部署策略确认

**使用 GitHub 自动部署**（推荐）：
- 代码推送后自动触发
- 记录完整的 commit 历史
- CI/CD 标准流程

## 下次工作开始

直接执行上述 4 步修复脚本即可。
