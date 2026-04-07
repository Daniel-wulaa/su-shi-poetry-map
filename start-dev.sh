#!/bin/bash
# 苏轼人生诗词地图 - 开发启动脚本

echo "🚀 苏轼人生诗词地图 - 开发环境启动"
echo ""

# 检查后端 .env 文件
if [ ! -f "backend/.env" ]; then
    echo "⚠️  后端 .env 文件不存在，正在创建..."
    cp backend/.env.example backend/.env
    echo "✅ 已创建 backend/.env，请记得填入 AMAP_API_KEY"
fi

# 检查前端 .env 文件
if [ ! -f "frontend/.env" ]; then
    echo "⚠️  前端 .env 文件不存在，正在创建..."
    cp frontend/.env.example frontend/.env
    echo "✅ 已创建 frontend/.env，请记得填入 VITE_AMAP_KEY"
fi

echo ""
echo "📦 启动后端服务..."
cd backend

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "正在创建 Python 虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境并安装依赖
source venv/bin/activate
pip install -r requirements.txt -q

# 启动后端
echo "🔧 后端服务运行在 http://localhost:8000"
echo "📚 API 文档：http://localhost:8000/docs"
uvicorn app.main:app --reload &
BACKEND_PID=$!

cd ../frontend

# 安装前端依赖
echo ""
echo "📦 安装前端依赖..."
npm install --silent

# 启动前端
echo "🎨 启动前端开发服务器..."
echo "🌐 前端运行在 http://localhost:5173"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 开发环境启动完成！"
echo ""
echo "后端：http://localhost:8000 (PID: $BACKEND_PID)"
echo "前端：http://localhost:5173 (PID: $FRONTEND_PID)"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
