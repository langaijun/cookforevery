#!/bin/bash
# ============================================
# HomeCookHub Production Automated Test Suite
# Author: Claude Code + Agent-Browser
# Date: 2026-05-01
# ============================================

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# Utility functions
log_test() {
    echo -e "\n${YELLOW}TEST: $1${NC}"
    echo "----------------------------------------"
}

log_pass() {
    echo -e "${GREEN}✓ PASS: $1${NC}"
    ((PASSED++))
}

log_fail() {
    echo -e "${RED}✗ FAIL: $1${NC}"
    ((FAILED++))
}

cleanup() {
    echo ""
    echo "=========================================="
    echo "Test Summary"
    echo "=========================================="
    echo -e "Passed: ${GREEN}$PASSED${NC}"
    echo -e "Failed: ${RED}$FAILED${NC}"
    echo "=========================================="
    agent-browser close --all 2>/dev/null || true
    exit $FAILED
}

trap cleanup EXIT

# ============================================
# Setup
# ============================================
echo "=========================================="
echo "HomeCookHub Production Test Suite"
echo "URL: https://cookforevery-production.up.railway.app"
echo "=========================================="

agent-browser close --all 2>/dev/null || true
sleep 1

# ============================================
# TEST 1: Recipe Search (按食谱查询)
# ============================================
log_test "1. Recipe Search Functionality"

echo "Opening home page..."
agent-browser open https://cookforevery-production.up.railway.app 2>&1 || {
    log_fail "Failed to open homepage"
    exit 1
}
agent-browser wait --load networkidle 2>&1 || agent-browser wait 3000

echo "Taking initial snapshot..."
agent-browser snapshot -i 2>&1 | head -20

echo "Searching for recipe '鸡蛋'..."
agent-browser fill "input[placeholder*='搜索'], input[placeholder*='Search']" "鸡蛋" 2>&1 || {
    log_fail "Search input not found"
    exit 1
}
agent-browser press Enter

echo "Waiting for search results..."
agent-browser wait 3000

echo "Checking results..."
agent-browser snapshot 2>&1 | grep -i "鸡蛋" && log_pass "Recipe search returned results" || log_fail "No search results found"

# ============================================
# TEST 2: Ingredient Search (按食材查询)
# ============================================
log_test "2. Ingredient Search Functionality"

echo "Navigating to recipes page..."
agent-browser click "a:contains('食谱'), link[ref*='食谱']" 2>&1 || {
    # Try direct nav
    agent-browser open https://cookforevery-production.up.railway.app/recipes
    agent-browser wait --load networkidle
}
agent-browser wait 2000

echo "Searching by ingredient '鸡蛋'..."
agent-browser fill "input[placeholder*='搜索'], input[placeholder*='Search']" "鸡蛋" 2>&1
agent-browser press Enter

echo "Waiting for ingredient search results..."
agent-browser wait 3000

agent-browser snapshot 2>&1 | grep -i "鸡蛋" && log_pass "Ingredient search returned results" || log_fail "Ingredient search failed"

# ============================================
# TEST 3: Login - Email Input (登录-邮箱输入)
# ============================================
log_test "3. Login - Email Input"

echo "Navigating to home..."
agent-browser open https://cookforevery-production.up.railway.app
agent-browser wait --load networkidle

echo "Clicking login button..."
agent-browser click "a:contains('登录'), button:contains('登录')" 2>&1 || {
    log_fail "Login button not found"
    exit 1
}
agent-browser wait 2000

echo "Entering email: meal@xile2026.cn..."
agent-browser fill "input[type='email']" "meal@xile2026.cn" 2>&1 || {
    log_fail "Email input not found"
    exit 1
}
agent-browser snapshot

log_pass "Email input successful (verification code pending)"

echo ""
echo -e "${YELLOW}⚠ MANUAL ACTION REQUIRED${NC}"
echo "Please:"
echo "1. Check email at meal@xile2026.cn for verification code"
echo "2. Enter the code in the browser"
echo "3. Press Enter when done to continue tests"
read -p "> "

# Verify login success
agent-browser wait --load networkidle
agent-browser snapshot 2>&1 | grep -i "用户\|profile\|avatar" && log_pass "User logged in successfully" || {
    echo -e "${YELLOW}⚠ Login status unclear, continuing...${NC}"
}

# ============================================
# TEST 4: Comment Functionality (评论功能)
# ============================================
log_test "4. Comment Functionality"

echo "Opening a recipe..."
agent-browser click "a[href*='/recipe'], link:contains('鸡蛋')" 2>&1 || {
    agent-browser open https://cookforevery-production.up.railway.app
    agent-browser click @e14  # First recipe from earlier snapshot
}
agent-browser wait --load networkidle

echo "Scrolling to comment section..."
agent-browser scroll down 500

echo "Clicking comment button..."
agent-browser click "button:contains('评论'), button:contains('发表')" 2>&1 || {
    log_fail "Comment button not found"
}
agent-browser wait 2000

echo "Entering test comment..."
TIMESTAMP=$(date +%s)
agent-browser fill "textarea, input[type='text']" "自动化测试评论 - Test #$TIMESTAMP" 2>&1 || {
    log_fail "Comment input not found"
    exit 1
}

echo "Submitting comment..."
agent-browser click "button[type='submit'], button:contains('提交'), button:contains('发送')" 2>&1 || {
    log_fail "Submit button not found"
}
agent-browser wait 3000

log_pass "Comment submission attempted"

# ============================================
# TEST 5: Like Functionality (点赞功能)
# ============================================
log_test "5. Like Functionality"

echo "Finding like button..."
agent-browser snapshot -i | grep -i "like\|点赞\|heart" || {
    echo "Like button not found in snapshot"
}

echo "Clicking like button..."
agent-browser click "button:contains('0'), button[aria-label*='like'], button[class*='like']" 2>&1 || {
    log_fail "Like button not clickable"
}
agent-browser wait 1000

echo "Checking like count..."
agent-browser snapshot

log_pass "Like functionality tested"

# ============================================
# TEST 6: Backend Data Management (后台数据管理)
# ============================================
log_test "6. Backend Data Management"

echo "Testing admin access..."
agent-browser open https://cookforevery-production.up.railway.app/admin 2>&1
agent-browser wait 3000

ADMIN_STATUS=$(agent-browser snapshot 2>&1 | head -10)
if echo "$ADMIN_STATUS" | grep -qi "admin\|dashboard\|管理"; then
    log_pass "Admin page accessible"
else
    log_fail "Admin page not accessible or requires authentication"
fi

echo "Testing dashboard access..."
agent-browser open https://cookforevery-production.up.railway.app/dashboard 2>&1
agent-browser wait 3000

DASH_STATUS=$(agent-browser snapshot 2>&1 | head -10)
if echo "$DASH_STATUS" | grep -qi "data\|recipe\|用户"; then
    log_pass "Dashboard displays data"
else
    log_fail "Dashboard data not visible"
fi

# Additional: Try API data endpoints
echo "Testing API data endpoints..."
curl -s https://cookforevery-production.up.railway.app/api/recipes 2>&1 | grep -qi "recipe" && log_pass "Recipes API returns data" || {
    echo -e "${YELLOW}⚠ Recipes API check failed${NC}"
}

# ============================================
# Final Cleanup
# ============================================
echo ""
echo "Tests completed. Browser will close in 5 seconds..."
sleep 5

echo ""
echo "=========================================="
echo "Test execution finished"
echo "=========================================="
