# 开发日记 DAY2 - 核心功能开发

**日期**: 2026-03-30
**天气**: 多云
**心情**: 痛并快乐着

---

## 一、今日目标

今天的任务是完成项目的核心功能：
1. 地图标点与聚合
2. 时间线视图
3. 搜索筛选功能
4. 诗词详情页

---

## 二、地图模块开发

### 高德地图集成

高德地图的 React 集成方案有两种选择：
1. `react-amap` - 社区封装
2. 原生 JS API + React Hooks

最终选择了原生 JS API + 自定义 Hooks 的方案，因为更灵活，遇到问题也更容易调试。

### 核心 Hook: useMap

```typescript
// 全局地图实例引用（避免重复初始化）
const globalMapInstance = {
  map: null as any,
  AMap: null as any,
};

export function useMap({ containerId, zoom, center }) {
  // 首次挂载时初始化地图
  useEffect(() => {
    // 检查缓存实例
    if (globalMapInstance.map && globalMapInstance.AMap) {
      // 使用缓存
      return;
    }
    // 初始化...
  }, []);
}
```

### 踩坑记录

**问题**: 每次组件重绘，地图都会重新初始化，导致容器消失。

**排查过程**:
1. 一开始以为是容器 div 的问题
2. 后来发现是 useEffect 依赖项导致的
3. 最后用全局实例缓存解决

**解决方案**: 使用全局变量缓存地图实例，避免重复初始化。

---

## 三、时间线模块开发

### 时间线视图设计

时间线需要展示苏轼人生各年份的诗词作品，并支持点击定位到对应地点。

```typescript
interface TimelineItem {
  year: number;
  poetries: { id: number; title: string }[];
  period: string | null;
  location_ids?: number[];  // 关键！用于地图定位
}
```

### 后端 API: /api/timeline

这个接口需要返回按年份分组的诗词数据，以及关联的地点 ID。

```python
@router.get("/timeline")
async def get_timeline(db: AsyncSession):
    # 使用 selectinload 预加载关联地点
    result = await db.execute(
        select(Poetry)
        .where(Poetry.year.isnot(None))
        .options(selectinload(Poetry.locations))
        .order_by(Poetry.year)
    )
    # 按年份分组...
```

### 踩坑记录

**问题**: 点击时间线后，地图定位的地点和实际选中的不一致。

**排查过程**:
1. 检查后端 API 返回的数据 → 正确
2. 检查前端传递的 props → 正确
3. 最后发现是 `LifeEvents.tsx` 中的地点 ID 配置错误

**解决方案**: 修正 LifeEvents 中的 locationIds 数据，确保与数据库一致。

---

## 四、诗词详情页

### 页面结构

```
PoetryDetailPage
├── PoetryContent (诗词正文)
├── PoetryBackground (创作背景)
├── RelatedLocations (相关地点)
└── ShareButton (分享卡片)
```

### 诗词正文展示

诗词正文使用竖排展示，更有古风韵味：

```css
.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: upright;
}
```

---

## 五、第二天踩的坑

### 坑 1: 地点 ID 错位

这是今天最大的坑。`LifeEvents.tsx` 中配置的地点 ID 和数据库实际 ID 不一致：

```typescript
// 错误的配置
知密州：locationIds: [4]  // 4 是杭州！
乌台诗案：locationIds: [5]  // 5 是密州！

// 正确的配置
知密州：locationIds: [5]  // 5 是诸城市（密州）
乌台诗案：locationIds: [6]  // 6 是黄冈市（黄州）
```

**调试方法**:
1. 调用 `/api/locations` 接口，列出所有地点的 ID 和名称
2. 对比 LifeEvents 中的配置
3. 逐一修正

### 坑 2: 地图容器空白

点击时间线后，地图区域变空白。

**原因**: 地图实例被缓存，但容器 div 被重新渲染，导致实例和容器不匹配。

**解决方案**: 在 useMap hook 中，只有当容器 ID 匹配时才使用缓存实例。

---

## 六、第二天成果

- ✅ 地图标点功能完成
- ✅ 时间线视图完成
- ✅ 地点定位功能完成
- ✅ 诗词详情页完成
- ✅ 修复地点 ID 错位问题

---

## 七、明日计划

1. 分享卡片功能开发
2. 整体 UI/UX 优化
3. 性能优化
4. 部署上线

---

*（配图建议：地图标点效果截图、时间线界面截图、诗词详情页截图、调试控制台截图）**
