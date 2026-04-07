#!/bin/bash
# 本地快速启动脚本（生产构建测试）

set -e

echo "========================================"
echo "  本地生产构建测试"
echo "========================================"

# 前端构建
echo "🔨 构建前端..."
cd frontend
npm run build
echo "✅ 前端构建完成"

# 提示
echo ""
echo "========================================"
echo "  前端构建完成！"
echo "========================================"
echo ""
echo "使用 serve 预览:"
echo "  npm install -g serve"
echo "  serve -s dist -p 3000"
echo ""
echo "或使用 Docker 部署:"
echo "  cd .. && docker-compose up -d"
echo ""
