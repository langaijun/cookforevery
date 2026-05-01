#!/bin/bash
# 执行所有测试套件

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TEST_DIR="${PROJECT_ROOT}/tests"
DATA_DIR="${TEST_DIR}/data"
REPORT_DIR="${TEST_DIR}/reports"

# 创建必要的目录
mkdir -p "${DATA_DIR}"
mkdir -p "${REPORT_DIR}"

echo "═══════════════════════════════════════"
echo "      执行完整的 API 测试套件"
echo "═══════════════════════════════════════"
echo ""
echo "项目根目录: ${PROJECT_ROOT}"
echo "测试目录: ${TEST_DIR}"
echo "报告目录: ${REPORT_DIR}"
echo ""

# 检查开发服务器是否运行
echo "🔍 检查开发服务器..."
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ 开发服务器运行中 (http://localhost:3001)"
else
    echo "⚠️  开发服务器未运行，尝试启动..."
    cd "${PROJECT_ROOT}"
    npm run dev &
    DEV_PID=$!
    echo "等待服务器启动..."
    sleep 10

    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        echo "✅ 开发服务器已启动"
    else
        echo "❌ 开发服务器启动失败"
        exit 1
    fi
fi

echo ""

# 测试套件列表
TEST_SUITES=(
    "auth.test.ts:用户认证模块"
    "recipes.test.ts:食谱浏览模块"
    "social.test.ts:社交功能模块"
)

# 执行每个测试套件
TOTAL_PASSED=0
TOTAL_FAILED=0

for SUITE in "${TEST_SUITES[@]}"; do
    IFS=':' read -r FILE NAME <<< "$SUITE"
    echo ""
    echo "═══════════════════════════════════════"
    echo "  执行测试: ${NAME}"
    echo "═══════════════════════════════════════"

    cd "${PROJECT_ROOT}"
    if tsx "${TEST_DIR}/api/${FILE}" > "${DATA_DIR}/${FILE%.ts}-output.log" 2>&1; then
        echo "✅ ${NAME} 测试通过"
        TOTAL_PASSED=$((TOTAL_PASSED + 1))
    else
        echo "❌ ${NAME} 测试失败"
        TOTAL_FAILED=$((TOTAL_FAILED + 1))
    fi
done

# 清理后台进程
if [ ! -z "${DEV_PID+x}" ]; then
    echo ""
    echo "🛑 停止开发服务器..."
    kill ${DEV_PID}
fi

# 生成总体报告
echo ""
echo "═══════════════════════════════════════"
echo "           测试执行总报告"
echo "═══════════════════════════════════════"
echo ""
echo "总测试套件: $((TOTAL_PASSED + TOTAL_FAILED))"
echo "通过: ${TOTAL_PASSED}"
echo "失败: ${TOTAL_FAILED}"
echo ""

if [ ${TOTAL_FAILED} -eq 0 ]; then
    echo "✅ 所有测试套件通过！"
    exit 0
else
    echo "❌ ${TOTAL_FAILED} 个测试套件失败"
    exit 1
fi
