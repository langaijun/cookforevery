-- 兼容已由 db push / 手工建表的生产库：仅补上缺失列，不删不改已有数据。
-- 解决 OAuth 会话中 prisma.user.findUnique 因缺列报错的问题。

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isBanned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN NOT NULL DEFAULT false;
