# 苏轼诗词地图 - 正式部署指南

## 推荐方案：海外服务器 + Docker 部署

### 一、服务器选择（¥20-50/月）

#### 推荐服务商

| 服务商 | 配置 | 价格 | 优势 |
|--------|------|------|------|
| **Vultr** | 1 核 1G 25GB | $6/月 (约¥43) | 按小时计费，随时删除 |
| **DigitalOcean** | 1 核 1G 25GB | $6/月 | 文档齐全，稳定 |
| **Linode** | 1 核 1G 25GB | $5/月 | 性价比高 |
| **Railway** | 共享 CPU 512MB | $5/月 + 用量 | 免运维，自动部署 |
| **Render** | 750 小时免费 | 免费额度 | 适合测试 |

#### 购买链接
- Vultr: https://www.vultr.com/ （注册送$100 抵扣）
- DigitalOcean: https://www.digitalocean.com/
- Linode: https://www.linode.com/

**推荐选 Vultr** - 有东京/新加坡机房，国内访问较快，按小时计费灵活。

---

### 二、服务器购买流程（以 Vultr 为例）

#### 1. 注册账号
- 访问 https://www.vultr.com
- 用 GitHub 或邮箱注册
- 绑定支付方式（信用卡/PayPal）

#### 2. 创建实例
1. 点击 **Deploy** → **New Server**
2. 选择 **Cloud Compute**
3. Location 选择 **Tokyo (东京)** 或 **Singapore (新加坡)**
4. Image 选择 **Ubuntu 22.04 LTS x64**
5. Plan 选择 **$6/mo** (1 核 1G)
6. 点击 **Deploy Now**

#### 3. 获取服务器信息
部署完成后，你会得到：
- **IP 地址**: 例如 `45.76.xxx.xxx`
- **用户名**: `root`
- **密码**: 在 Dashboard 查看

---

### 三、连接服务器

```bash
# macOS/Linux 终端
ssh root@45.76.xxx.xxx
# 输入密码登录

# Windows 使用 PowerShell 或 Putty
```

---

### 四、服务器环境配置

登录后执行以下命令：

```bash
# 1. 更新系统
apt update && apt upgrade -y

# 2. 安装 Docker
curl -fsSL https://get.docker.com | sh

# 3. 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 4. 验证安装
docker --version
docker-compose --version
```

---

### 五、部署应用

#### 方式 A：使用 Git（推荐）

```bash
# 1. 安装 Git
apt install git -y

# 2. 克隆代码
cd /root
git clone <你的仓库地址> su-shi-poetry-map
cd su-shi-poetry-map

# 3. 配置环境变量
cd backend
cp .env.example .env
# 编辑 .env，填入你的 API Key
nano .env

# 4. 前端配置
cd ../frontend
cp .env.example .env
# 编辑 .env，设置 VITE_API_URL 为 http://服务器 IP:8000/api
nano .env

# 5. 启动服务
cd ..
docker-compose up -d

# 6. 查看状态
docker-compose ps
docker-compose logs -f
```

#### 方式 B：直接上传代码

```bash
# 在本地电脑上执行
# 打包前端
cd frontend
npm run build

# 使用 scp 上传
scp -r . root@服务器 IP:/root/su-shi-poetry-map/frontend
scp -r ../backend root@服务器 IP:/root/su-shi-poetry-map/
```

---

### 六、配置域名（可选但推荐）

#### 1. 购买域名
- 名称cheap：https://www.namecheap.com/
- Cloudflare：https://www.cloudflare.com/
- 阿里云（需要实名）

#### 2. 添加 DNS 记录
在域名管理后台添加：
```
类型：A
主机记录：@ 或 www
记录值：你的服务器 IP
TTL: 自动
```

#### 3. 配置 Nginx（带域名）

创建 `/root/su-shi-poetry-map/frontend/nginx.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 改成你的域名
    
    # 自动跳转 HTTPS（可选，需要先配置 SSL）
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

### 七、配置 HTTPS（强烈推荐）

使用 Let's Encrypt 免费证书：

```bash
# 1. 安装 Certbot
apt install certbot python3-certbot-nginx -y

# 2. 获取证书
certbot --nginx -d your-domain.com

# 3. 自动续期
certbot renew --dry-run
```

---

### 八、完整部署脚本

创建 `/root/deploy.sh`：

```bash
#!/bin/bash
set -e

echo "=== 苏轼诗词地图部署脚本 ==="

# 配置变量
DOMAIN="${1:-}"  # 可选：域名
API_KEY="${2:-}" # 高德 API Key

# 1. 安装依赖
if ! command -v docker &> /dev/null; then
    echo "安装 Docker..."
    curl -fsSL https://get.docker.com | sh
fi

if ! command -v docker-compose &> /dev/null; then
    echo "安装 Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 2. 创建目录
mkdir -p /root/su-shi-poetry-map

# 3. 拉取代码
cd /root/su-shi-poetry-map
if [ ! -d ".git" ]; then
    git clone <你的仓库> . 2>/dev/null || echo "请手动上传代码"
fi

# 4. 配置环境变量
cat > backend/.env <<EOF
AMAP_API_KEY=${API_KEY:-你的 API Key}
DATABASE_URL=sqlite+aiosqlite:///./data/poetry.db
PORT=8000
EOF

cat > frontend/.env <<EOF
VITE_AMAP_KEY=${API_KEY:-你的 API Key}
VITE_API_URL=http://localhost:8000/api
EOF

# 5. 停止旧服务
docker-compose down 2>/dev/null || true

# 6. 构建并启动
docker-compose build
docker-compose up -d

echo ""
echo "=== 部署完成 ==="
echo "访问地址：http://$(curl -s ifconfig.me)"
echo "查看日志：docker-compose logs -f"
```

使用：
```bash
chmod +x deploy.sh
./deploy.sh
```

---

### 九、运维管理

```bash
# 查看服务状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新代码
git pull
docker-compose build
docker-compose up -d

# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看 Docker 容器资源
docker stats
```

---

### 十、成本明细

| 项目 | 费用 |
|------|------|
| 服务器（Vultr 1 核 1G） | $6/月 (约¥43) |
| 域名（可选） | ¥60/年 |
| **总计** | **约¥50/月** |

---

### 十一、快速检查清单

- [ ] 购买服务器
- [ ] 获取 IP 和 root 密码
- [ ] SSH 登录服务器
- [ ] 安装 Docker 和 Docker Compose
- [ ] 上传或克隆代码
- [ ] 配置 `.env` 文件（API Key）
- [ ] 运行 `docker-compose up -d`
- [ ] 测试访问 `http://服务器 IP`
- [ ] （可选）配置域名和 HTTPS

---

### 十二、遇到问题？

#### 1. 前端无法连接后端
检查 `frontend/.env` 中的 `VITE_API_URL` 是否正确

#### 2. 地图不显示
检查高德地图 API Key 是否正确

#### 3. 数据库为空
运行种子脚本：
```bash
docker-compose exec backend python -m scripts.seed_data
```

#### 4. 端口冲突
修改 `docker-compose.yml` 的端口映射：
```yaml
ports:
  - "8080:80"  # 改为 8080
```

---

## 懒人方案：Railway 全托管部署

如果不想管理服务器，使用 Railway：

1. 访问 https://railway.app
2. GitHub 登录
3. New Project → Deploy from GitHub
4. 设置 Root Directory 为 `backend`
5. 添加环境变量 `AMAP_API_KEY`
6. Railway 会自动分配域名

**费用**: $5/月 + 用量

---

需要我帮你执行哪一步？
