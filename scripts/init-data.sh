#!/bin/bash
# 数据种子脚本 - 初始化苏轼诗词和地点数据

echo "🌱 苏轼人生诗词地图 - 数据初始化"
echo ""

cd "$(dirname "$0")/backend"

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "正在创建 Python 虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
echo "正在安装依赖..."
pip install -r requirements.txt -q

# 运行种子脚本
echo ""
echo "正在初始化数据..."
python3 -m scripts.seed_data

echo ""
echo "✅ 数据初始化完成！"
echo ""
echo "提示："
echo "  - 诗词数据已保存到 SQLite 数据库"
echo "  - 地点数据包含 11 个苏轼重要足迹地点"
echo "  - 已创建 12 首代表诗词及地点关联"
