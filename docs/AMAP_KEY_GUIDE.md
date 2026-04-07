# 高德地图 API 申请指南

## 第一步：注册高德开放平台账号

1. 访问 https://lbs.amap.com/
2. 点击右上角「登录 / 注册」
3. 可以使用以下方式登录：
   - 微信扫码
   - QQ 登录
   - 微博登录
   - 高德账号（需注册）

> 建议使用微信扫码，最方便

---

## 第二步：创建应用

1. 登录后进入控制台：https://console.amap.com/
2. 点击「应用管理」→「我的应用」→「+ 创建应用」
3. 填写应用信息：

| 字段 | 填写内容 |
|------|---------|
| 应用名称 | 苏轼人生诗词地图 |
| 应用类型 | **Web 端 (JS API)** |
| 白名单 | `localhost` (本地开发用) |

4. 点击「提交」

---

## 第三步：获取 Key 和安全密钥

创建应用后，会显示应用详情：

```
应用名称：苏轼人生诗词地图
Key: a1b2c3d4e5f6g7h8i9j0 (示例，实际更长)
安全密钥：xxxxx (2021 年 12 月后注册的账号才有)
```

**重要：**
- 复制 **Key** 和 **安全密钥**（如果有）
- 安全密钥不是所有账号都有，如果没有就留空

---

## 第四步：配置环境变量

### 前端配置

编辑 `frontend/.env` 文件：

```bash
# 填入你的 Key
VITE_AMAP_KEY=a1b2c3d4e5f6g7h8i9j0

# 如果有安全密钥，填入；没有就留空
VITE_AMAP_SECURITY_CODE=

# API 地址（不用改）
VITE_API_URL=http://localhost:8000/api
```

### 后端配置

编辑 `backend/.env` 文件：

```bash
# 填入你的 Key
AMAP_API_KEY=a1b2c3d4e5f6g7h8i9j0

# 数据库配置（不用改）
DATABASE_URL=sqlite+aiosqlite:///./data/poetry.db
```

---

## 第五步：启动项目测试

### 启动后端

```bash
cd backend
source venv/bin/activate  # Mac/Linux
# 或 venv\Scripts\activate  # Windows
uvicorn app.main:app --reload
```

访问 http://localhost:8000/docs 查看 API 文档

### 启动前端

```bash
cd frontend
npm run dev
```

访问 http://localhost:5173/map 查看地图页面

---

## 配额说明

个人开发者（免费）配额：

| API 类型 | 配额 |
|---------|------|
| JS API (地图展示) | 30 万次/天 |
| Web 服务 (地理编码) | 5000 次/天 |
| 静态图 API | 1000 次/天 |

对于本项目完全够用。

---

## 常见问题

### Q1: 地图显示「安全密钥未配置」

**解决：** 在 `frontend/.env` 中配置 `VITE_AMAP_SECURITY_CODE`

```bash
VITE_AMAP_SECURITY_CODE=你的安全密钥
```

然后重启前端开发服务器。

---

### Q2: 地图显示「非法 Key」或「Key 校验失败」

**原因：** 白名单配置不正确

**解决：**
1. 进入控制台 https://console.amap.com/
2. 找到你的应用，点击「设置」
3. 在白名单中添加 `localhost` 和 `127.0.0.1`
4. 保存后等待 1-2 分钟生效

---

### Q3: 地理编码接口返回 403

**原因：** 后端 API Key 未配置或配额用尽

**解决：**
1. 检查 `backend/.env` 中的 `AMAP_API_KEY`
2. 进入控制台查看今日调用量
3. 如超限，第二天会自动恢复

---

### Q4: 没有安全密钥怎么办？

安全密钥是 2021 年 12 月后新增的安全机制，只有部分账号需要。

如果你的账号没有安全密钥：
- `VITE_AMAP_SECURITY_CODE` 留空即可
- 不影响正常使用

---

### Q5: 生产环境如何配置白名单？

生产环境部署时，需要添加你的域名：

1. 进入控制台
2. 编辑应用白名单
3. 添加你的域名，例如：
   ```
   su-shi-poetry-map.vercel.app
   *.su-shi-poetry-map.com
   ```

多个域名用换行分隔。

---

## 升级为企业开发者（可选）

如果需要更高配额，可以认证为企业开发者：

1. 进入控制台 → 认证管理
2. 选择「企业认证」
3. 上传营业执照
4. 等待审核（1-3 个工作日）

企业认证后配额提升：
- JS API: 100 万次/天
- Web 服务：10 万次/天

---

## 官方文档

- [高德开放平台](https://lbs.amap.com/)
- [JavaScript API 文档](https://lbs.amap.com/api/javascript-api/summary)
- [Web 服务 API 文档](https://lbs.amap.com/api/webservice/summary)
- [配额说明](https://lbs.amap.com/faq/quota/123)

---

## 需要帮助？

如果遇到问题：
1. 查看控制台的「开发支持」→「工单系统」
2. 加入高德开放平台开发者 QQ 群
3. 查看 FAQ: https://lbs.amap.com/faq/
