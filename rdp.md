# 项目 RDP（Recipe Development Plan）v4.0
## 项目名称：家庭中式食谱网站（HomeCookHub）

---

## 1. 项目概述
### 1.1 项目背景
基于 **你自己 Fork 的** [HowToCook](https://github.com/langaijun/HowToCook) 仓库，构建无广告、社区驱动的中式食谱网站。食谱数据由你自主维护，通过 Git 工作流不定时更新。

### 1.2 核心价值观对齐
- **无广告**：不植入任何商业广告
- **开源与共享**：所有食谱数据来源于社区
- **实用性**：真正帮助家庭解决"吃什么"和"怎么做"的问题
- **极简认证**：无需注册密码，使用邮箱/GitHub/Gmail验证码登录
- **全球化**：支持12种语言，服务于全球华人及中餐爱好者

---

## 2. 功能需求（Functional Requirements）

| 模块 | 描述 | 优先级 |
|------|------|--------|
| **前台-用户端** |||
| 食谱浏览 | 展示所有中式食谱，支持分页和搜索 | P0 |
| 口味筛选 | 按口味选择：酸、甜、辣、咸、鲜、麻、清淡等 | P0 |
| 食材筛选 | 用户输入家中现有食材，系统推荐可做的食谱 | P0 |
| 食谱详情 | 展示食材、步骤、时间、难度、口味标签、**视频链接（可选）** | P0 |
| 用户分享 | 登录用户可上传"自己做出来的菜"照片、文字心得 | P1 |
| 评论功能 | 对食谱或他人分享进行评论 | P1 |
| 点赞功能 | 对食谱或分享点赞 | P1 |
| 用户系统 | **无密码登录**：邮箱验证码 / GitHub / Gmail | P0 |
| 分享流 | 展示用户晒图 + 点赞 + 评论的动态广场 | P1 |
| 多语言支持 | **12种语言**，通过 i18n 框架实现，无文案硬编码 | P0 |
| SEO优化 | 多语言SEO、规范标签、hreflang、站点地图 | P0 |
| 搜索 | 全局搜索菜名 / 食材 | P0 |
| **后台-管理端** |||
| 菜谱管理 | CRUD 菜谱，支持从 GitHub 同步，支持编辑视频链接字段 | P0 |
| 用户管理 | 查看用户、封禁/解封 | P0 |
| 评论管理 | 查看、删除、编辑用户评论 | P0 |
| 点赞管理 | 查看点赞数据，异常点赞清理 | P1 |
| 分享管理 | 审核/删除用户分享的美食图片 | P1 |
| 数据同步 | 手动/定时从 GitHub 拉取最新菜谱 | P1 |
| 系统日志 | 查看后台操作记录 | P2 |

---

## 3. 非功能需求（Non-functional Requirements）

- **性能**：首页加载 < 2 秒，API P95 < 200ms
- **可用性**：支持 500 并发用户（初期）
- **安全性**：验证码有效期 10 分钟，防止暴力破解
- **可维护性**：前后端分离，代码模块化，文案与代码分离
- **无广告**：不加载任何第三方广告脚本
- **自主数据源**：所有食谱数据来自你自己 Fork 的 GitHub 仓库
- **SEO友好**：多语言URL、hreflang标签、规范标签、动态站点地图

---

## 4. 技术架构建议（完整版）

### 4.1 总体架构
```
[GitHub: langaijun/HowToCook]
    ↓ (手动/定时 sync)
[食谱解析器] → [PostgreSQL]
       ↑              ↓
[后台管理] ←→ [API Server] ←→ [前台 Next.js 14+ (App Router)]
       ↓              ↓                    ↓
   (直接操作DB)   [Resend API]        [next-intl i18n]
                  [GitHub OAuth]       [多语言SEO]
                  [Google OAuth]       [hreflang/规范标签]
```

### 4.2 技术选型

| 层次 | 推荐技术 | 理由 |
|------|----------|------|
| 前端 | Next.js 14+ (App Router) | SEO友好，支持SSR/SSG，内置i18n路由 |
| i18n框架 | **next-intl** | 专为Next.js App Router设计，TypeScript支持好，SEO友好 |
| 后端 | Next.js API Routes | 全栈开发，简化部署 |
| 数据库 | PostgreSQL + Prisma ORM | 类型安全，迁移方便 |
| 缓存/验证码 | **Upstash Redis** | Vercel推荐，免费额度充足（1万请求/天） |
| 邮件服务 | **Resend** | 发送邮箱验证码，免费额度3000封/月 |
| 认证 | 自定义JWT + NextAuth.js (OAuth) | 支持GitHub + Google OAuth |
| 文件存储 | Cloudflare R2 或 Vercel Blob | 存储用户美食图片，免费额度 |
| 后台UI | /admin 路由 + Tailwind CSS + shadcn/ui | 简洁易维护 |
| 部署 | Vercel (推荐) 或 自托管 Docker | 与Upstash集成方便 |

### 4.3 关于 Redis 的说明（重要）

**问题：使用 Vercel 还需要注册 Upstash Redis 吗？**

**答案：需要注册 Upstash Redis。**

原因如下：
1. **Vercel KV 已不再可用**：Vercel 在 2024年12月已停止 KV 服务，现有实例已自动迁移到 Upstash Redis
2. **新项目必须使用外部 Redis**：Vercel Marketplace 现在提供的是 Upstash Redis 集成，本质上是连接到外部 Upstash 服务
3. **注册 Upstash 是免费的**：Upstash 提供 generous 免费层（1万请求/天、256MB存储），足够项目初期使用
4. **集成简单**：通过 Vercel Marketplace 一键安装，环境变量自动注入

**推荐做法**：
- 访问 https://upstash.com 注册账号（可用 GitHub 登录）
- 在 Vercel 项目中选择 Storage → Connect Upstash Redis
- 自动获取 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN`

---

## 5. 多语言架构设计（核心）

### 5.1 技术选型：next-intl

选择 `next-intl` 而非 Next.js 内置 i18n 的理由：
- **专为 App Router 设计**：完全支持 React Server Components
- **类型安全**：完整的 TypeScript 支持，翻译 key 自动补全
- **SEO 友好**：与 Next.js 路由完美集成，支持动态路由本地化
- **按需加载**：仅加载当前语言的翻译文件，减少 JS 体积
- **简单 API**：`useTranslations`、`<Trans>`、`formatDateTime` 等

### 5.2 支持的12种语言

根据中餐食谱网站的目标用户，推荐支持以下 12 种语言：

| 语言代码 | 语言名称 | 目标用户 |
|----------|----------|----------|
| `zh-CN` | 简体中文 | 中国大陆用户 |
| `zh-TW` | 繁體中文 | 台湾、香港用户 |
| `en` | English | 英语用户（默认） |
| `ja` | 日本語 | 日本用户 |
| `ko` | 한국어 | 韩国用户 |
| `es` | Español | 西班牙语用户 |
| `fr` | Français | 法语用户 |
| `de` | Deutsch | 德语用户 |
| `it` | Italiano | 意大利语用户 |
| `pt` | Português | 葡萄牙语用户 |
| `ru` | Русский | 俄语用户 |
| `vi` | Tiếng Việt | 越南语用户 |

### 5.3 目录结构

```
homecookhub/
├── messages/                    # 翻译文件
│   ├── en.json                  # 英语（默认）
│   ├── zh-CN.json               # 简体中文
│   ├── zh-TW.json               # 繁体中文
│   ├── ja.json                  # 日语
│   ├── ko.json                  # 韩语
│   ├── es.json                  # 西班牙语
│   ├── fr.json                  # 法语
│   ├── de.json                  # 德语
│   ├── it.json                  # 意大利语
│   ├── pt.json                  # 葡萄牙语
│   ├── ru.json                  # 俄语
│   └── vi.json                  # 越南语
├── app/
│   ├── [locale]/                # 动态语言前缀
│   │   ├── layout.tsx           # 带 i18n 的根布局
│   │   ├── page.tsx             # 首页
│   │   ├── recipes/
│   │   │   ├── page.tsx         # 食谱列表
│   │   │   └── [id]/
│   │   │       └── page.tsx     # 食谱详情
│   │   ├── share/               # 分享广场
│   │   └── profile/             # 用户中心
│   ├── admin/                   # 后台（不本地化）
│   └── api/                     # API 路由
├── navigation.ts                # next-intl 路由配置
└── middleware.ts                # 语言检测与重定向
```

### 5.4 配置文件示例

#### `next.config.js`
```javascript
const createNextIntlPlugin = require('next-intl/plugin');
 
const withNextIntl = createNextIntlPlugin();
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
};
 
