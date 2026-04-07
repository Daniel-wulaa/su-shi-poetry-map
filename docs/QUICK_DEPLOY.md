# 快速公网访问方案

## 方案 A：使用 Cloudflare Tunnel（免费，推荐 ⭐）

### 步骤

1. **安装 cloudflared**
```bash
# macOS
brew install cloudflared

# Linux
curl -L --output /usr/local/bin/cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x /usr/local/bin/cloudflared
```

2. **启动后端和前端**
```bash
# 终端 1 - 后端
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# 终端 2 - 前端
cd frontend
npm run dev
```

3. **创建 Tunnel**
```bash
# 登录 Cloudflare（需要 Cloudflare 账号）
cloudflared tunnel login

# 创建 tunnel
cloudflared tunnel create su-shi-map

# 配置 tunnel（生成 config.yml）
cloudflared tunnel route dns su-shi-map your-domain.com
```

4. **启动隧道**
```bash
cloudflared tunnel run su-shi-map
```

### 快速模式（无需域名）

使用 `cloudflared quick-tunnel`：

```bash
# 直接暴露本地服务
cloudflared tunnel --url http://localhost:5173
```

会生成一个随机的 `trycloudflare.com` 域名，可直接访问！

---

## 方案 B：使用 Ngrok（简单，有限制）

### 步骤

1. **注册并安装**
   - 访问 https://ngrok.com 注册
   - 获取 Authtoken

2. **安装**
```bash
# macOS
brew install ngrok

# Linux
snap install ngrok
```

3. **配置**
```bash
ngrok config add-authtoken YOUR_TOKEN
```

4. **启动**
```bash
# 暴露前端
ngrok http 5173

# 暴露后端（新终端）
ngrok http 8000
```

5. **获取公网 URL**
   - ngrok 会显示类似 `https://xxx.ngrok.io` 的 URL
   - 前端和后端各有一个 URL

---

## 方案 C：使用 localtunnel（最简单，无需注册）

### 步骤

1. **安装**
```bash
npm install -g localtunnel
```

2. **启动**
```bash
# 暴露前端
lt --port 5173

# 暴露后端
lt --port 8000
```

3. **获取 URL**
   - 会显示类似 `https://your-url.loca.lt` 的链接
   - 需要点击链接并确认

---

## 方案 D：使用 Godaddy + 服务器（适合长期）

如果有自己的服务器：

1. 购买域名（约 ¥60/年）
2. 域名解析到服务器 IP
3. 使用 Nginx 反向代理
4. 配置 HTTPS（Let's Encrypt 免费）

---

## 推荐组合

### 临时演示（0 成本）
```bash
# 1. 启动本地服务
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
npm run dev &

# 2. 使用 cloudflared 快速隧道
cloudflared tunnel --url http://localhost:5173
cloudflared tunnel --url http://localhost:8000
```

### 短期项目（免费）
- 前端：Vercel
- 后端：Railway (500 小时/月免费)

### 长期运营（低成本）
- 前端：Vercel (免费)
- 后端：国内 VPS（约 ¥30/月）
- 数据库：SQLite 或 Railway PostgreSQL
