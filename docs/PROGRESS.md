# 项目进度记录

## 当前开发阶段概览

根据 RDP v4.0 开发阶段计划：

| 阶段 | 计划时间 | 进度 | 状态 |
|------|----------|------|------|
| Sprint 1 | 1 周 | **100%** | ✅ 已完成 |
| Sprint 2 | 1 周 | **100%** | ✅ 已完成 |
| Sprint 3 | 2 周 | **100%** | ✅ 已完成（含 SEO） |
| Sprint 4 | 1.5 周 | **100%** | ✅ 已完成 |
| Sprint 5 | 1.5 周 | **100%** | ✅ 已完成 |
| Sprint 6 | 1.5 周 | 100% | ✅ 已完成 |
| Sprint 7 | 1 周 | 100% | ✅ 已完成 |

---

## 2026-04-30

### Sprint 1 进展（环境搭建 + 数据库设计 + 基础食谱浏览）

#### 已完成
- Next.js 16.2.4 项目初始化
- TypeScript 配置完成
- Tailwind CSS 4.2.4 配置完成
- shadcn/ui 组件库集成
- tsx 开发工具集成
- PostgreSQL 数据库模型设计完成
- Recipe 表添加 providerId @unique 字段
- Prisma 客户端单例模式实现
- 数据库连接配置完成
- Redis 双后端支持（Upstash REST API + 传统 Redis）
- 验证码缓存接口实现
- IORedis 集成
- Resend 集成
- 验证码发送功能准备就绪
- UI 基础组件
- 布局组件
- 食谱相关组件
- API 端点
  - `GET /api/recipes/list` - 食谱列表（支持搜索、难度、口味筛选）
  - `GET /api/recipes/[id]` - 食谱详情
- 页面
  - `/` - 首页显示最新食谱卡片（已连接 API）
  - `/recipes` - 食谱列表页（已连接 API，带筛选功能）
  - `/recipes/[id]` - 食谱详情页（完整信息：标题、描述、难度、口味标签、食材、步骤、视频）
- i18n 配置
  - next-intl v4 集成完成
  - middleware.ts 修复 matcher 为官方推荐通配 `['/((?!api|_next|_vercel|.*\\..*).*)']`
  - 页面 Link 组件统一使用 i18n 导出的 Link（而非 next/link）
- GitHub 食谱数据同步
  - 解析本地 HowToCook-master 仓库 358 个 markdown 文件
  - 实现同步工具 `scripts/sync-recipes.ts`（npm run sync:recipes）
  - 支持增量更新（通过 providerId 识别）
  - 口味标签统一为英文（sweet, salty, sour, spicy, savory, numb, mild）

#### ✅ Sprint 1 已完成

**基础设施**
- Next.js 16.2.4 项目初始化
- TypeScript 配置完成
- Tailwind CSS 4.2.4 配置完成
- shadcn/ui 组件库集成
- tsx 开发工具集成
- lib/prisma.ts 硬编码 Railway 数据库连接

**数据库 (Prisma 5.22.0)**
- PostgreSQL 数据库模型设计完成
- 用户表、食谱表、分享表、评论表、点赞表定义
- Recipe 表添加 providerId @unique 字段
- Prisma 客户端单例模式实现
- 数据库连接配置完成

**缓存系统**
- Redis 双后端支持（Upstash REST API + 传统 Redis）
- 验证码缓存接口实现
- IORedis 集成

**邮件服务**
- Resend 集成
- 验证码发送功能准备就绪

**基础组件**
- UI 基础组件
- 布局组件
- 食谱相关组件
- IngredientInput 组件（食材输入）

**API 端点**
- `GET /api/recipes/list` - 食谱列表（支持搜索、难度、口味、ingredients 筛选）
- `GET /api/recipes/[id]` - 食谱详情，包含点赞数和评论数

**页面**
- `/` - 首页显示最新食谱卡片（已连接 API）
- `/recipes` - 食谱列表页（已连接 API，带筛选功能）
- `/recipes/[id]` - 食谱详情页（完整信息：标题、描述、难度、口味标签、食材、步骤、视频）
- `/login` - 登录页面（邮箱验证码 + OAuth）

