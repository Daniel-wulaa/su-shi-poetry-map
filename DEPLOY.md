# 苏轼诗词地图 - 快速部署指南

## 方案 1：Vercel 前端 + 任何后端主机（最简单 ⭐）

### 步骤 1：部署前端到 Vercel

1. 安装 Vercel CLI（本地）
```bash
npm i -g vercel
```

2. 登录 Vercel
```bash
cd frontend
vercel login
```

3. 部署
```bash
vercel --prod
```

4. 设置环境变量（在 Vercel 控制台）
- `VITE_AMAP_KEY` - 你的高德地图 API Key
- `VITE_API_URL` - 后端 API 地址（如 `http://your-server-ip:8000/api`）

### 步骤 2：部署后端

**选项 A - 有自己的服务器：**
```bash
# 复制后端到服务器
scp -r backend/ user@your-server:/app/

# 在服务器上
cd /app/backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**选项 B - 使用 Railway/Render：**
1. 访问 https://railway.app 或 https://render.com
2. 连接 GitHub 仓库
3. 设置 Build Command: `pip install -r requirements.txt`
4. 设置 Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
5. 添加环境变量 `AMAP_API_KEY`

---

## 方案 2：Docker Compose 一键部署（有自己的服务器）

### 前置条件
- 一台 Linux 服务器（Ubuntu/CentOS）
- Docker 和 Docker Compose 已安装

### 步骤

1. 创建 `frontend/Dockerfile`：
```dockerfile
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

2. 创建 `frontend/nginx.conf`：
```nginx
server {
    listen 80;
    
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. 部署：
```bash
# 在服务器上要部署的目录
git clone <your-repo>
cd su-shi-poetry-map

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

访问 `http://your-server-ip` 即可

---

## 方案 3：Railway 全栈部署（免费额度）

### 前端 + 后端都部署到 Railway

1. 访问 https://railway.app
2. New Project → Deploy from GitHub repo
3. 添加两个服务：
   - **Backend Service**: 
     - Root Directory: `backend`
     - Build: `pip install -r requirements.txt`
     - Start: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
   - **Frontend Service**:
     - Root Directory: `frontend`
     - Build: `npm run build`
     - Install: `npm install`
     - Output Directory: `dist`

4. 设置环境变量
5. Railway 会自动分配域名

---

## 方案 4：国内服务器快速部署

### 使用 宝塔面板（适合新手）

1. 安装宝塔面板（https://www.bt.cn）
2. 安装 Docker 插件
3. 上传项目代码
4. 使用 Docker Compose 启动

### 或使用 PM2（Node.js）+ Nginx

**前端：**
```bash
cd frontend
npm run build
npm install -g serve
serve -s dist -p 3000
```

**后端：**
```bash
cd backend
pip install -r requirements.txt
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name sushi-api
```

**Nginx 配置：**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
    }
    
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
    }
}
```

---

## 高德地图 API Key 配置

无论选择哪种方案，都需要配置高德地图 API：

1. 访问 https://lbs.amap.com
2. 创建 Web 端 (JS API) 应用
3. 获取 Key 和安全密钥
4. 在部署平台设置环境变量

---

## 推荐配置

| 组件 | 推荐服务 | 成本 |
|------|---------|------|
| 前端 | Vercel | 免费 |
| 后端 | Railway/Render | 免费额度 |
| 数据库 | SQLite（内置）/ Railway PostgreSQL | 免费 |

**总计：$0/月**（在免费额度内）

---

## 快速测试

部署前本地测试生产构建：

```bash
# 前端
cd frontend
npm run build
npm run preview

# 后端
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
