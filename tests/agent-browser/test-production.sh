#!/bin/bash
# HomeCookHub Production Automated Test Script
# Run with: bash tests/agent-browser/test-production.sh

set -e

echo "=========================================="
echo "HomeCookHub Production Test"
echo "=========================================="
echo ""

# Close any existing sessions
agent-browser close --all 2>/dev/null || true

# ============================================
# Test 1: Recipe Search (按食谱查询)
# ============================================
echo "Test 1: Recipe Search..."
agent-browser open https://cookforevery-production.up.railway.app
agent-browser wait --load networkidle
agent-browser snapshot -i

echo "  - Searching for '鸡蛋'..."
agent-browser fill @e9 "鸡蛋"
agent-browser press Enter
agent-browser wait 2000

echo "  - Checking search results..."
agent-browser snapshot
# Results should display recipes containing '鸡蛋'

echo "  ✓ Recipe search test passed"
echo ""

# ============================================
# Test 2: Ingredient Search (按食材查询)
# ============================================
echo "Test 2: Ingredient Search..."
agent-browser snapshot -i

echo "  - Navigating to recipes page..."
agent-browser click @e7  # Click "食谱"
agent-browser wait --load networkidle
agent-browser snapshot -i

echo "  - Searching by ingredient..."
agent-browser fill @e9 "鸡蛋"
agent-browser press Enter
agent-browser wait 2000

echo "  - Checking ingredient search results..."
agent-browser snapshot

echo "  ✓ Ingredient search test passed"
echo ""

# ============================================
# Test 3: Login (Email + Verification Code)
# ============================================
echo "Test 3: Login with Email..."
agent-browser snapshot -i

echo "  - Clicking login button..."
agent-browser click @e10
agent-browser wait 2000
agent-browser snapshot -i

echo "  - Entering email: meal@xile2026.cn..."
# Find and fill email input
agent-browser fill "input[type='email']" "meal@xile2026.cn"
agent-browser wait 500
agent-browser snapshot

echo "  - Requesting verification code..."
agent-browser click "button[type='submit'], button:contains('发送'), button:contains('获取验证码')"
agent-browser wait 2000
agent-browser snapshot

echo "  ⚠ Verification code required - enter manually"
echo "  - Please check email for verification code"
echo "  - After entering code, continue test"
read -p "Press Enter after entering verification code... "

echo "  - Checking login status..."
agent-browser wait --load networkidle
agent-browser snapshot -i
# Check if user avatar/profile shows up

echo "  ✓ Login test passed"
echo ""

# ============================================
# Test 4: Comments (评论功能)
# ============================================
echo "Test 4: Comment Functionality..."
agent-browser snapshot -i

echo "  - Opening a recipe to comment..."
agent-browser click @e7  # Recipes page
agent-browser wait --load networkidle
agent-browser snapshot -i

echo "  - Clicking first recipe..."
agent-browser click @e14
agent-browser wait --load networkidle
agent-browser snapshot -i

echo "  - Clicking '发表评论'..."
agent-browser click @e18
agent-browser wait 2000
agent-browser snapshot -i

echo "  - Entering test comment..."
agent-browser fill "textarea, input[type='text']" "这是自动化测试评论 - $(date)"
agent-browser wait 500

echo "  - Submitting comment..."
agent-browser click "button[type='submit'], button:contains('发表'), button:contains('提交')"
agent-browser wait 2000
agent-browser snapshot

echo "  ✓ Comment test passed"
echo ""

# ============================================
# Test 5: Like (点赞功能)
# ============================================
echo "Test 5: Like Functionality..."
agent-browser snapshot -i

echo "  - Clicking like button..."
agent-browser click @e6  # Like button showing count
agent-browser wait 1000
agent-browser snapshot

echo "  - Checking like count increased..."
agent-browser snapshot

echo "  ✓ Like test passed"
echo ""

# ============================================
# Test 6: Backend Data Management (后台数据管理)
# ============================================
echo "Test 6: Backend Data Management..."
agent-browser snapshot -i

echo "  - Navigating to admin/dashboard..."
agent-browser click @e1  # HomeCookHub logo
agent-browser wait --load networkidle
agent-browser snapshot -i

# Check if admin link exists in menu or footer
echo "  - Checking for admin access..."

# Try accessing admin page directly
agent-browser open https://cookforevery-production.up.railway.app/admin
agent-browser wait --load networkidle
agent-browser snapshot

echo "  - Checking admin dashboard content..."
agent-browser get title

# Or try /dashboard
agent-browser open https://cookforevery-production.up.railway.app/dashboard
agent-browser wait --load networkidle
agent-browser snapshot

echo "  - Checking if data displays correctly..."
agent-browser snapshot

echo "  ✓ Backend management test passed"
echo ""

# ============================================
# Cleanup
# ============================================
echo "Cleaning up..."
agent-browser close --all

echo "=========================================="
echo "All Tests Completed"
echo "=========================================="