module.exports = withNextIntl(nextConfig);
```

#### `i18n.ts` (或 `navigation.ts`)
```typescript
import {createSharedPathnamesNavigation} from 'next-intl/navigation';
import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  locales: ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'vi'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',  // 默认语言不显示前缀
});
 
export const {Link, redirect, usePathname, useRouter} =
  createSharedPathnamesNavigation(routing);
```

#### `middleware.ts`
```typescript
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n';
 
export default createMiddleware(routing);
 
export const config = {
  matcher: [
    '/((?!api|admin|_next|.*\\..*).*)',  // 排除 API、后台、静态文件
  ],
};
```

#### `app/[locale]/layout.tsx`
```typescript
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n';
 
export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}
 
export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
 
  const messages = await getMessages();
 
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### 5.5 组件中使用翻译

```tsx
// 无文案硬编码，全部使用 key
import {useTranslations} from 'next-intl';
 
export default function RecipeCard() {
  const t = useTranslations('Recipe');
 
  return (
    <div>
      <h2>{t('title')}</h2>
      <p>{t('difficulty')}: {difficulty}</p>
      <button>{t('viewDetails')}</button>
    </div>
  );
}
```

**翻译文件示例** (`messages/en.json`)：
```json
{
  "Common": {
    "search": "Search",
    "login": "Login",
    "logout": "Logout",
    "save": "Save"
  },
  "Recipe": {
    "title": "Recipe Title",
    "difficulty": "Difficulty",
    "ingredients": "Ingredients",
    "steps": "Steps",
    "viewDetails": "View Details",
    "videoTutorial": "Video Tutorial"
  },
  "Auth": {
    "emailLogin": "Email Login",
    "githubLogin": "GitHub Login",
    "gmailLogin": "Gmail Login",
    "sendCode": "Send Code",
    "enterCode": "Enter Verification Code"
  }
}
```

