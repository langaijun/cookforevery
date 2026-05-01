# 环境变量清单（HomeCookHub）

本文档依据仓库内 `process.env` / Prisma / Redis / NextAuth / Resend 的实际引用整理。**部署或本地完整跑通应用前请逐项配置。**

---

## 一、必填（不满足则无法正常启动或核心功能不可用）

| 变量名 | 说明 |
|--------|------|
| **`DATABASE_URL`** | PostgreSQL 连接串，与 `prisma/schema.prisma` 中 `datasource db` 一致。Prisma 与运行时数据库访问依赖此项。 |
| **`NEXTAUTH_SECRET`** | NextAuth 会话与 JWT（邮箱验证码登录等）签名密钥。代码内有开发用 fallback，**生产环境必须设置强随机字符串**，勿提交仓库。 |

### Redis（二选一，必须配置其中一套）

应用在 `lib/redis.ts` 初始化时会校验：**至少要有一种 Redis 配置**，否则进程启动即抛出错误。

| 方案 | 变量名 | 说明 |
|------|--------|------|
| **Upstash REST** | **`UPSTASH_REDIS_REST_URL`** | Upstash Redis REST URL |
| | **`UPSTASH_REDIS_REST_TOKEN`** | Upstash REST Token |
| **传统 Redis** | **`REDIS_URL`** | 标准 Redis 连接 URL（如 `redis://...`），使用 ioredis |

验证码读写（`lib/resend.ts` → `codeCache`）依赖 Redis；未配置 Redis 时应用无法启动。

---

## 二、强烈建议（生产 / OAuth / 站点 URL）

| 变量名 | 说明 |
|--------|------|
| **`NEXTAUTH_URL`** | 站点对外的完整 Origin，例如 `https://your-domain.com`。OAuth 回调与 NextAuth 绝对 URL 在生产环境通常需要此项。（NextAuth v4 惯例变量名） |
| **`NEXT_PUBLIC_SITE_URL`** | 前端可见的站点根 URL；服务端 `fetch` 自身 API、sitemap、robots、`metadataBase`/canonical 等会用到。未设置时代码内有 localhost 或占位默认值，**生产建议设为真实域名**，避免 SEO 与自建请求走错主机。 |

---

## 三、按功能可选（不配则对应能力不可用或为默认行为）

### 邮箱验证码（Resend）

| 变量名 | 说明 |
|--------|------|
| **`RESEND_API_KEY`** | Resend API Key；未配置时发信会失败。 |
| **`RESEND_FROM_EMAIL`** | 发件人地址；未设置时代码内有默认占位域名（需在 Resend 中验证域名后才能稳定投递）。 |

### OAuth 登录（GitHub）

| 变量名 | 说明 |
|--------|------|
| **`GITHUB_ID`** | GitHub OAuth App Client ID |
| **`GITHUB_SECRET`** | GitHub OAuth App Client Secret |

### GitHub 同步（食谱数据源）

| 变量名 | 说明 |
|--------|------|
| **`GITHUB_TOKEN`** | GitHub Personal Access Token（推荐），用于拉取食谱数据，提高速率限制 |
| **`GITHUB_REPO_OWNER`** | GitHub 仓库所有者（默认：`Anduin2017`）|
| **`GITHUB_REPO_NAME`** | GitHub 仓库名称（默认：`HowToCook`）|

### OAuth 登录（Google）

| 变量名 | 说明 |
|--------|------|
| **`GOOGLE_CLIENT_ID`** | Google OAuth 客户端 ID |
| **`GOOGLE_CLIENT_SECRET`** | Google OAuth 客户端密钥 |

### 食谱图片（Unsplash）

| 变量名 | 说明 |
|--------|------|
| **`UNSPLASH_ACCESS_KEY`** | Unsplash API Access Key；未配置时使用默认食物图片。 |

---

---

## 四、模板示例（复制到 `.env.local` 后填入真实值）

```bash
# ========== 必填 ==========
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

NEXTAUTH_SECRET="请使用 openssl rand -base64 32 等方式生成的随机串"

# Redis：任选其一整套
# 方案 A（Upstash）
UPSTASH_REDIS_REST_URL="https://xxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxxxxxxx"

# 方案 B（自建 / Railway Redis）
# REDIS_URL="redis://default:PASSWORD@HOST:6379"

# ========== 强烈建议（生产） ==========
NEXTAUTH_URL="https://你的域名"
NEXT_PUBLIC_SITE_URL="https://你的域名"

# ========== 邮箱验证码 ==========
RESEND_API_KEY="re_xxxx"
RESEND_FROM_EMAIL="HomeCookHub <noreply@你的已验证域名>"

# ========== OAuth（按需） ==========
GITHUB_ID=""
GITHUB_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ========== 食谱图片（按需） ==========
UNSPLASH_ACCESS_KEY=""
```

---

## 五、说明

- **`NODE_ENV`**：由 Next.js / 宿主自动设置，一般无需手写。
- 修改 `.env.local` 后需重启开发服务器；云平台需在控制台保存变量并重新部署。
- 若曾在仓库中提交过数据库或 Redis 明文密钥，请在服务商控制台**轮换密码**并更新环境变量。