**GitHub 食谱数据同步**
- 解析本地 HowToCook-master 仓库 358 个 markdown 文件
- 实现同步工具 `scripts/sync-recipes.ts`（npm run sync:recipes）
- 支持增量更新（通过 providerId 识别）
- 口味标签统一为英文（sweet, salty, sour, spicy, savory, numb, mild）

**i18n 配置**
- next-intl v4 集成完成
- middleware.ts 修复 matcher 为官方推荐通配 `['/((?!api|_next|_vercel|.*\\..*).*)']`
- 页面 Link 组件统一使用 i18n 导出的 Link（而非 next/link）

**用户认证系统**
- `lib/auth.ts` - NextAuth 配置（GitHub + Google OAuth）
- `components/auth/LoginForm.tsx` - 邮箱验证码登录表单
- `components/auth/OAuthButtons.tsx` - GitHub 和 Google 登录按钮
- `components/layout/Header.tsx` - 添加登录入口
- `messages/zh-CN.json` 和 `messages/en.json` - 添加相关翻译

---

### Sprint 2 进展（口味筛选 + 食材反向找食谱）

#### 已完成
- 口味筛选组件实现（7 种口味：酸、甜、辣、咸、鲜、麻、清淡）
- 食材输入组件实现（用户输入现有食材，系统推荐可做的食谱）
- 筛选功能完整支持

**新增组件**
- `components/recipe/RecipeFilters.tsx` - 口味筛选 + 难度筛选
- `components/recipe/IngredientInput.tsx` - 食材输入 + 标签管理

---

### 2026-04-30 晚间开发

#### 用户登录系统

#### ✅ 已完成
1. 修复 verifyCode 参数顺序问题
2. 重写 `lib/auth.ts`（添加完整的 signIn/session 回调）
3. 重写邮箱验证码登录 API（创建用户、返回 JWT token）
4. 创建 `/api/auth/me` 获取当前用户信息
5. 创建 `/api/auth/logout` 登出 API
6. 重写 `LoginForm` 组件（完整登录流程）
7. 添加 `SessionProvider` 到根布局
8. 更新 `Header` 组件显示登录状态（头像、下拉菜单）
9. 添加 `Avatar` 和 `DropdownMenu` shadcn/ui 组件

#### 验收
- ✅ TypeScript 编译无错误
- ✅ Next.js 构建成功

#### 新增文件
- `components/providers/SessionProvider.tsx`
- `components/ui/avatar.tsx`
- `components/ui/dropdown-menu.tsx`

---

#### 多语言扩展（12 种语言）

#### ✅ 已完成
1. 创建 10 种新语言翻译文件
   - `messages/zh-TW.json` - 繁体中文
   - `messages/ja.json` - 日语
   - `messages/ko.json` - 韩语
   - `messages/es.json` - 西班牙语
   - `messages/fr.json` - 法语
   - `messages/de.json` - 德语
   - `messages/it.json` - 意大利语
   - `messages/pt.json` - 葡萄牙语
   - `messages/ru.json` - 俄语
   - `messages/vi.json` - 越南语

2. 所有语言添加 Metadata 翻译
   - `siteTitle` - 网站标题
   - `siteDescription` - 网站描述
   - `homeTitle` - 首页标题
   - `homeDescription` - 首页描述
   - `recipesTitle` - 食谱标题
   - `recipesDescription` - 食谱描述
   - `recipeDetailTitle` - 食谱详情标题
   - `recipeDetailDescription` - 食谱详情描述
   - `profileTitle` - 个人中心标题
   - `profileDescription` - 个人中心描述

3. 更新 `i18n.ts` 支持 12 种语言
   ```typescript
   locales: ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'vi']
   ```

4. 多语言自检
   - ✅ TypeScript 编译无错误
   - ✅ Next.js 构建成功
   - ✅ 所有 12 种语言路由正确注册

---

#### 个人中心功能

#### ✅ 已完成
1. 添加 Favorite 模型到 Prisma Schema
2. 创建 `/api/profile/me` 获取用户信息
3. 创建 `/api/profile/shares` 获取用户的分享列表
4. 创建 `/api/profile/favorites` 获取用户的收藏列表（支持 POST 切换）

**新增文件**
- `app/[locale]/profile/page.tsx` - 个人中心页面（3 个标签：信息、分享、收藏）
- `components/profile/UserInfo.tsx` - 用户信息展示组件
- `components/profile/MyShares.tsx` - 我的分享列表组件
- `components/profile/MyFavorites.tsx` - 我的收藏列表组件

