# HomeCookHub Production Test Suite

Agent-Browser automation tests for HomeCookHub production environment.

## Prerequisites

Install agent-browser:
```bash
npm i -g agent-browser && agent-browser install
```

## Test Scripts

### Quick Test
```bash
bash tests/agent-browser/test-production.sh
```

### Enhanced Test (with detailed output)
```bash
bash tests/agent-browser/test-production-enhanced.sh
```

## Test Coverage

| # | Test | Description |
|---|------|-------------|
| 1 | Recipe Search | Search recipes by name (按食谱查询) |
| 2 | Ingredient Search | Search by ingredients (按食材查询) |
| 3 | Login | Email + verification code (邮箱+验证码登录) |
| 4 | Comments | Post comments (评论功能) |
| 5 | Likes | Like recipes (点赞功能) |
| 6 | Admin | Backend data management (后台数据管理) |

## Test Credentials

- **Email**: meal@xile2026.cn
- **Verification Code**: Enter manually when prompted

## Running Individual Tests

### Recipe Search
```bash
agent-browser open https://cookforevery-production.up.railway.app
agent-browser wait --load networkidle
agent-browser fill "input[placeholder*='搜索']" "鸡蛋"
agent-browser press Enter
```

### Login
```bash
agent-browser open https://cookforevery-production.up.railway.app
agent-browser click "button:contains('登录')"
agent-browser fill "input[type='email']" "meal@xile2026.cn"
# Enter verification code manually
```

### Comment
```bash
# Navigate to recipe and add comment
agent-browser click "button:contains('评论')"
agent-browser fill "textarea" "Test comment"
agent-browser click "button[type='submit']"
```

## Troubleshooting

### Timeout Issues
Increase wait times:
```bash
agent-browser wait 5000  # 5 seconds
```

### Headed Mode (Show Browser)
```bash
agent-browser --headed open <url>
```

### Debug Mode
```bash
agent-browser open --debug <url>
```

## Output

Test results show:
- ✓ PASS: Test succeeded
- ✗ FAIL: Test failed
- ⚠ WARNING: Partial success or manual intervention needed