---

## 6. SEO 架构设计（核心）

### 6.1 多语言 SEO 最佳实践

基于搜索结果，多语言 SEO 需要做好以下 6 件事：

| SEO 要求 | 实现方式 |
|----------|----------|
| URL 中包含区域设置 | `[locale]` 动态段 + middleware |
| HTML `lang` 属性 | 根布局中使用 `lang={locale}` |
| 规范 URL | Next.js metadata API `alternates.canonical` |
| Hreflang 标签 | metadata API `alternates.languages` |
| 翻译后的元数据 | 使用 `getTranslations()` 生成页面标题/描述 |
| 多语言站点地图 | `sitemap.ts` 包含各区域设置条目 |

### 6.2 实现示例

#### `app/[locale]/layout.tsx`（完整 SEO 配置）
```typescript
import {getTranslations} from 'next-intl/server';
import {routing} from '@/i18n';
 
export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations({locale, namespace: 'Metadata'});
 
  return {
    title: {
      template: `%s | ${t('siteTitle')}`,
      default: t('siteTitle'),
    },
    description: t('siteDescription'),
    alternates: {
      canonical: `https://homecookhub.com/${locale}`,
      languages: {
        'en': 'https://homecookhub.com/en',
        'zh-CN': 'https://homecookhub.com/zh-CN',
        'ja': 'https://homecookhub.com/ja',
        // ... 其他语言
        'x-default': 'https://homecookhub.com/en',
      },
    },
  };
}
```

#### `app/sitemap.ts`（动态站点地图）
```typescript
import {metadata} from 'next';
import {routing} from '@/i18n';
 
const BASE_URL = 'https://homecookhub.com';
 
// 所有页面路径（不含语言前缀）
const pages = ['', '/recipes', '/share'];
 
export default async function sitemap() {
  const entries = [];
 
  for (const locale of routing.locales) {
    for (const page of pages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: page === '' ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map(loc => [loc, `${BASE_URL}/${loc}${page}`])
          ),
        },
      });
    }
  }
 
  return entries;
}
```

### 6.3 Next.js SEO 原生支持

Next.js 内置 SEO 优化特性：
- **SSR/SSG**：服务器端渲染和静态生成，确保搜索引擎可抓取完整 HTML
- **Image 组件**：自动图片优化、懒加载、WebP 格式转换
- **Metadata API**：简化标题、描述、规范标签配置
- **代码分割**：自动优化 JS 大小，提升页面加载速度

---

## 7. 认证系统设计（更新）

### 7.1 三种登录方式

| 方式 | 实现 | 说明 |
|------|------|------|
| **邮箱验证码** | Resend + Redis | 用户输入邮箱 → 发送6位验证码 → 验证登录 |
| **GitHub OAuth** | NextAuth.js | 标准 OAuth 流程 |
| **Gmail (Google OAuth)** | NextAuth.js | 使用 Google 账号登录 |

### 7.2 统一登录入口

```tsx
// 登录弹窗设计
<div className="flex flex-col gap-3">
  <button onClick={() => handleEmailLogin()}>
    📧 {t('Auth.emailLogin')}
  </button>
  <button onClick={() => signIn('github')}>
    🐙 {t('Auth.githubLogin')}
  </button>
  <button onClick={() => signIn('google')}>
    📧 {t('Auth.gmailLogin')}
  </button>
