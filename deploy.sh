#!/bin/bash

echo "Starting Railway deployment..."

# 清理之前的构建
echo "Cleaning previous builds..."
rm -rf .next
rm -rf out

# 安装依赖
echo "Installing dependencies..."
npm install

# 生成Prisma客户端
echo "Generating Prisma client..."
npx prisma generate

# 执行数据库迁移（仅补丁SQL）
echo "Executing database patch..."
npx prisma db execute --file prisma/sql/predeploy_user_columns.sql --schema prisma/schema.prisma

# 构建项目
echo "Building project..."
npm run build

echo "Build completed successfully!"