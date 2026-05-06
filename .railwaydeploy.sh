#!/bin/bash

echo "=== Railway Deployment Script ==="

# 1. Install dependencies
echo "1. Installing npm dependencies..."
npm install

# 2. Generate Prisma client
echo "2. Generating Prisma client..."
npx prisma generate

# 3. Execute database patch
echo "3. Executing database patch..."
npx prisma db execute --file prisma/sql/predeploy_user_columns.sql --schema prisma/schema.prisma

# 4. Build Next.js app
echo "4. Building Next.js app..."
npm run build

echo "=== Build completed successfully! ==="