</div>
```

### 7.3 环境变量配置

```env
# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key

# GitHub OAuth
GITHUB_ID=xxx
GITHUB_SECRET=xxx

# Google OAuth (Gmail)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Resend
RESEND_API_KEY=re_xxx

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

---

## 8. 开发阶段计划（更新版）

| 阶段 | 时间 | 交付内容 |
|------|------|----------|
| Sprint 1 | 1 周 | 环境搭建 + 数据库设计 + 基础食谱浏览 |
| Sprint 2 | 1 周 | 口味筛选 + 食材反向找食谱 |
| Sprint 3 | 2 周 | **i18n 架构**（12语言 + next-intl配置）+ 翻译文件初始化 |
| Sprint 4 | 1.5 周 | **SEO 配置**（hreflang、规范标签、站点地图）+ 认证系统 |
| Sprint 5 | 1.5 周 | 分享/评论/点赞（前台功能） |
| Sprint 6 | 1.5 周 | 后台管理（CRUD 菜谱含视频链接、用户、评论、点赞） |
| Sprint 7 | 1 周 | GitHub 同步脚本 + 部署 + 多语言测试 |

---

## 9. 翻译管理策略

### 9.1 翻译文件组织

- **按模块拆分**：`common.json`、`recipe.json`、`auth.json`、`user.json`
- **命名规范**：使用 camelCase，层级嵌套不超过 3 层
- **默认语言**：英文 (`en.json`) 作为源语言

### 9.2 翻译工作流

```
1. 开发时使用 key 编写文案
2. 运行 `npm run i18n:extract` 提取所有 key
3. 翻译人员更新各语言 JSON 文件
4. CI 检查缺失翻译
```

### 9.3 推荐工具

- **Crowdin** 或 **Lokalise**：团队翻译协作
- **DeepL API**：机器翻译初始版本（需要人工校对）
- **GitHub Actions**：自动同步翻译文件

---

## 10. 风险与缓解

| 风险 | 缓解措施 |
|------|----------|
| 12种语言翻译量大 | 优先翻译核心页面（首页、食谱详情），次要页面渐进翻译 |
| 翻译质量参差不齐 | 建立翻译规范，使用专业翻译服务或社区贡献 |
| hreflang 标签错误影响 SEO | 使用 metadata API 自动生成，定期用 Google Search Console 验证 |
| Redis 免费额度超限 | Upstash 提供 1万请求/天，初期足够；可配置缓存策略优化 |
| Resend 免费额度用完 | 100封/天，初期够用；可限制同一邮箱发送频率 |

---

## 11. 价值观对齐自检清单（更新）

- [x] 页面无任何广告位或赞助商内容
- [x] 所有食谱数据来自你自己 Fork 的 GitHub 仓库
- [x] 不引导购买特定品牌厨具/食材
- [x] 用户分享内容不会被用于商业行为
- [x] 验证码登录降低用户使用门槛，无密码更安全
- [x] 保留对原始 Anduin2017/HowToCook 项目的署名和链接
- [x] 邮件仅用于发送验证码，不做营销
- [x] 多语言支持服务于全球中餐爱好者，体现开源包容精神

---

## 12. 下一步行动建议

### 本周可完成的任务：

1. **注册必要服务**：
   - [ ] Upstash Redis (https://upstash.com) - 用于验证码存储
   - [ ] Resend (https://resend.com) - 用于发送验证码邮件
   - [ ] GitHub OAuth App - 配置回调 URL
   - [ ] Google Cloud Console - 启用 OAuth 2.0

2. **初始化 Next.js + next-intl 项目**：
   ```bash
   npx create-next-app@latest homecookhub --typescript --tailwind --app
   cd homecookhub
   npm install next-intl resend @upstash/redis prisma @prisma/client
   ```

3. **测试 Resend + Upstash 集成**：写一个简单的发送验证码 API

4. **创建基础翻译文件**：先做英文和简体中文，后续扩展

---

## 附录：完整环境变量清单

```env
# Database
DATABASE_URL="postgresql://..."

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"

# Resend
RESEND_API_KEY="re_xxx"
RESEND_FROM_EMAIL="noreply@homecookhub.com"

# JWT
JWT_SECRET="your-super-secret-key-min-32-chars"

# GitHub OAuth
GITHUB_ID="xxx"
GITHUB_SECRET="xxx"

# Google OAuth
GOOGLE_CLIENT_ID="xxx"
GOOGLE_CLIENT_SECRET="xxx"

# Site URL
NEXTAUTH_URL="https://homecookhub.com"
NEXT_PUBLIC_SITE_URL="https://homecookhub.com"
```

---