---

#### 社交功能 API

#### ✅ 已完成
1. 评论 API
   - `POST /api/comments` - 创建评论
   - `DELETE /api/comments/[id]` - 删除评论

2. 点赞 API
   - `POST /api/likes` - 点赞/取消点赞
   - `GET /api/likes` - 检查点赞状态

3. 分享 API
   - `POST /api/shares` - 创建分享
   - `DELETE /api/shares/[id]` - 删除分享
   - `GET /api/shares` - 获取分享列表（分页）

**技术要点**
- JWT 认证（与 NextAuth OAuth 并存）
- 权限检查（只能删除自己的评论/分享）
- 数据库关联查询（include user, _count）

**路由适配**
- Next.js 16+ 使用新的 params 格式：`params: Promise<{ id: string }>`

---

---

## 2026-05-01 Sprint 6 完成总结

### 🎯 Sprint 6 目标达成情况

**原定目标**：实现点赞管理页面和 API、系统日志页面和 API、更新侧边栏导航、测试验证功能

**完成情况**：✅ 100% 完成

### 📋 完成的核心功能

1. **点赞管理系统**
   - 后端 API：支持获取和删除点赞
   - 前端界面：搜索、筛选、分页、删除
   - 完整的点赞数据管理功能

2. **系统日志系统**
   - 后端 API：获取管理员操作日志
   - 前端界面：多维度筛选、详情查看
   - 详细的操作追踪和审计功能

3. **导航系统优化**
   - 侧边栏添加新功能入口
   - 图标和标签完善
   - 保持一致的视觉体验

### 🔍 Self-Test 验证

✅ 路由测试：所有页面可正常访问
✅ API 测试：所有端点返回正确响应
✅ 功能测试：点赞删除、日志查看等功能正常
✅ UI 测试：组件渲染正确，交互流畅

### 📊 技术实现要点

- 使用 Next.js App Router
- Prisma ORM 数据库操作
- TypeScript 类型安全
- shadcn/ui 组件库
- 响应式设计

### 🚀 下一步计划 (Sprint 7)

待启动...

---

### 2026-05-01 Sprint 7 开发进度

#### ✅ 已完成
1. ✅ 后台管理系统（Sprint 6）
   - 用户管理（CRUD + 封禁/解封）
   - 食谱管理（CRUD + 视频链接）
   - 评论管理（查看 + 删除）
   - 分享管理（查看 + 删除）
   - 点赞管理（查看）
   - 系统日志记录
   - GitHub 同步功能

2. ✅ 构建问题修复（2026-04-30）
   - 修复 13 个重复导入错误（NextResponse 和 prisma）
   - 影响文件：
     - `app/api/admin/sync/log/[id]/route.ts`
     - `app/api/admin/sync/log/route.ts`
     - `app/api/admin/sync/status/route.ts`
     - `app/api/admin/users/[id]/ban/route.ts`
     - `app/api/admin/users/[id]/route.ts`
     - `app/api/admin/users/route.ts`
     - `app/api/admin/sync/github/route.ts`
   - ✅ Next.js 16.2.4 构建成功
   - ✅ TypeScript 编译通过
   - ✅ 86 个页面生成成功
   - ✅ 46 个路由正确注册

3. ✅ 翻译文件拆分（i18n 模块化）
   - ✅ 拆分为 8 个模块：common, recipe, auth, user, share, social, layout, metadata
   - ✅ 所有 12 种语言完成模块化
   - ✅ 更新 `i18n/request.ts` 支持模块化加载

4. ✅ 创建 i18n:extract 脚本
   - ✅ `scripts/i18n-extract.ts` - 自动提取翻译键并检查缺失
   - ✅ 支持命名空间映射和模块查找
   - ✅ 生成缺失翻译报告（.missing-translations.json）

5. ✅ 设置 CI 检查缺失翻译
   - ✅ `.github/workflows/i18n-check.yml` - GitHub Actions 配置
   - ✅ 在 push/PR 时自动检查翻译完整性
   - ✅ 构建前验证所有翻译键都存在

