# 用户个人中心开发任务

## 概述
创建用户个人中心页面，展示用户信息、我的分享、我的收藏列表。

**优先级**: P1
**预计工作量**: 3-4 小时
**负责人**: _____________

---

## 任务分解

### Phase 1: 数据模型扩展（30 分钟）

#### 1.1 添加 Favorite（收藏）模型到 Prisma Schema

**文件**: `prisma/schema.prisma`

在 Like 模型后添加：

```prisma
// 收藏表
model Favorite {
  id        String    @id @default(cuid())
  userId    String
  recipeId  String
  createdAt DateTime  @default(now())

  // 关联
  user      User      @relation(fields: [userId], references: [id])
  recipe    Recipe?   @relation(fields: [recipeId], references: [id])

  @@unique([userId, recipeId])
  @@index([userId])
  @@index([recipeId])
}
```

#### 1.2 更新 User 模型关联

```prisma
model User {
  // ... 现有字段
  favorites Favorite[]  // 添加这行
  // shares, comments, likes 保持不变
}
```

#### 1.3 更新 Recipe 模型关联

```prisma
model Recipe {
  // ... 现有字段
  favorites Favorite[]  // 添加这行
  // comments, likes 保持不变
}
```

#### 1.4 运行数据库迁移

```bash
npx prisma migrate dev --name add_favorite_model
```

---

### Phase 2: API 路由（1 小时）

#### 2.1 创建 GET /api/profile/me

**文件**: `app/api/profile/me/route.ts`

获取当前用户完整信息：

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret'
)

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        provider: true,
        createdAt: true,
        _count: {
          select: {
            shares: true,
            comments: true,
            likes: true,
            favorites: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 })
  }
}
```

#### 2.2 创建 GET /api/profile/shares

**文件**: `app/api/profile/shares/route.ts`

获取用户的分享列表（分页）：

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret'
)

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const [shares, total] = await Promise.all([
      prisma.share.findMany({
        where: { userId },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          _count: { select: { comments: true, likes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.share.count({ where: { userId } }),
    ])

    return NextResponse.json({
      shares,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('获取分享列表失败:', error)
    return NextResponse.json({ error: '获取分享列表失败' }, { status: 500 })
  }
}
```

#### 2.3 创建 GET /api/profile/favorites

**文件**: `app/api/profile/favorites/route.ts`

