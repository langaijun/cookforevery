# User Profile Task Completion

**个人中心 · 任务完成说明**

对应需求文档：`docs/USER_PROFILE_TASK.md`  
完成范围：数据模型、Profile API、个人中心页面与组件、国际化、顶部导航与双登录态打通。

---

## 一、已完成项

### 1. 数据模型（Phase 1）

- 在 `prisma/schema.prisma` 中新增 **`Favorite`**（收藏）模型：
  - 字段：`userId`、`recipeId`、`createdAt`
  - 约束：`@@unique([userId, recipeId])`，并对 `userId` / `recipeId` 建索引
  - 关联：`User`、`Recipe`；删除用户或食谱时级联删除收藏（`onDelete: Cascade`）
- `User`、`Recipe` 上已增加 `favorites Favorite[]` 反向关联。

**上线前须执行迁移**（本地 / 生产各环境一次）：

```bash
npx prisma migrate dev --name add_favorite_model   # 本地开发
npx prisma migrate deploy                          # 生产
```

### 2. API（Phase 2）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/profile/me` | 当前用户资料 + `_count`（分享 / 评论 / 点赞 / 收藏） |
| GET | `/api/profile/shares` | 我的分享，支持 `page`、`limit` |
| GET | `/api/profile/favorites` | 我的收藏（含食谱摘要），支持分页 |
| POST | `/api/profile/favorites` | 切换收藏：`{ "recipeId" }`，已存在则取消 |

**身份校验**（与任务文档的差异说明，属有意设计）：

- 统一通过 `lib/profile-auth.ts` 的 **`getAuthenticatedUserId`**：
  - 优先 **NextAuth 会话**（OAuth 登录）
  - 若无会话，再读 **`auth-token` Cookie**（邮箱验证码登录的 JWT）
- 这样 GitHub / Google 用户无需额外 Cookie 即可访问 Profile API。

### 3. 页面与组件（Phase 3）

- **`app/[locale]/profile/page.tsx`**：客户端页面； tabs — 个人信息 / 我的分享 / 我的收藏；未登录（既无 session 也无 JWT）跳转 `/login`。
- **`components/profile/UserInfo.tsx`**：头像、邮箱、加入时间、四项统计、退出登录（先 `POST /api/auth/logout`，再 `signOut`）。
- **`components/profile/MyShares.tsx`**：分享列表 + 分页。
- **`components/profile/MyFavorites.tsx`**：收藏食谱卡片（使用 `@/i18n` 的 `Link`）+ 分页。

### 4. 国际化（Phase 4）

- `messages/zh-CN.json`、`messages/en.json` 中增加 **`Profile`** 命名空间（标签、空状态、统计文案、`loadFailed`、`page` 等）。
- `zh-CN` 中重复的 **Header** 已合并为一条；**英文**侧补全 **Footer** / **API**，避免切英文时缺 key。

### 5. 顶部导航

- **`components/layout/Header.tsx`**：OAuth 与邮箱 JWT 用户均能显示头像菜单；**个人中心**走 `router.push('/profile')`，文案用 `Header.profile`；退出时清除 JWT 并 `signOut`。

---

## 二、待你本地 / 产品验收时自测

- [ ] 执行迁移后，`Favorite` 表存在且应用无 Prisma 报错。
- [ ] OAuth 登录：打开 `/profile`，信息与统计正确。
- [ ] 邮箱验证码登录：同上，且 Header 能显示用户入口。
- [ ] 分享、收藏列表分页与空态文案正常（中 / 英文各扫一遍）。
- [ ] `POST /api/profile/favorites` 可用（可用 curl 或后续在详情页接按钮）。

---

## 三、未包含在本次「个人中心」文档内、可选后续

- 食谱**详情页上的「收藏」按钮**（需调用 `POST /api/profile/favorites` 并处理已收藏态）。
- 分享**图片存储**方案（任务文档备注：Blob / R2 等）。

---

## 四、涉及文件清单（便于 Code Review）

| 类型 | 路径 |
|------|------|
| Schema | `prisma/schema.prisma` |
| 认证辅助 | `lib/profile-auth.ts` |
| API | `app/api/profile/me/route.ts`、`shares/route.ts`、`favorites/route.ts` |
| 页面 | `app/[locale]/profile/page.tsx` |
| 组件 | `components/profile/UserInfo.tsx`、`MyShares.tsx`、`MyFavorites.tsx` |
| 布局 | `components/layout/Header.tsx` |
| 文案 | `messages/zh-CN.json`、`messages/en.json` |

---

## 五、构建说明

本地执行 `npm run build` 已通过 TypeScript 与页面编译。若 `.env` 使用 Railway 内网 Redis地址，构建阶段可能出现 `ioredis` 解析失败日志，属环境限制，与个人中心代码无直接关系；开发时可改用可访问的 Redis 或仅在使用验证码时再连缓存。

---

*文档生成对应功能落地版本；若迁移或环境变量有变更，请以当前仓库与环境为准。*
