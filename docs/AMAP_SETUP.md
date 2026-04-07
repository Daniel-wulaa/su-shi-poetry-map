# 高德地图 API 配置指南

## 1. 注册高德开放平台账号

访问 https://lbs.amap.com/ 注册账号（可用微信/QQ 登录）

## 2. 创建应用

1. 登录控制台：https://console.amap.com/
2. 点击「应用管理」→「我的应用」→「创建新应用」
3. 填写应用信息：
   - 应用名称：苏轼人生诗词地图
   - 应用类型：Web 端 (JS API)
   - 白名单：可以填 `localhost` 用于本地开发

## 3. 获取 API Key

创建应用后，你会看到：
- **Key (安全密钥)**：类似 `a1b2c3d4e5f6...`
- **安全密钥 (securityJsCode)**：2021 年 12 月后注册的账号需要

## 4. 配置环境变量

### 前端配置

编辑 `frontend/.env`：

```bash
VITE_AMAP_KEY=你的 Key
VITE_AMAP_SECURITY_CODE=你的安全密钥（如果有）
VITE_API_URL=http://localhost:8000/api
```

### 后端配置

编辑 `backend/.env`：

```bash
AMAP_API_KEY=你的 Key
DATABASE_URL=sqlite+aiosqlite:///./data/poetry.db
```

## 5. 配额说明

高德地图个人认证开发者配额：
- JS API 调用：30 万次/天
- Web 服务 API（地理编码）：5000 次/天

对于本项目完全够用。

## 6. 测试

启动项目后访问 http://localhost:5173/map 应该能看到地图和标点。

## 常见问题

**Q: 地图显示「安全密钥未配置」？**
A: 在 `frontend/.env` 中配置 `VITE_AMAP_SECURITY_CODE`

**Q: 地图显示「非法 Key」？**
A: 检查控制台白名单是否包含 `localhost`

**Q: 地理编码失败？**
A: 检查 `backend/.env` 中的 `AMAP_API_KEY` 是否正确
