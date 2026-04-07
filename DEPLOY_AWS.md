# AWS EC2 部署指南 - 苏轼诗词地图

## 一、安全组配置（重要！）

在 AWS 控制台先配置安全组：

### 1. 找到你的安全组
- 进入 EC2 Dashboard
- 左侧 **Network & Security** → **Security Groups**
- 找到你的实例使用的安全组

### 2. 添加入站规则

| 类型 | 协议 | 端口 | 源 | 说明 |
|------|------|------|-----|------|
| SSH | TCP | 22 | 223.71.0.0/16 或 MyIP | 管理服务器 |
| HTTP | TCP | 80 | 0.0.0.0/0 | 网站访问 |
| HTTPS | TCP | 443 | 0.0.0.0/0 | 加密访问（可选） |

**添加入站规则步骤：**
1. 点击安全组 → **Inbound rules** → **Edit inbound rules**
2. 点击 **Add rule**
3. 选择 **HTTP**，源填 **0.0.0.0/0**
4. 点击 **Save rules**

---

## 二、连接服务器

### 方式 A：使用 SSH（推荐）

```bash
# 如果有 .pem 密钥文件
chmod 400 your-key.pem
ssh -i your-key.pem ec2-user@你的实例IP

# 如果是 Ubuntu 镜像
ssh -i your-key.pem ubuntu@你的实例IP
```

### 方式 B：AWS Systems Manager（免密钥）

如果实例配置了 IAM Role：
1. EC2 Dashboard → Instances
2. 选中实例 → **Connect**
3. 选择 **Session Manager** → **Connect**

---

## 三、服务器环境配置

### Ubuntu 系统（推荐）

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装 Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# 3. 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. 验证安装
docker --version
docker-compose --version

# 5. 退出重登使 docker 组生效
exit
```

### Amazon Linux 系统

```bash
# 1. 更新系统
sudo yum update -y

# 2. 安装 Docker
sudo amazon-linux-extras install docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# 3. 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. 验证
docker --version
docker-compose --version

# 5. 重启
sudo reboot
```

---

## 四、部署应用

### 方式 1：使用 Git 克隆

```bash
# 1. 安装 Git
sudo apt install git -y  # Ubuntu
sudo yum install git -y  # Amazon Linux

# 2. 克隆代码
cd ~
git clone <你的仓库地址> su-shi-poetry-map
cd su-shi-poetry-map

# 3. 配置后端环境变量
cd backend
cat > .env << 'EOF'
AMAP_API_KEY=你的高德地图 API Key
DATABASE_URL=sqlite+aiosqlite:///./data/poetry.db
PORT=8000
DEBUG=false
EOF

# 4. 配置前端环境变量
cd ../frontend
cat > .env << EOF
VITE_AMAP_KEY=你的高德地图 API Key
VITE_API_URL=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8000/api
EOF

# 5. 启动服务
cd ..
sudo docker-compose up -d

# 6. 查看状态
sudo docker-compose ps
sudo docker-compose logs -f
```

### 方式 2：本地打包上传

```bash
# 本地执行（Mac）
cd frontend
npm run build

