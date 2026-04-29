# HomeCookHub 详细设计文档 v1.0

## 1. 项目概述

构建一个无广告、社区驱动的中式食谱网站，支持12种语言，服务全球华人及中餐爱好者。

## 2. 数据库设计 (PostgreSQL + Prisma)

### 2.1 数据模型 E-R 图

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │     │   Recipe    │     │   Share     │
│─────────────│     │─────────────│     │─────────────│
│ id          │──┐  │ id          │──┐  │ id          │
│ email       │  │  │ name        │  │  │ userId      │──│
│ name        │  │  │ description │  │  │ imageUrl    │  │
│ avatar      │  │  │ difficulty  │  │  │ caption     │  │
│ provider    │  │  │ providerId  │  │  │ createdAt   │  │
│ providerId  │  │  │ tasteTags   │  │  └─────────────┘  │
│ createdAt   │  │  │ time        │                      │
│ isBanned    │  │  │ ingredients │                      │
└─────────────┘  │  │ steps       │                      │
       │         │  │ videoUrl    │                      │
       │         │  │ isActive    │                      │
       │         │  └─────────────┘                      │
       │         │       │                               │
       │         │       │                               │
       │         │       │                               │
       ▼         │       ▼                               ▼
┌─────────────┐  │  ┌─────────────┐               ┌─────────────┐
│   Comment   │  │  │   Like      │               │   Like      │
│─────────────│  │  │─────────────│               │─────────────│
│ id          │  │  │ id          │               │ id          │
│ userId      │  │  │ userId      │               │ userId      │
│ recipeId    │  │  │ shareId     │               │ shareId     │
│ shareId     │  │  └─────────────┘               └─────────────┘
│ content     │
│ createdAt   │
└─────────────┘
```

### 2.2 Prisma Schema 定义

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

// 用户表
model User {
  id         String    @id @default(cuid())
  email      String?   @unique
  name       String
  avatar     String?
  provider   Provider
  providerId String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  isBanned   Boolean   @default(false)

  // 关联
  shares     Share[]
  comments   Comment[]
  likes      Like[]
}

enum Provider {
  EMAIL
  GITHUB
  GOOGLE
}

// 食谱表
model Recipe {
  id           String    @id @default(cuid())
  name         String
  nameEn       String?   // 英文名（用于搜索）
  description  String
  difficulty   Difficulty
  tasteTags    String[]  // ["酸", "甜", "辣", "咸", "鲜", "麻", "清淡"]
  time         Int       // 分钟
  ingredients  String[]  // 食材列表
  steps        String[]  // 制作步骤
  videoUrl     String?   // 视频链接（可选）
  isActive     Boolean   @default(true)
  providerId   String    // GitHub 仓库中的文件 ID/路径
  syncedAt     DateTime  @default(now())
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  // 关联
  comments     Comment[]
  likes        Like[]

  @@index([tasteTags])
  @@index([difficulty])
  @@index([isActive])
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

// 分享表（用户晒图）
model Share {
  id          String    @id @default(cuid())
  userId      String
  recipeId    String?   // 可选，可能只是晒图不做特定菜谱
  imageUrl    String
  caption     String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // 关联
  user        User      @relation(fields: [userId], references: [id])
  comments    Comment[]
  likes       Like[]
}

// 评论表
model Comment {
  id        String    @id @default(cuid())
  userId    String
  recipeId  String?   // 对食谱的评论
  shareId   String?   // 对分享的评论
  content   String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  // 关联
  user      User      @relation(fields: [userId], references: [id])
  recipe    Recipe?   @relation(fields: [recipeId], references: [id])
  share     Share?    @relation(fields: [shareId], references: [id])

  @@index([recipeId])
  @@index([shareId])
}

// 点赞表
model Like {
  id        String    @id @default(cuid())
  userId    String
  recipeId  String?
  shareId   String?
  createdAt DateTime  @default(now())

  // 关联
  user      User      @relation(fields: [userId], references: [id])
  recipe    Recipe?   @relation(fields: [recipeId], references: [id])
  share     Share?    @relation(fields: [shareId], references: [id])

  @@unique([userId, recipeId])
  @@unique([userId, shareId])

  @@index([userId])
  @@index([recipeId])
  @@index([shareId])
}
```