获取用户的收藏列表（分页）：

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret'
)

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        include: {
          recipe: {
            include: {
              _count: { select: { likes: true, comments: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.favorite.count({ where: { userId } }),
    ])

    return NextResponse.json({
      favorites,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    return NextResponse.json({ error: '获取收藏列表失败' }, { status: 500 })
  }
}
```

#### 2.4 创建 POST /api/profile/favorites

**文件**: `app/api/profile/favorites/route.ts`（在同一个文件中添加 POST）

添加/取消收藏：

```typescript
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    const { recipeId } = await request.json()

    if (!recipeId) {
      return NextResponse.json({ error: '食谱ID不能为空' }, { status: 400 })
    }

    // 检查是否已收藏
    const existing = await prisma.favorite.findUnique({
      where: { userId_recipeId: { userId, recipeId } },
    })

    if (existing) {
      // 取消收藏
      await prisma.favorite.delete({
        where: { userId_recipeId: { userId, recipeId } },
      })
      return NextResponse.json({ success: true, favorited: false })
    } else {
      // 添加收藏
      await prisma.favorite.create({
        data: { userId, recipeId },
      })
      return NextResponse.json({ success: true, favorited: true })
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    return NextResponse.json({ error: '收藏操作失败' }, { status: 500 })
  }
}
```

---

### Phase 3: 页面和组件（1.5 小时）

#### 3.1 创建 /profile 页面

**文件**: `app/[locale]/profile/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Tab = 'info' | 'shares' | 'favorites'

export default function ProfilePage() {
  const t = useTranslations()
  const { status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('info')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          {/* 标签导航 */}
          <div className="flex gap-4 border-b mb-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-2 px-4 text-sm font-medium transition-colors ${
                activeTab === 'info'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('Profile.info')}
            </button>
            <button
              onClick={() => setActiveTab('shares')}
              className={`pb-2 px-4 text-sm font-medium transition-colors ${
                activeTab === 'shares'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('Profile.myShares')}
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`pb-2 px-4 text-sm font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('Profile.myFavorites')}
            </button>
          </div>

          {/* 内容区域 */}
          {activeTab === 'info' && <UserInfo />}
          {activeTab === 'shares' && <MyShares />}
          {activeTab === 'favorites' && <MyFavorites />}
        </div>
      </main>

      <Footer />
    </div>
  )
}
```

#### 3.2 创建 UserInfo 组件

**文件**: `components/profile/UserInfo.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

export function UserInfo() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/profile/me')
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  if (loading) {
    return <div>加载中...</div>
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-center gap-6 mb-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
          <AvatarFallback>
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <h2 className="text-2xl font-bold">{user?.name}</h2>
          <p className="text-muted-foreground">{user?.email}</p>
          <p className="text-sm text-muted-foreground">
            加入时间: {new Date(user?.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold">{user?._count?.shares || 0}</div>
          <div className="text-sm text-muted-foreground">分享</div>
        </div>
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold">{user?._count?.comments || 0}</div>
          <div className="text-sm text-muted-foreground">评论</div>
        </div>
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold">{user?._count?.likes || 0}</div>
          <div className="text-sm text-muted-foreground">点赞</div>
        </div>
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold">{user?._count?.favorites || 0}</div>
          <div className="text-sm text-muted-foreground">收藏</div>
        </div>
      </div>

      <Button onClick={handleLogout} variant="outline">
        退出登录
      </Button>
    </div>
  )
}
```

#### 3.3 创建 MyShares 组件

**文件**: `components/profile/MyShares.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function MyShares() {
  const t = useTranslations()
  const [shares, setShares] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    async function fetchShares() {
      setLoading(true)
      try {
        const res = await fetch(`/api/profile/shares?page=${page}`)
        const data = await res.json()
        if (data.shares) {
          setShares(data.shares)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error('获取分享列表失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchShares()
  }, [page])

  if (loading) {
    return <div>加载中...</div>
  }

  return (
    <div>
      {shares.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>暂无分享</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shares.map((share) => (
            <div key={share.id} className="border rounded-lg p-4">
              {share.imageUrl && (
                <img
                  src={share.imageUrl}
                  alt={share.caption}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
              <p className="mb-2">{share.caption}</p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>💬 {share._count?.comments || 0}</span>
                <span>👍 {share._count?.likes || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-4 py-2 rounded-md ${
                p === page
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

#### 3.4 创建 MyFavorites 组件

**文件**: `components/profile/MyFavorites.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function MyFavorites() {
  const t = useTranslations()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    async function fetchFavorites() {
      setLoading(true)
      try {
        const res = await fetch(`/api/profile/favorites?page=${page}`)
        const data = await res.json()
        if (data.favorites) {
          setFavorites(data.favorites)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error('获取收藏列表失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [page])

  if (loading) {
    return <div>加载中...</div>
  }

  return (
    <div>
      {favorites.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>暂无收藏</p>
          <Link href="/recipes" className="text-primary hover:underline">
            去浏览食谱
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => (
            <Link
              key={fav.id}
              href={`/recipes/${fav.recipeId}`}
              className="border rounded-lg p-4 hover:border-primary transition-colors"
            >
              <h3 className="font-semibold mb-2">{fav.recipe?.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {fav.recipe?.description}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-4 py-2 rounded-md ${
                p === page
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

### Phase 4: 翻译文件（30 分钟）

#### 4.1 更新 messages/en.json

```json
{
  "Profile": {
    "info": "个人信息",
    "myShares": "我的分享",
    "myFavorites": "我的收藏",
    "noShares": "暂无分享",
    "noFavorites": "暂无收藏",
    "browseRecipes": "去浏览食谱",
    "joinedAt": "加入时间",
    "shares": "分享",
    "comments": "评论",
    "likes": "点赞",
    "favorites": "收藏",
    "logout": "退出登录"
  }
}
```

#### 4.2 更新 messages/zh-CN.json

```json
{
  "Profile": {
    "info": "个人信息",
    "myShares": "我的分享",
    "myFavorites": "我的收藏",
    "noShares": "暂无分享",
    "noFavorites": "暂无收藏",
    "browseRecipes": "去浏览食谱",
    "joinedAt": "加入时间",
    "shares": "分享",
    "comments": "评论",
    "likes": "点赞",
    "favorites": "收藏",
    "logout": "退出登录"
  }
}
```

---

## 验收标准

- [ ] 用户信息正确显示（头像、名称、邮箱、加入时间）
- [ ] 统计数据正确（分享数、评论数、点赞数、收藏数）
- [ ] 我的分享列表正常显示（图片、文案、评论/点赞数）
- [ ] 我的收藏列表正常显示（食谱名称、描述）
- [ ] 分页功能正常工作
- [ ] 未登录用户跳转到登录页
- [ ] TypeScript 编译无错误
- [ ] 构建成功

---

## 注意事项

1. **Prisma 迁移**: 运行 `npx prisma migrate dev` 后需要在生产环境运行 `npx prisma migrate deploy`
2. **Cookie 认证**: 使用 `auth-token` cookie 进行用户身份验证
3. **NextAuth Session**: 邮箱验证码登录使用的是自定义 JWT，与 OAuth 登录的 session 是分开的
4. **图片处理**: 分享图片存储方案待定（可以使用 Vercel Blob 或 Cloudflare R2）

---

## 相关文件

- Prisma Schema: `prisma/schema.prisma`
- API 目录: `app/api/profile/`
- 页面: `app/[locale]/profile/page.tsx`
- 组件: `components/profile/`
- 翻译: `messages/en.json`, `messages/zh-CN.json`
