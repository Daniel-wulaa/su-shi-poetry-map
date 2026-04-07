# 🔒 安全检查清单 - 上传 GitHub 前

## ⚠️ 高风险文件（绝对不能提交）

### 1. API Key 和凭证
- [ ] `backend/.env` - 包含 `AMAP_API_KEY` 和 `DASHSCOPE_API_KEY`
- [ ] `frontend/.env` - 包含 `VITE_AMAP_KEY`
- [ ] `*.pem` - AWS/SSH密钥文件
- [ ] `*key*` - 任何包含 key 的文件

### 2. 数据库文件
- [ ] `backend/data/*.db` - 可能包含用户数据
- [ ] `backend/data/*.sqlite`

### 3. 其他敏感信息
- [ ] `*.log` - 日志文件可能包含敏感信息
- [ ] `node_modules/` - 第三方依赖

---

## ✅ .gitignore 状态

当前已配置忽略：
- [x] `.env` 和 `.env.*`
- [x] `node_modules/`
- [x] `*.db`, `*.sqlite`
- [x] `dist/`, `build/`
- [x] `__pycache__/`, `*.pyc`
- [x] `.DS_Store`
- [x] `*.pem`, `*.key`
- [x] `backend/data/*.json`

---

## 🔍 上传前检查命令

```bash
# 1. 查看哪些文件会被提交
git status --short

# 2. 检查是否有敏感文件
git ls-files | grep -E '\.(env|pem|key|db|sqlite)$'

# 3. 搜索可能的 API Key
grep -r "sk-[a-zA-Z0-9]" --include="*.py" --include="*.js" --include="*.ts" .
grep -r "API_KEY=" --include="*.md" .
```

---

## 📋 安全上传步骤

### 步骤 1：清理敏感文件
```bash
cd /Users/daniel/claude-out/su-shi-poetry-map

# 删除所有 .env 文件（不包括 .env.example）
find . -name ".env" -not -path "./node_modules/*" -delete

# 删除数据库文件
rm -f backend/data/*.db backend/data/*.sqlite

# 清理编译产物
rm -rf frontend/dist backend/__pycache__
```

### 步骤 2：确认 Git 状态
```bash
git status --short
```

**期望输出**（只有这些文件应该被提交）：
```
M  .gitignore
M  README.md
?? backend/app/
?? backend/requirements.txt
?? backend/Dockerfile
?? backend/scripts/
?? frontend/src/
?? frontend/public/
?? frontend/package.json
?? docker-compose.yml
?? docs/
```

### 步骤 3：创建干净的提交
```bash
git add -A
git commit -m "准备公开项目 - 清理敏感信息"
```

### 步骤 4：创建 GitHub 仓库并推送
```bash
# 在 GitHub 创建新仓库后
git remote add origin https://github.com/你的用户名/su-shi-poetry-map.git
git branch -M main
git push -u origin main
```

---

## 🛡️ 最佳实践

### 1. 使用 .env.example
```bash
# backend/.env.example
AMAP_API_KEY=your_amap_api_key_here
DASHSCOPE_API_KEY=your_dashscope_key_here
DATABASE_URL=sqlite+aiosqlite:///./data/poetry.db

# frontend/.env.example
VITE_AMAP_KEY=your_amap_api_key_here
VITE_API_URL=http://localhost:8000/api
```

### 2. GitHub Secrets（用于 CI/CD）
如果使用 GitHub Actions，将 API Key 存储在：
Repository Settings → Secrets and variables → Actions

### 3. 部署时使用环境变量
```bash
# 服务器上使用
export AMAP_API_KEY=实际密钥
```

---

## 🚨 如果已经泄露了 API Key

### 立即执行：
1. **撤销并重新生成 API Key**
   - 高德地图：https://lbs.amap.com → 控制台 → 应用管理
   - 阿里百炼：https://dashscope.console.aliyun.com → API-KEY管理

2. **删除包含 Key 的提交历史**
   ```bash
   # 如果已经提交，使用 BFG Repo-Cleaner
   java -jar bfg.jar --delete-files '*secret*' repo.git
   ```

3. **监控 API 使用情况**

---

## ✅ 本项目当前状态

| 检查项 | 状态 |
|-------|------|
| `.gitignore` 配置完整 | ✅ |
| `backend/.env` 未追踪 | ✅ |
| `frontend/.env` 未追踪 | ✅ |
| `node_modules/` 已忽略 | ✅ |
| 数据库文件已忽略 | ✅ |
| 根目录 `.env` 已删除 | ✅ |

---

## 📝 可以安全提交的文件

```
✅ README.md
✅ DEPLOY*.md (部署文档)
✅ docker-compose.yml (不含敏感信息)
✅ backend/app/*.py (源代码)
✅ backend/requirements.txt
✅ backend/Dockerfile
✅ backend/scripts/*.py
✅ frontend/src/**
✅ frontend/public/**
✅ frontend/package.json
✅ frontend/Dockerfile
✅ docs/*.md
```

---

最后检查命令：
```bash
# 运行此命令确认没有敏感文件
git status --short
```
