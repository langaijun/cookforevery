-- Railway pre-deploy：仅补 User 风控字段，不触碰 Recipe 等表的其它差异（避免 db push 触发 data-loss）
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isBanned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN NOT NULL DEFAULT false;
