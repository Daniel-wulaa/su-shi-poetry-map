#!/bin/bash
# 苏轼诗词地图 - 一键部署脚本
# 适用于有自己的 Linux 服务器的情况

set -e

echo "========================================"
echo "  苏轼诗词地图 - 一键部署脚本"
echo "========================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否安装 Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker 未安装，开始安装...${NC}"
        curl -fsSL https://get.docker.com | sh
        systemctl enable docker
        systemctl start docker
        echo -e "${GREEN}✅ Docker 安装完成${NC}"
    else
        echo -e "${GREEN}✅ Docker 已安装${NC}"
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo -e "${YELLOW}⚠️  Docker Compose 未安装，开始安装...${NC}"
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        echo -e "${GREEN}✅ Docker Compose 安装完成${NC}"
    else
        echo -e "${GREEN}✅ Docker Compose 已安装${NC}"
    fi
}

# 检查配置文件
check_config() {
    echo ""
    echo "========================================"
    echo "  检查配置文件"
    echo "========================================"

    if [ ! -f backend/.env ]; then
        echo -e "${YELLOW}⚠️  backend/.env 不存在，从 .env.example 复制...${NC}"
        cp backend/.env.example backend/.env
        echo -e "${RED}⚠️  请编辑 backend/.env 配置 API Key！${NC}"
        read -p "按回车继续..."
    fi

    if [ ! -f frontend/.env ]; then
        echo -e "${YELLOW}⚠️  frontend/.env 不存在，从 .env.example 复制...${NC}"
        cp frontend/.env.example frontend/.env
        echo -e "${RED}⚠️  请编辑 frontend/.env 配置 API Key！${NC}"
        read -p "按回车继续..."
    fi
}

# 构建和启动
deploy() {
    echo ""
    echo "========================================"
    echo "  开始构建和部署..."
    echo "========================================"

    # 停止旧容器
    docker-compose down 2>/dev/null || true

    # 构建
    echo -e "${YELLOW}🔨 构建 Docker 镜像...${NC}"
    docker-compose build

    # 启动
    echo -e "${YELLOW}🚀 启动服务...${NC}"
    docker-compose up -d

    echo ""
    echo "========================================"
    echo -e "${GREEN}✅ 部署完成！${NC}"
    echo "========================================"
    echo ""
    echo "服务地址:"
    echo "  前端：http://localhost:3000"
    echo "  后端：http://localhost:8000"
    echo "  API 文档：http://localhost:8000/docs"
    echo ""
    echo "查看日志:"
    echo "  docker-compose logs -f"
    echo ""
    echo "停止服务:"
    echo "  docker-compose down"
    echo ""
}

# 主函数
main() {
    check_docker
    check_config
    deploy
}

# 运行主函数
main
