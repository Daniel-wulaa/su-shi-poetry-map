# 苏轼人生诗词地图 - 开发日记

这是「苏轼人生诗词地图」项目的完整开发记录，记录了从项目初始化到功能完善的全过程。

---

## 日记列表

| 日期 | 主题 | 主要内容 |
|------|------|----------|
| [DAY1](./DAY1-项目初始化与架构设计.md) | 项目初始化与架构设计 | 技术选型、项目结构、数据库设计 |
| [DAY2](./DAY2-核心功能开发.md) | 核心功能开发 | 地图模块、时间线、地点定位修复 |
| [DAY3](./DAY3-分享功能与优化完善.md) | 分享功能与优化完善 | 分享卡片、性能优化、部署准备 |

---

## 快速导航

```
docs/dev-diary/
├── README.md                              # 本文件
├── DAY1-项目初始化与架构设计.md            # 第一天：架构设计
├── DAY2-核心功能开发.md                    # 第二天：核心功能
└── DAY3-分享功能与优化完善.md              # 第三天：优化完善
```

---

## 项目概览

**项目名称**: 苏轼人生诗词地图

**技术栈**:
- 前端：React 18 + TypeScript + Vite + 高德地图
- 后端：FastAPI + SQLAlchemy + SQLite/PostgreSQL
- 部署：Vercel (前端) + Railway (后端)

**核心功能**:
1. 地图标点 - 在地图上展示苏轼去过的地方
2. 时间线 - 按时间顺序浏览诗词作品
3. 地点定位 - 点击时间线自动定位到对应地点
4. 诗词详情 - 查看诗词全文、注释、译文
5. 分享卡片 - 生成精美诗词卡片

---

## 配图说明

由于 Markdown 文件无法直接嵌入动态截图，建议以下列方式补充配图：

### DAY1 配图
1. `screenshots/day1-project-structure.png` - 项目目录结构
2. `screenshots/day1-er-diagram.png` - 数据库 ER 图
3. `screenshots/day1-architecture.png` - 技术架构图

### DAY2 配图
1. `screenshots/day2-map-markers.png` - 地图标点效果
2. `screenshots/day2-timeline.png` - 时间线界面
3. `screenshots/day2-console-debug.png` - 调试控制台截图

### DAY3 配图
1. `screenshots/day3-share-card.png` - 分享卡片效果
2. `screenshots/day3-performance.png` - 性能分析对比
3. `screenshots/day3-final-demo.png` - 最终效果展示

---

## 项目地址

- GitHub: `https://github.com/your-username/su-shi-poetry-map`
- 在线演示: `https://su-shi-poetry-map.vercel.app`
- API 文档: `https://su-shi-poetry-map.railway.app/docs`

---

*最后更新：2026-03-31*