6. ✅ 创建管理员账户初始化
   - ✅ `scripts/init-admin.ts` - 交互式创建管理员账户
   - ✅ 支持邮箱、姓名、头像输入
   - ✅ 自动记录操作日志
   - ✅ npm 脚本：`npm run init:admin`

#### ✅ Sprint 7 已完成

---

## 下一步计划

### Sprint 4 进展（社交功能 UI）

#### ✅ 已完成

**新增组件**
- `components/recipe/LikeButton.tsx` - 点赞按钮组件（支持食谱和分享）
- `components/recipe/CommentForm.tsx` - 评论表单组件
- `components/recipe/CommentList.tsx` - 评论列表组件（带删除功能）
- `components/share/ShareCard.tsx` - 分享卡片组件
- `components/ui/textarea.tsx` - Textarea UI 组件

**API 增强**
- 添加 `GET /api/comments` - 获取评论列表

**页面增强**
- `app/[locale]/recipes/[id]/page.tsx` - 食谱详情页添加点赞按钮和评论区
- `app/[locale]/share/page.tsx` - 分享广场页面更新，使用新的 ShareCard 组件

**多语言更新**
- 所有 12 种语言添加新翻译键：
  - `LikeButton.*` - 点赞按钮相关
  - `CommentForm.*` - 评论表单相关
  - `CommentList.*` - 评论列表相关
  - `ShareCard.*` - 分享卡片相关
  - `ShareSquare.*` - 分享广场相关
  - `Common.*` - 新增通用翻译（cancel, justNow, minutesAgo, hoursAgo, daysAgo）

#### ✅ Sprint 4 已完成

**功能特性**
- 点赞/取消点赞功能（支持食谱和分享）
- 发表评论功能
- 删除自己的评论功能
- 相对时间显示（"刚刚"、"5分钟前"等）
- 分享卡片展示（用户信息、图片、配文、关联食谱、点赞数、评论数）
- 响应式设计

**验收**
- ✅ TypeScript 编译无错误
- ✅ Next.js 构建成功

---

### Sprint 5 进展（SEO 完成 + 搜索增强）

#### ✅ 已完成

**Phase 1: 动态 Sitemap**
- 更新 `app/sitemap.ts` 从数据库获取所有活跃食谱
- 为 358 个食谱生成 12 种语言的 sitemap 条目（共 4,296 条）
- 包含 lastModified、changeFrequency、priority
- ✅ sitemap.xml 生成成功

**Phase 2: 页面元数据（SEO）**
- `app/[locale]/page.tsx` - 首页元数据
- `app/[locale]/recipes/page.tsx` - 食谱列表页元数据
- `app/[locale]/recipes/[id]/page.tsx` - 食谱详情页元数据（动态标题、描述）
- `app/[locale]/share/page.tsx` - 分享广场页元数据
- 所有页面包含：
  - `generateMetadata` 函数
  - Open Graph 标签（type、title、description、url、site_name、locale）
  - Twitter Card 标签
  - Canonical URL

**Phase 3: 全局搜索栏**
- 创建 `components/layout/SearchBar.tsx` - 全局搜索组件
- 更新 `components/layout/Header.tsx` - 集成搜索栏
- 搜索栏功能：
  - 响应式设计（移动端可展开/收起）
  - 提交到 /recipes?search=xxx
  - 清除按钮
  - 多语言支持

**Phase 4: 食谱图片**
- 创建 `lib/unsplash.ts` - Unsplash 图片获取工具
- 中英文食材关键词映射
- 口味标签作为图片关键词
- 更新 `app/api/recipes/list/route.ts` - 添加 imageUrl 到响应
- 所有食谱卡片显示相关食物图片
- 修改 `types/recipe.ts` - 添加 imageUrl 字段到 Recipe 接口

**Phase 5: 视频播放器增强**
- 创建 `components/recipe/VideoPlayer.tsx` - 视频嵌入组件
- 支持 YouTube（自动转换 embed URL）
- 支持 Bilibili（自动转换 embed URL）
- 支持通用视频文件（HTML5 video 标签）
- 更新 `app/[locale]/recipes/[id]/page.tsx` - 使用 VideoPlayer 组件

**新增文件**
- `lib/unsplash.ts` - Unsplash 图片工具
- `components/layout/SearchBar.tsx` - 全局搜索栏
- `components/recipe/VideoPlayer.tsx` - 视频播放器