# 上传到服务器
scp -i your-key.pem -r dist/* ec2-user@实例 IP:~/su-shi-poetry-map/frontend/
scp -i your-key.pem -r backend/* ec2-user@实例 IP:~/su-shi-poetry-map/backend/
```

---

## 五、配置域名（推荐）

### 1. 在 Route 53 添加记录

```bash
# 或使用 AWS CLI
aws route53 change-resource-record-sets \
  --hosted-zone-id 你的区域 ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "your-domain.com",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "你的 EC2 公网 IP"}]
      }
    }]
  }'
```

### 2. 更新 Nginx 配置

编辑 `frontend/nginx.conf`：
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 改成你的域名
    
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://backend:8000/api/;
    }
}
```

### 3. 配置 HTTPS（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 六、一键部署脚本

创建 `deploy-aws.sh`：

```bash
#!/bin/bash
set -e

echo "=== AWS EC2 部署脚本 - 苏轼诗词地图 ==="

# 配置变量
read -p "输入高德地图 API Key: " AMAP_KEY
read -p "输入域名（可选，直接回车跳过）: " DOMAIN

# 获取实例 IP
INSTANCE_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

echo "实例 IP: $INSTANCE_IP"

# 配置后端
cd ~/su-shi-poetry-map/backend
cat > .env << EOF
AMAP_API_KEY=$AMAP_KEY
DATABASE_URL=sqlite+aiosqlite:///./data/poetry.db
PORT=8000
DEBUG=false
EOF

# 配置前端
cd ../frontend
API_URL="http://${INSTANCE_IP}:8000/api"
if [ -n "$DOMAIN" ]; then
    API_URL="https://${DOMAIN}/api"
fi

cat > .env << EOF
VITE_AMAP_KEY=$AMAP_KEY
VITE_API_URL=$API_URL
EOF

# 停止旧服务
sudo docker-compose down 2>/dev/null || true

# 构建并启动
sudo docker-compose build
sudo docker-compose up -d

echo ""
echo "=== 部署完成 ==="
if [ -n "$DOMAIN" ]; then
    echo "访问地址：https://$DOMAIN"
else
    echo "访问地址：http://$INSTANCE_IP"
fi
echo "查看日志：sudo docker-compose logs -f"
```

使用：
```bash
chmod +x deploy-aws.sh
./deploy-aws.sh
```

---

## 七、监控和维护

### 查看服务状态
```bash
sudo docker-compose ps
sudo docker-compose logs -f
```

### 重启服务
```bash
sudo docker-compose restart
```

### 更新代码
```bash
cd ~/su-shi-poetry-map
git pull
sudo docker-compose build
sudo docker-compose up -d
```

### 查看资源使用
```bash
# CPU 和内存
top

# 磁盘
df -h

# Docker 容器资源
sudo docker stats
```

### 设置开机自启
```bash
# 创建 systemd 服务
sudo cat > /etc/systemd/system/sushi-map.service << EOF
[Unit]
Description=Su Shi Poetry Map
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/su-shi-poetry-map
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down

[Install]
WantedBy=multi-user.target
EOF

# 启用服务
sudo systemctl daemon-reload
sudo systemctl enable sushi-map
sudo systemctl start sushi-map
```

---

## 八、成本估算（斯德哥尔摩区域）

| 组件 | 配置 | 价格 |
|------|------|------|
| EC2 | t2.micro (1 核 1G) | $10.51/月 |
| 或 t3.micro | 1 核 1G | $7.59/月 |
| EBS | 30GB GP2 | $3/月 |
| 流量 | 100GB/月 | 免费额度内 |
| **总计** | | **约 $10-15/月 (约¥70-100)** |

> 斯德哥尔摩区域价格稍高，但仍在可接受范围

---

## 九、常见问题

### 1. 无法连接 SSH
检查安全组 22 端口是否开放

### 2. 国内访问慢
斯德哥尔摩区域延迟约 200ms，考虑：
- 开启 Gzip 压缩
- 使用 CloudFront CDN
- 或切换到新加坡区域

### 3. 地图不加载
检查高德 API Key 是否设置了正确的域名白名单

### 4. Docker 权限不足
```bash
sudo usermod -aG docker $USER
# 退出重登
```

### 5. 端口被占用
```bash
# 查看占用端口的进程
sudo lsof -i :80
sudo lsof -i :8000
```

---

## 十、快速检查清单

- [ ] AWS 安全组开放 80/443 端口
- [ ] SSH 可以登录服务器
- [ ] Docker 和 Docker Compose 已安装
- [ ] 代码已上传到服务器
- [ ] `.env` 配置了 API Key
- [ ] `docker-compose up -d` 成功运行
- [ ] 浏览器可以访问
- [ ] （可选）域名和 HTTPS 配置完成

---

需要我帮你执行哪一步？