## 3. API 设计

### 3.1 API 路由结构

```
/api/
├── auth/
│   ├── send-code      POST  - 发送邮箱验证码
│   ├── verify-code    POST  - 验证码登录
│   └── [...nextauth]  - NextAuth OAuth 处理
│
├── recipes/
│   ├── list           GET   - 获取食谱列表（分页、筛选）
│   ├── [id]           GET   - 获取食谱详情
│   └── search         GET   - 搜索菜名/食材
│
├── shares/
│   ├── list           GET   - 获取分享列表
│   ├── [id]           GET   - 获取分享详情
│   ├── create         POST  - 创建分享（需登录）
│   └── delete         DELETE - 删除分享
│
├── comments/
│   ├── create         POST  - 创建评论（需登录）
│   └── delete         DELETE - 删除评论
│
├── likes/
│   ├── toggle         POST  - 点赞/取消点赞（需登录）
│   └── check          GET   - 检查是否已点赞
│
├── admin/
│   ├── recipes/       - 菜谱管理
│   ├── users/         - 用户管理
│   ├── comments/      - 评论管理
│   ├── shares/        - 分享管理
│   └── sync/          - GitHub 数据同步
│
└── i18n/
    └── missing        GET   - 获取缺失的翻译 key
```

### 3.2 关键 API 详细设计

#### 3.2.1 食谱列表 API

**路径**: `GET /api/recipes/list`

**请求参数**:
```typescript
{
  page?: number;           // 页码，默认 1
  limit?: number;          // 每页数量，默认 20
  taste?: string[];        // 口味筛选 ["酸", "辣"]
  difficulty?: Difficulty; // 难度筛选
  ingredients?: string[];  // 食材筛选（包含任一即可）
  search?: string;         // 搜索词（菜名）
  locale?: string;         // 语言
}
```

**响应**:
```typescript
{
  recipes: {
    id: string;
    name: string;
    description: string;
    difficulty: Difficulty;
    tasteTags: string[];
    time: number;
    imageUrl?: string;
  }[];
  total: number;
  page: number;
  limit: number;
}
```

#### 3.2.2 食谱详情 API

**路径**: `GET /api/recipes/[id]`

**响应**:
```typescript
{
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  tasteTags: string[];
  time: number;
  ingredients: string[];
  steps: string[];
  videoUrl?: string;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;      // 登录用户可见
}
```

#### 3.2.3 邮箱验证码登录

**发送验证码**: `POST /api/auth/send-code`
```typescript
// 请求
{ email: string }

// 响应
{ success: boolean, message: string }
```

**验证码登录**: `POST /api/auth/verify-code`
```typescript
// 请求
{ email: string, code: string }

// 响应
{ success: boolean, token?: string, user?: User }
```

#### 3.2.4 GitHub 同步 API

**路径**: `POST /api/admin/sync`

**响应**:
```typescript
{
  success: boolean;
  added: number;      // 新增食谱数
  updated: number;    // 更新食谱数
  errors: string[];  // 错误信息
}
```

## 4. 前端架构设计

### 4.1 目录结构

