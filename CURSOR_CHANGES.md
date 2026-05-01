# 项目改动记录

## 概述
本次改动主要解决了 Redis 缓存兼容性和 Prisma 配置问题，使项目能够同时支持 Upstash 和传统 Redis 两种缓存后端。

## 具体改动

### 1. Redis 后端支持 (lib/redis.ts)
**提交**: b998c1f - fix: support UPSTASH and REDIS_URL cache backends

**改动内容**:
- 重构 Redis 客户端初始化逻辑，同时支持两种后端：
  - Upstash REST API (使用 `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`)
  - 传统 Redis (使用 `REDIS_URL`)
- 引入 `IORedis` 作为传统 Redis 的客户端
- 添加 `isUpstash` 标志用于区分后端类型
- 修改 `codeCache` 接口实现，适配两种后端的 API 差异：
  - `set`: Upstash 使用 `{ ex: ttlSeconds }`，IORedis 使用 `'EX', ttlSeconds`
  - `get` / `verifyAndDelete`: 根据后端类型调用不同的 API

**兼容性**: 保持了现有的 `codeCache` 接口，不影响现有代码

---

### 2. Prisma 版本降级 (package.json)
**提交**: 025b7fd - fix: downgrade Prisma to 5.22.0 and add DATABASE_URL to schema

**改动内容**:
- Prisma 从 7.8.0 降级到 5.22.0
- 解决了与新版本 Prisma 相关的类型冲突问题
- 在 `prisma/schema.prisma` 中添加 `url = env("DATABASE_URL")` 配置

**原因**: 解决 TypeScript 类型和构建错误

---

### 3. Prisma 配置文件清理
**提交**: 314ce8b - fix: remove invalid prisma.config.ts causing TypeScript error

**改动内容**:
- 删除了无效的 `prisma.config.ts` 文件
- 该文件导致 TypeScript 编译错误

---

### 4. Prisma 单例模式 (lib/prisma.ts)
**提交**: 399308b - fix: implement Prisma singleton pattern in lib/prisma.ts

**改动内容**:
- 实现了 Prisma 客户端单例模式
- 避免开发环境下创建多个 Prisma 实例导致的热重载问题

---

## 部署状态
✅ 所有改动已成功部署到 Railway
✅ Next.js 构建通过
✅ TypeScript 类型检查通过
✅ 应用正在运行中

## 技术栈
- Next.js 16.2.4 (Turbopack)
- Prisma 5.22.0
- @upstash/redis 1.37.0
- ioredis

---

### 5. 路由 404 与数据库连接排障同步（2026-04-29）

**改动内容**:
- 修复 `next-intl` 中间件匹配范围，`middleware.ts` 改为官方通配 matcher：
  - `'/((?!api|_next|_vercel|.*\\..*).*)'`
- 排查并确认 `P1001` 根因来自 Windows `User` 级环境变量残留 `DATABASE_URL`（Neon）覆盖项目 `.env`
- 在 PowerShell 环境改用兼容写法执行 `prisma db execute --stdin`（不使用 Bash heredoc）

**验证结果**:
- `/recipes/[id]` 路由从 404 恢复为 200，且命中 `x-middleware-rewrite`
- `/api/recipes/[id]` 可正常返回 200
- 页面“食谱不存在”可区分为业务数据未命中，而非路由层问题

**经验沉淀**:
- `localePrefix: 'as-needed'` 必须配合覆盖无前缀页面路由的 matcher
- Windows + PowerShell 下避免直接复用 Bash `<<'EOF'` 语法
- Prisma 连接异常需优先检查 `Process/User/Machine` 三层环境变量