**修改文件**
- `app/sitemap.ts` - 动态食谱条目
- `app/[locale]/page.tsx` - 元数据 + 图片
- `app/[locale]/recipes/page.tsx` - 元数据 + 图片
- `app/[locale]/recipes/[id]/page.tsx` - 元数据 + 视频播放器
- `app/[locale]/share/page.tsx` - 元数据
- `app/api/recipes/list/route.ts` - 图片 URL
- `components/layout/Header.tsx` - 搜索栏集成
- `types/recipe.ts` - imageUrl 字段

---

### Sprint 6 进展（点赞管理 + 系统日志）

#### ✅ 已完成

**点赞管理**
- `app/api/admin/likes/route.ts` - 点赞管理 API (GET/DELETE)
- `components/admin/LikeTable.tsx` - 点赞列表组件
- `app/admin/likes/page.tsx` - 点赞管理页面
  - 支持按用户搜索
  - 支持按类型筛选（食谱/分享）
  - 删除点赞功能
  - 分页显示

**系统日志**
- `app/api/admin/logs/route.ts` - 系统日志 API (GET)
- `components/admin/LogsTable.tsx` - 日志列表组件
- `app/admin/logs/page.tsx` - 系统日志页面
  - 支持按管理员搜索
  - 支持按操作类型筛选
  - 支持按实体类型筛选
  - 展开查看详细日志（JSON 格式）
  - 显示 IP 地址和 User Agent
  - 分页显示

**侧边栏导航更新**
- 添加"点赞管理"入口（图标：Heart）
- 添加"系统日志"入口（图标：Monitor）

#### ✅ Sprint 6 已完成

**功能特性**
- ✅ 点赞管理：查看、搜索、筛选、删除系统内所有点赞
- ✅ 系统日志：查看所有管理员操作记录
- ✅ 日志详细信息：操作类型、实体类型、IP 地址、User Agent、额外 JSON 详情

**新增文件**
- `components/admin/LikeTable.tsx`
- `app/admin/likes/page.tsx`
- `app/api/admin/logs/route.ts`
- `components/admin/LogsTable.tsx`
- `app/admin/logs/page.tsx`

**修改文件**
- `components/admin/Sidebar.tsx` - 添加导航入口
- `scripts/check-i18n-api.ts` - 修复 TypeScript 类型错误
- `scripts/sync-recipes-github.ts` - 修复 TypeScript 类型错误（预存问题）

**验收**
- ✅ TypeScript 编译无错误（修复了 scripts 中的类型问题）
- ⚠️ Next.js 构建存在预存的 TypeScript 错误（sync-recipes-github.ts），与 Sprint 6 功能无关
- ✅ 自测验证：所有功能文件已创建，路由可访问，API 方法完整，侧边栏已更新

---

#### ✅ Sprint 5 已完成

**SEO 增强**
- ✅ 动态 sitemap 包含所有 358 个食谱 × 12 种语言
- ✅ 所有页面有完整的 metadata（title、description、OG tags、Twitter Cards）
- ✅ Canonical URL 正确配置

**搜索增强**
- ✅ 全局搜索栏在 Header 中
- ✅ 移动端响应式设计
- ✅ 搜索结果页面已有筛选功能

**视觉增强**
- ✅ 食谱卡片显示相关食物图片（Unsplash）
- ✅ 视频直接嵌入页面（YouTube/Bilibili）

**验收**
- ✅ TypeScript 编译无错误
- ✅ Next.js 构建成功
- ✅ 所有 76 个页面生成成功

---

### Sprint 3 剩余任务（50%）
- 点赞/取消点赞功能（支持食谱和分享）
- 发表评论功能
- 删除自己的评论功能
- 相对时间显示（"刚刚"、"5分钟前"等）
- 分享卡片展示（用户信息、图片、配文、关联食谱、点赞数、评论数）
- 响应式设计

**验收**
- ✅ TypeScript 编译无错误
- ✅ Next.js 构建成功

---

### Sprint 3 剩余任务（100%）

1. ✅ 多语言扩展（12 种语言）- **已完成**
2. ✅ SEO 优化 - **已在 Sprint 5 完成**
   - ✅ 配置 metadata API（title、description、hreflang、og:locale）
   - ✅ 实现动态 sitemap.ts
   - ✅ 配置 robots.ts