```
homecookhub/
├── messages/                    # 翻译文件
│   ├── common.json
│   ├── recipe.json
│   ├── auth.json
│   └── ...
│
├── prisma/                      # 数据库
│   ├── schema.prisma
│   └── seed.ts
│
├── public/                      # 静态资源
│
├── app/                         # Next.js App Router
│   ├── [locale]/            # 本地化路由
│   │   ├── layout.tsx
│   │   ├── page.tsx         # 首页
│   │   ├── recipes/         # 食谱页面
│   │   │   ├── page.tsx     # 食谱列表
│   │   │   └── [id]/page.tsx
│   │   ├── share/           # 分享广场
│   │   │   └── page.tsx
│   │   ├── profile/         # 用户中心
│   │   │   └── page.tsx
│   │   └── login/           # 登录页
│   │       └── page.tsx
│   │
│   ├── admin/               # 后台管理（不本地化）
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── recipes/
│   │   ├── users/
│   │   └── sync/
│   │
│   ├── api/                 # API 路由
│   ├── sitemap.ts           # 动态站点地图
│   ├── robots.ts
│   └── global.css
│
├── components/              # React 组件
│   ├── ui/                  # shadcn/ui 基础组件
│   ├── layout/              # 布局组件
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── LanguageSwitcher.tsx
│   ├── recipe/              # 食谱相关
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeDetail.tsx
│   │   ├── TasteFilter.tsx
│   │   └── IngredientInput.tsx
│   ├── auth/                # 认证相关
│   │   ├── LoginForm.tsx
│   │   ├── EmailLoginModal.tsx
│   │   └── ProtectedRoute.tsx
│   └── share/               # 分享相关
│
├── lib/                     # 工具库
│   ├── prisma.ts
│   ├── redis.ts
│   ├── resend.ts
│   └── utils.ts
│
├── hooks/                   # React Hooks
│   ├── useAuth.ts
│   ├── useLike.ts
│   └── useTranslation.ts
│
└── types/                   # TypeScript 类型
    ├── recipe.ts
    ├── user.ts
    └── api.ts
│
├── middleware.ts                # next-intl 中间件
├── i18n.ts                      # 国际化配置
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 4.2 核心组件设计

#### 4.2.1 RecipeCard 组件

```tsx
// components/recipe/RecipeCard.tsx
interface RecipeCardProps {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  tasteTags: string[];
  time: number;
  imageUrl?: string;
}

// 展示食谱卡片，点击跳转详情
```

#### 4.2.2 TasteFilter 组件

```tsx
// components/recipe/TasteFilter.tsx
interface TasteFilterProps {
  selected: string[];
  onChange: (tastes: string[]) => void;
}

// 口味筛选器：酸、甜、辣、咸、鲜、麻、清淡
```

#### 4.2.3 IngredientInput 组件

```tsx
// components/recipe/IngredientInput.tsx
interface IngredientInputProps {
  onSearch: (ingredients: string[]) => void;
}

// 用户输入现有食材，系统推荐可做的食谱
```

## 5. i18n 国际化设计

### 5.1 翻译文件结构

```json
// messages/common.json
{
  "search": "Search",
  "login": "Login",
  "logout": "Logout",
  "save": "Save",
  "cancel": "Cancel",
  "loading": "Loading...",
  "noResults": "No results found"
}

// messages/recipe.json
{
  "title": "Recipes",
  "allRecipes": "All Recipes",
  "difficulty": "Difficulty",
  "easy": "Easy",
  "medium": "Medium",
  "hard": "Hard",
  "time": "Cooking Time",
  "taste": "Taste",
  "ingredients": "Ingredients",
  "steps": "Steps",
  "videoTutorial": "Video Tutorial",
  "viewDetails": "View Details",
  "tastes": {
    "sour": "Sour",
    "sweet": "Sweet",
    "spicy": "Spicy",
    "salty": "Salty",
    "umami": "Umami",
    "numbing": "Numbing",
    "mild": "Mild"
  }
}

// messages/auth.json
{
  "login": "Login",
  "logout": "Logout",
  "emailLogin": "Email Login",
  "githubLogin": "GitHub Login",
  "gmailLogin": "Gmail Login",
  "sendCode": "Send Code",
  "enterCode": "Enter Verification Code",
  "codeSent": "Verification code sent to your email",
  "codeExpired": "Verification code expired",
  "codeInvalid": "Invalid verification code"
}

