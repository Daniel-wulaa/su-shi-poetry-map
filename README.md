# 苏轼人生诗词地图

> 跟着苏轼去旅行，读他读过的风景

一个交互式的诗词地图网站，通过苏轼的诗词作品串联起他的人生轨迹。

## 🌟 特性

- 📍 **地图展示**：在地图上直观呈现苏轼去过的地方和创作的诗词
- ⏱️ **时间线**：拖动时间轴，查看不同时期的作品
- 🔍 **搜索筛选**：按诗词名、地点、内容搜索
- 📜 **诗词详情**：正文、注释、背景、现今景点介绍
- 🎴 **分享卡片**：生成精美诗词卡片，支持下载分享

## 🛠️ 技术栈

### 前端
- React 18 + TypeScript
- Vite 5
- shadcn/ui + Tailwind CSS
- 高德地图 JS API 2.0
- Zustand（状态管理）
- React Query（数据获取）

### 后端
- Python 3.11+
- FastAPI
- SQLAlchemy（ORM）
- SQLite（开发）/ PostgreSQL（生产）
- httpx + BeautifulSoup4（爬虫）

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Python 3.11+
- 高德地图 API Key（[申请地址](https://lbs.amap.com/)）

### 后端启动

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入 AMAP_API_KEY

# 初始化数据库
python -m app.db.init_db

# 启动服务
uvicorn app.main:app --reload
```

访问 http://localhost:8000 查看 API 文档

### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入 VITE_AMAP_KEY

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173

## 📁 项目结构

```
su-shi-poetry-map/
├── frontend/          # 前端代码
│   ├── src/
│   │   ├── modules/   # 功能模块
│   │   ├── pages/     # 页面
│   │   ├── components/# 通用组件
│   │   └── lib/       # 工具函数
│   └── package.json
├── backend/           # 后端代码
│   └── app/
│       ├── api/       # API 路由
│       ├── models/    # 数据模型
│       ├── services/  # 业务逻辑
│       └── spiders/   # 爬虫
├── scripts/           # 脚本工具
└── docs/              # 文档
```

## 📊 API 文档

启动后端后访问 http://localhost:8000/docs 查看 Swagger 文档

主要接口：
- `GET /api/poetries` - 诗词列表
- `GET /api/poetries/{id}` - 诗词详情
- `GET /api/locations` - 地点列表
- `GET /api/timeline` - 时间线数据
- `GET /api/search?q=` - 搜索

## 🗺️ 数据来源

- 诗词数据：古诗文网（https://so.gushiwen.cn/）
- 地理编码：高德地图 Web API
- 景点信息：多源爬取（马蜂窝、维基百科等）

## 📝 开发计划

- [x] 项目初始化
- [ ] 后端 API 开发
- [ ] 数据爬虫
- [ ] 前端地图模块
- [ ] 时间线功能
- [ ] 搜索筛选
- [ ] 分享卡片
- [ ] 测试与部署

## 📄 License

MIT

---

**参考项目**：唐宋文学编年地图