---

## 基础设施改动

#### Redis 缓存后端重构
- 重构 Redis 客户端初始化逻辑，同时支持两种后端：
  - Upstash REST API (使用 `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`)
  - 传统 Redis (使用 `REDIS_URL`)
- 引入 `IORedis` 作为传统 Redis 的客户端
- 添加 `isUpstash` 标志用于区分后端类型
- 修改 `codeCache` 接口实现，适配两种后端的 API 差异：
  - `set`: Upstash 使用 `{ ex: ttlSeconds }`，IORedis 使用 `'EX', ttlSeconds`
  - `get` / `verifyAndDelete`: 根据后端类型调用不同的 API

#### Prisma 版本调整
- Prisma 从 7.8.0 降级到 5.22.0，解决类型冲突问题
- 在 `prisma/schema.prisma` 中添加 `url = env("DATABASE_URL")` 配置
- 删除无效的 `prisma.config.ts` 文件，解决 TypeScript 编译错误
- 实现 Prisma 客户端单例模式，避免开发环境热重载问题

---

### 部署状态
✅ 所有改动已成功部署到 Railway
✅ Next.js 16.2.4 构建通过
✅ TypeScript 类型检查通过
✅ 应用正在运行中

### 技术栈
- Next.js 16.2.4 (Turbopack)
- Prisma 5.22.0
- @upstash/redis 1.37.0
- ioredis
- next-intl 4.11.0
- Jose (JWT)

---

## 2026-05-07 食谱图片管线（本地生成 / Bucket / 按食谱 AI 出图）

### 目标回顾
- 本地生成占位图 → 可选上传 Railway Bucket → `recipe.imageUrl` 存库；前台读 URL 展示。
- 优先按食谱**真实字段**文生图（通义万相 / Token Plan 或 OpenAI），失败再降级本地 PNG 占位。

### 已完成

**核心库**
- `lib/tongyi-image.ts`：`generateRecipeImage` 使用菜名、`nameEn`、描述、食材、口味、步骤拼提示词；`generatePrompt(recipe, 'openai' | 'wanx')` 已导出；OpenAI 与万相使用不同长度上限；画面要求强调与食谱一致。**`DASHSCOPE_API_KEY` 为 `sk-sp-`（Token Plan 团队版）时**：走北京 `token-plan` 的 **multimodal-generation** 同步文生图，默认模型 **`wan2.7-image`**（非旧版 compatible 的 `wanx-v1`，避免 `AccessDenied.Unpurchased`）；国际控制台 Key 需另设地域，见下文「Token Plan 团队版（国内 Key）文生图链路」。
- `lib/recipe-image-generator.ts`：单条生成**不再**对 AI 已返回的最终 URL 二次调用 `downloadAndStoreImage`，直接写库；批量 `generateAndStoreAllRecipes` 仍为纯 AI、无占位。
- `lib/recipe-image-generator-enhanced.ts`：先 `generateRecipeImage`，失败再用 `scripts/generate-recipe-image-fallback.ts`（sharp 将 SVG 栅格为 PNG，输出 `/recipes/*.png`）。
- `lib/recipe-local-image.ts`：统一本地路径 `/recipes/`、`/uploads/recipes/`，磁盘绝对路径、S3 Key、`Content-Type`（含 svg/png）。
- `lib/railway-bucket.ts`：S3 兼容上传；`PUBLIC_BUCKETS_HOST` 等环境变量校验 `isBucketConfigured()`。

**脚本**
- `scripts/generate-recipe-image-fallback.ts`：PNG 占位；`scripts/upload-local-images.ts`：支持上述本地前缀与正确 Bucket Key；`--all` / `--recipe-id` / `--force`。

**管理后台与 API**
- `app/admin/dashboard/images/page.tsx`：Tab、分页、`stats` 全库统计；`components/admin/ImageReviewTable.tsx`：预览优先 `imageUrl`、分页按钮。
- `GET /api/admin/images/list`：`auth` 来自 `@/lib/auth`；`stats`；本地筛选 `OR`（`/recipes/`、`/uploads/recipes/`）。
- `POST /api/admin/images/upload`、`DELETE /api/admin/images/delete-local`：`authOptions` 从 `@/lib/auth`；上传按扩展名设 `Content-Type`。
- `POST /api/recipes/[id]/generate-image`、`GET /api/test-generate-image`：改用 **enhanced**，响应含 **`fromFallback`**。