// messages/share.json
{
  "title": "Community Shares",
  "upload": "Share Your Dish",
  "caption": "Caption",
  "myShares": "My Shares",
  "noShares": "No shares yet"
}
```

### 5.2 口味标签翻译映射

```typescript
// lib/constants.ts
export const TASTE_TAGS = {
  'zh-CN': { sour: '酸', sweet: '甜', spicy: '辣', salty: '咸', umami: '鲜', numbing: '麻', mild: '清淡' },
  'zh-TW': { sour: '酸', sweet: '甜', spicy: '辣', salty: '鹹', umami: '鮮', numbing: '麻', mild: '清淡' },
  'en':    { sour: 'Sour', sweet: 'Sweet', spicy: 'Spicy', salty: 'Salty', umami: 'Umami', numbing: 'Numbing', mild: 'Mild' },
  'ja':    { sour: '酸味', sweet: '甘味', spicy: '辛味', salty: '塩味', umami: '旨味', numbing: '痺れ', mild: '薄味' },
  'ko':    { sour: '신맛', sweet: '단맛', spicy: '매운맛', salty: '짠맛', umami: '감칠맛', numbing: '마비', mild: '담백' },
  // ... 其他语言
} as const;
```

## 6. SEO 设计

### 6.1 Metadata 配置

```typescript
// app/[locale]/layout.tsx
export async function generateMetadata({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: {
      template: `%s | ${t('siteTitle')}`,
      default: t('siteTitle'),
    },
    description: t('siteDescription'),
    openGraph: {
      title: t('siteTitle'),
      description: t('siteDescription'),
      url: `https://homecookhub.com/${locale}`,
      siteName: t('siteTitle'),
      images: [{ url: '/og-image.png' }],
      locale: locale,
    },
    alternates: {
      canonical: `https://homecookhub.com/${locale}`,
      languages: {
        'en': 'https://homecookhub.com/en',
        'zh-CN': 'https://homecookhub.com/zh-CN',
        'zh-TW': 'https://homecookhub.com/zh-TW',
        'ja': 'https://homecookhub.com/ja',
        'ko': 'https://homecookhub.com/ko',
        'es': 'https://homecookhub.com/es',
        'fr': 'https://homecookhub.com/fr',
        'de': 'https://homecookhub.com/de',
        'it': 'https://homecookhub.com/it',
        'pt': 'https://homecookhub.com/pt',
        'ru': 'https://homecookhub.com/ru',
        'vi': 'https://homecookhub.com/vi',
        'x-default': 'https://homecookhub.com/en',
      },
    },
  };
}
```

### 6.2 动态站点地图

```typescript
// app/sitemap.ts
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://homecookhub.com';

export default async function sitemap() {
  const staticPages = ['', '/recipes', '/share'];
  const locales = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'vi'];

  const entries = [];

  // 静态页面
  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: page === '' ? 1.0 : 0.8,
      });
    }
  }

  // 食谱详情页（需要从数据库获取）
  const recipes = await prisma.recipe.findMany({
    select: { id: true, updatedAt: true },
  });

  for (const recipe of recipes) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/recipes/${recipe.id}`,
        lastModified: recipe.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      });
    }
  }

  return entries;
}
```

## 7. 认证系统设计

### 7.1 NextAuth 配置

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // 创建或更新用户
      return true;
    },
    async session({ session, token }) {
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
```

### 7.2 邮箱验证码流程

```typescript
// lib/email.ts
import { Resend } from 'resend';
import { redis } from './redis';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationCode(email: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // 存储到 Redis，10 分钟过期
  await redis.set(`code:${email}`, code, { ex: 600 });

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: 'HomeCookHub 验证码',
    html: `<p>您的验证码是：<strong>${code}</strong></p><p>10分钟内有效。</p>`,
  });
}

export async function verifyCode(email: string, code: string) {
  const storedCode = await redis.get(`code:${email}`);

  if (storedCode === code) {
    await redis.del(`code:${email}`);
    return true;
  }

  return false;
}
```

## 8. GitHub 同步设计

### 8.1 同步脚本

```typescript
// lib/github-sync.ts
import Octokit from 'octokit';
import prisma from './prisma';