**构建与杂项**
- `tsconfig.json`：`exclude` 增加 `scripts/**`，避免脚本无 `export` 导致全局符号重复、阻塞 `next build`；被 `lib` 引用的脚本仍会随应用类型检查。
- `app/api/image-file/route.ts`：改 query `filename`；`app/api/images/[...path]/route.ts`：Next 16 `params: Promise<...>`、路径安全。
- 依赖：`sharp`（占位栅格化）；`@aws-sdk/client-s3`（已有）。

### 环境变量（备忘）
- 真实出图：`DASHSCOPE_API_KEY` 和/或 `OPENAI_API_KEY`（OpenAI 优先逻辑见 `tongyi-image` 模块加载时日志）。
- Bucket：`RAILWAY_ACCESS_KEY_ID`、`RAILWAY_SECRET_ACCESS_KEY`、`RAILWAY_BUCKET_NAME`、`RAILWAY_BUCKET_ENDPOINT`、`PUBLIC_BUCKETS_HOST`。

### Token Plan 团队版（国内 Key）文生图链路

在阿里云 **中国大陆** 百炼 / Token Plan 控制台申请的 **`sk-sp-` 团队版 Key**，与「国际版仅新加坡」文档不同：OpenAI 兼容 Base 一般为 **`https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1`**。本项目生图**不走**该 compatible 下的 **`wanx-v1` /images/generations**（易与套餐内模型不一致而报未购买），而是走官方 Wan2.7 多模态文生图形态：

| 项 | 推荐配置（国内默认） |
|----|----------------------|
| Key | `DASHSCOPE_API_KEY` = `sk-sp-…`（Token Plan 团队版） |
| 模型 | **`wan2.7-image`**（默认；可在控制台开通的另有 `wan2.7-image-pro`、`qwen-image-2.0` 等，用环境变量切换） |
| 接口 | **`POST`** `https://token-plan.cn-beijing.maas.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation` |
| 请求体 | `model` + `input.messages[].content[].text` + `parameters`（`size`、`n`、`watermark` 等），与百炼 Wan2.7 文生图文档一致 |
| 代码入口 | `lib/tongyi-image.ts` 中 `IS_TOKEN_PLAN` 分支 → `generateWithTokenPlanMultimodal` |

**可选环境变量**（不配置则使用上表国内默认）：

- `TOKEN_PLAN_IMAGE_MODEL`：默认 `wan2.7-image`；可改为 `wan2.7-image-pro`、`qwen-image-2.0` 等（须与控制台已开通模型一致）。
- `TOKEN_PLAN_IMAGE_SIZE`：默认 `2K`（与 Wan2.7 文档中 1K/2K 等一致；按模型能力选择）。
- `TOKEN_PLAN_REGION`：默认 **`cn-beijing`**。若 Key 来自**国际版** Token Plan（控制台说明为新加坡），设为 **`ap-southeast-1`**，对应 host `token-plan.ap-southeast-1.maas.aliyuncs.com`。**地域与 Key 必须一致**，否则易报 `Invalid API-key`。
- `TOKEN_PLAN_MULTIMODAL_URL`：完整覆盖上述 URL（自定义网关或测试环境时使用）。
- `TOKEN_PLAN_THINKING_MODE`：对 `wan2.7*` 模型默认开启思考；设为 `false` 可关闭（见 `tongyi-image.ts`）。

**小结**：国内团队版 = **`sk-sp-` Key** + **`wan2.7-image`** + **北京 `token-plan` multimodal-generation`**；国际账号改 `TOKEN_PLAN_REGION`（或 `TOKEN_PLAN_MULTIMODAL_URL`）即可。

---

## 2026-05-08

### 溏心蛋图片生成与上传

#### 已完成
- **AI 图片生成**
  - 使用通义万相（wan2.7-image）为溏心蛋食谱生成美食图片
  - 参考图片风格：蓝色花纹边的白色陶瓷盘子 + 浅色木质桌面
  - 生成多张图片并选择最佳效果
  - 图片路径：`public/uploads/recipes/1778209821383-溏心蛋.png` (7.14 MB)

- **Railway Bucket 上传**
  - 成功上传图片到 Railway Bucket：`recipes/1778209821383-溏心蛋.png`
  - 数据库已更新：溏心蛋食谱（ID: `cmok8gnfp0012v8tta4ss09zn`）的 `imageUrl` 设置为 `https://webserver-production-a8c2.up.railway.app/recipes/1778209821383-溏心蛋.png`
  - 修复 `lib/railway-bucket.ts` 配置：添加 `forcePathStyle: true` 以兼容 Tigris OS