export async function syncRecipesFromGitHub() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const owner = 'langaijun';
  const repo = 'HowToCook';

  // 获取食谱目录
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: 'recipes',
  });

  let added = 0;
  let updated = 0;
  const errors: string[] = [];

  // 遍历食谱文件
  for (const item of (data as any[])) {
    try {
      const fileData = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: item.path,
      });

      const content = Buffer.from((fileData.data as any).content, 'base64').toString();

      // 解析食谱数据（根据实际文件格式）
      const recipe = parseRecipe(content, item.path);

      // 检查是否已存在
      const existing = await prisma.recipe.findUnique({
        where: { providerId: item.path },
      });

      if (existing) {
        await prisma.recipe.update({
          where: { id: existing.id },
          data: { ...recipe, syncedAt: new Date() },
        });
        updated++;
      } else {
        await prisma.recipe.create({ data: recipe });
        added++;
      }
    } catch (error) {
      errors.push(`${item.path}: ${error}`);
    }
  }

  return { added, updated, errors };
}
```

## 9. 环境变量

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/homecookhub"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"

# Resend
RESEND_API_KEY="re_xxx"
RESEND_FROM_EMAIL="noreply@homecookhub.com"

# NextAuth
NEXTAUTH_URL="https://homecookhub.com"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"

# GitHub OAuth
GITHUB_ID="xxx"
GITHUB_SECRET="xxx"

# Google OAuth
GOOGLE_CLIENT_ID="xxx"
GOOGLE_CLIENT_SECRET="xxx"

# Site URL
NEXT_PUBLIC_SITE_URL="https://homecookhub.com"

# Vercel Blob (可选)
BLOB_READ_WRITE_TOKEN="vercel_blob_xxx"
```

## 10. 开发阶段实施计划

### Phase 1: 项目初始化 (Week 1)
1. 创建 Next.js 项目 + TypeScript + Tailwind
2. 安装依赖：next-intl, prisma, resend, @upstash/redis
3. 配置 Prisma + 创建数据库 schema
4. 初始化 git + .env.local 模板
5. 安装 shadcn/ui 基础组件

### Phase 2: 基础浏览功能 (Week 2)
1. 食谱列表页面 + 分页
2. 食谱详情页面
3. 口味筛选组件
4. 食材输入 + 反向推荐

### Phase 3: 国际化架构 (Week 3)
1. 配置 next-intl
2. 创建翻译文件结构
3. 实现 middleware 路由
4. 语言切换器组件
5. 初始化核心翻译（中英）

### Phase 4: SEO 优化 (Week 3-4)
1. 配置 metadata API
2. 实现动态 sitemap
3. hreflang 标签
4. robots.txt

### Phase 5: 认证系统 (Week 4)
1. NextAuth.js 配置（GitHub + Google）
2. 邮箱验证码登录（Resend + Redis）
3. 登录页面 + 组件
4. ProtectedRoute HOC

### Phase 6: 社交功能 (Week 5)
1. 用户分享功能（上传图片）
2. 分享列表页面
3. 评论功能
4. 点赞功能

### Phase 7: 后台管理 (Week 6)
1. 后台布局 + 权限控制
2. 菜谱 CRUD（含视频链接编辑）
3. 用户管理
4. 评论管理
5. GitHub 同步功能

### Phase 8: 部署 + 测试 (Week 7)
1. Vercel 部署配置
2. 环境变量配置
3. 多语言测试
4. 性能测试
5. SEO 验证

## 11. 验证清单

### 功能验证
- [ ] 食谱列表展示正确
- [ ] 口味筛选工作正常
- [ ] 食材反向推荐功能正常
- [ ] 食谱详情完整展示（含视频链接）
- [ ] 12种语言切换正常
- [ ] 三种登录方式都可用
- [ ] 用户分享功能正常
- [ ] 评论/点赞功能正常
- [ ] 后台管理权限正确
- [ ] GitHub 同步功能正常

### SEO 验证
- [ ] 多语言 URL 正确
- [ ] hreflang 标签存在
- [ ] sitemap 生成正确
- [ ] robots.txt 可访问
- [ ] OpenGraph 标签完整
- [ ] 页面标题/描述正确

### 性能验证
- [ ] 首页加载 < 2s
- [ ] API P95 < 200ms
- [ ] 图片懒加载正常
- [ ] 缓存策略有效

### 安全验证
- [ ] 验证码 10 分钟过期
- [ ] 防止暴力破解
- [ ] API 权限控制
- [ ] XSS 防护