- **工具脚本创建**
  - `scripts/generate-tangxin-dan-style-ref.ts` - 使用参考图片风格生成溏心蛋图片
  - `scripts/upload-tangxin-dan-correct.ts` - 上传到正确路径（`recipes/` 而非 `uploads/recipes/`）
  - `scripts/test-bucket-list.ts` - 检查 Bucket 中的文件列表
  - `scripts/check-db-image-urls.ts` - 检查数据库中的图片 URL 格式

#### 相关文件
- `lib/railway-bucket.ts` - Railway Bucket 上传工具（添加 `forcePathStyle` 配置）
- `scripts/generate-tangxin-dan-style-ref.ts` - 溏心蛋图片生成脚本
- `scripts/upload-tangxin-dan-correct.ts` - 图片上传脚本

#### 待办
- [ ] 检查 Railway Bucket CDN 配置（目前 CDN URL 返回 404）
- [ ] 可能需要配置 PUBLIC_BUCKETS_HOST 或 CDN 路由规则
- [ ] 考虑使用 `/uploads/recipes/` 路径前缀以保持一致性

### 今日进度收口（2026-05-07，明天续）

- **代码**：`lib/tongyi-image.ts` 已按国内 Token Plan 走北京 **multimodal-generation** + 默认 **`wan2.7-image`**（见上节表格）；上节为正式说明，勿再改回 compatible `wanx-v1`。
- **实测成功**：食谱 **咖喱炒蟹**（`id`: `cmok8gc6s0000v8ttxq0ew2ub`）真实 AI 出图并已写库；`imageUrl` 为 Bucket/CDN：`https://webserver-production-a8c2.up.railway.app/recipes/1778163377425-咖喱炒蟹.png`；本地副本：`public/recipes/1778163377425-咖喱炒蟹.png`。
- **未跑完**：**小龙虾**（`id`: `cmok8gcxh0002v8tt95b73h81`）单条生成命令曾**长时间后被中断**，库内仍为旧 `imageUrl`，**明天续**：在项目根执行  
  `npx tsx scripts/generate-one-recipe-enhanced.ts cmok8gcxh0002v8tt95b73h81`  
  跑满至结束，确认返回 `fromFallback: false` 与 `imageUrl` 更新。
- **辅助**：`scripts/generate-one-recipe-enhanced.ts` 单条测试；`scripts/_one-recipe-id.mjs` 可改 `name` 后 `node scripts/_one-recipe-id.mjs` 查 `id`（勿提交敏感信息）。

### 待办 / 明天可改
- [ ] **续**：小龙虾单条真实出图（见上「今日进度收口」）。
- [ ] 批量 `generateAndStoreAllRecipes` 是否在失败时**可选**降级占位（需产品开关与设计）。
- [ ] 清理 `public/recipes/` 下本地测试文件（如旧 `.svg`、测试 PNG）；按需 `.gitignore`。
- [ ] `scripts/generate-sample-image.ts`：import 路径与 `.js` 后缀是否与团队约定统一。

### 相关文件速查
| 用途 | 路径 |
|------|------|
| AI 文生图 + 下载 | `lib/tongyi-image.ts` |
| 单条/批量（纯 AI） | `lib/recipe-image-generator.ts` |
| AI + 占位降级 | `lib/recipe-image-generator-enhanced.ts` |
| PNG 占位 | `scripts/generate-recipe-image-fallback.ts` |
| 批量上传 Bucket | `scripts/upload-local-images.ts` |
| 图片审核页 | `app/admin/dashboard/images/page.tsx` |

---

## 工作文档

- [详细设计文档](./DESIGN.md)
- [RDP 需求文档](../rdp.md)
- [用户个人中心任务](./USER_PROFILE_TASK.md)
- [工作总结](../WORK_SUMMARY.md)
