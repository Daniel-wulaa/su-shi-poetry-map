# 开发日记 DAY5 - 旅程路线可视化

**日期**: 2026-04-01
**天气**: 晴
**心情**: 兴奋

---

## 一、今日目标

参考昨天用户提供的几篇苏轼分析文章，在探索页面的地图上绘制苏轼人生的关键旅程路线，用不同颜色区分不同时期的行程。

---

## 二、需求分析

### 2.1 关键旅程梳理

根据历史资料，苏轼一生有以下关键旅程：

| 序号 | 旅程名称 | 时期 | 年份 | 颜色 |
|------|----------|------|------|------|
| 1 | 少年求学·出川入京 | 青年时期 | 1056-1057 | 绿色 |
| 2 | 凤翔签判·初入仕途 | 早期仕途 | 1061-1065 | 蓝色 |
| 3 | 杭州通判·江南初仕 | 外放时期 | 1071-1074 | 青色 |
| 4 | 山东三州·知州历练 | 知州时期 | 1074-1079 | 橙色 |
| 5 | 乌台诗案·贬谪黄州 | 贬谪时期 | 1079-1084 | 红色 |
| 6 | 回京拜相·短暂辉煌 | 回京时期 | 1085-1089 | 紫色 |
| 7 | 再知杭州·疏浚西湖 | 地方治理 | 1089-1091 | 蓝绿色 |
| 8 | 颍州扬州·地方任职 | 地方任职 | 1091-1093 | 深橙色 |
| 9 | 一贬再贬·远谪岭南 | 远谪时期 | 1094-1097 | 深红色 |
| 10 | 渡海贬儋·天涯海角 | 海南时期 | 1097-1100 | 深紫色 |
| 11 | 北归中原·魂归常州 | 北归时期 | 1100-1101 | 灰色 |

### 2.2 技术要点

1. **路线绘制**: 使用高德地图的 Polyline（折线）组件
2. **颜色区分**: 每段旅程用不同颜色标识
3. **路线标注**: 在路线中点显示旅程名称
4. **交互控制**: 支持显示/隐藏路线，点击路线定位

---

## 三、实现过程

### 3.1 数据结构设计

首先定义旅程路线的数据结构：

```typescript
interface JourneyRoute {
  id: number;
  name: string;
  description: string;
  color: string;
  period: string;
  yearRange: string;
  waypoints: {
    locationId: number;
    name: string;
    latitude: number;
    longitude: number;
    year: number;
    event?: string;
  }[];
}
```

### 3.2 地点数据扩充

原有的地点数据只有 11 个，不满足所有旅程路线的需求。需要扩充到 22 个地点：

**后端种子数据更新** (`backend/scripts/seed_data.py`):

```python
locations_data = [
    {"name": "眉山市", "ancient_name": "眉州", ...},
    {"name": "成都市", "ancient_name": "成都", ...},
    {"name": "西安市", "ancient_name": "长安", ...},
    {"name": "开封市", "ancient_name": "汴京", ...},
    # ... 共 22 个地点
]
```

运行种子脚本后得到地点 ID 对照表：

```
ID: 1 | 眉州     | 眉山市      | 30.0566, 103.8397
ID: 2 | 成都     | 成都市      | 30.5728, 104.0668
ID: 3 | 长安     | 西安市      | 34.3416, 108.9398
ID: 4 | 汴京     | 开封市      | 34.7958, 114.3075
ID: 5 | 陈州     | 淮阳区      | 33.7989, 114.9007
ID: 6 | 凤翔府    | 凤翔区      | 34.5158, 107.4000
ID: 7 | 杭州     | 杭州市      | 30.2741, 120.1551
ID: 8 | 密州     | 诸城市      | 35.9958, 119.4119
ID: 9 | 徐州     | 徐州市      | 34.2056, 117.2848
ID:10 | 湖州     | 湖州市      | 30.8703, 120.0972
ID:11 | 黄州     | 黄冈市      | 30.4518, 114.8797
ID:12 | 常州     | 常州市      | 31.8122, 119.9692
ID:13 | 扬州     | 扬州市      | 32.3912, 119.4215
ID:14 | 惠州     | 惠州市      | 23.1115, 114.4152
ID:15 | 英州     | 英德市      | 24.2820, 113.4147
ID:16 | 儋州     | 儋州市      | 19.5237, 109.5771
ID:17 | 鄂州     | 武汉市      | 30.5928, 114.3055
ID:18 | 汝州     | 汝州市      | 34.1636, 112.8408
ID:19 | 登州     | 蓬莱区      | 37.8155, 120.7572
ID:20 | 颍州     | 阜阳市      | 32.8979, 115.8162
ID:21 | 雷州     | 雷州市      | 20.9117, 110.0858
ID:22 | 赣州     | 赣州市      | 25.8452, 114.9335
```

### 3.3 路线数据定义

创建 `frontend/src/data/journeyRoutes.ts`:

```typescript
export const JOURNEY_ROUTES: JourneyRoute[] = [
  {
    id: 1,
    name: '少年求学·出川入京',
    description: '嘉祐元年（1056 年），苏轼与父苏洵、弟苏辙出川赴京参加科举',
    color: '#22c55e',
    period: '青年时期',
    yearRange: '1056-1057',
    waypoints: [
      { locationId: 1, name: '眉州', latitude: 30.0566, longitude: 103.8397, year: 1056 },
      { locationId: 2, name: '成都', latitude: 30.5728, longitude: 104.0668, year: 1056 },
      { locationId: 3, name: '长安', latitude: 34.3416, longitude: 108.9398, year: 1056 },
      { locationId: 4, name: '汴京', latitude: 34.7958, longitude: 114.3075, year: 1057 },
    ],
  },
  // ... 其他 10 条路线
];
```

### 3.4 绘制组件开发

创建 `frontend/src/modules/map/JourneyRoutes.tsx`:

```tsx
export function JourneyRoutes({ map, locations, showAll = true }: Props) {
  useEffect(() => {
    if (!map) return;

    routesToShow.forEach(route => {
      // 将路线的 waypoints 转换为坐标点
      const path = route.waypoints.map(waypoint => [
        waypoint.longitude,
        waypoint.latitude
      ]);

      // 创建折线
      const polyline = new AMap.Polyline({
        path,
        strokeColor: route.color,
        strokeOpacity: 0.8,
        strokeWeight: 4,
        // ... 其他配置
      });

      polyline.setMap(map);

      // 添加路线标注
      const midPoint = path[Math.floor(path.length / 2)];
      const label = new AMap.Text({
        text: route.name,
        position: midPoint,
        style: { /* 样式配置 */ }
      });
      label.setMap(map);
    });
  }, [map, locations]);

  return null; // 只在地图上绘制，不渲染 DOM
}
```

### 3.5 集成到地图容器

更新 `MapContainer.tsx`:

```tsx
<MapContainer
  locations={filteredLocations}
  onLocationClick={handleLocationSelect}
  focusOnLocationIds={selectedLocationIds}
  showJourneyRoutes={showJourneyRoutes} // 新增 prop
/>
```

### 3.6 侧边栏图例

在探索页面侧边栏添加旅程路线图例：

```tsx
<div className="space-y-3">
  <h3 className="font-semibold text-sm flex items-center gap-2">
    <Route className="h-4 w-4" />
    苏轼人生旅程
  </h3>
  <div className="space-y-2">
    {JOURNEY_ROUTES.map((route) => (
      <div
        key={route.id}
        className="flex items-start gap-2 text-xs p-2 rounded hover:bg-slate-100 cursor-pointer"
        onClick={() => {
          // 点击路线定位到第一个地点
          const firstWaypoint = route.waypoints[0];
          const location = locations?.find(loc =>
            loc.id === firstWaypoint.locationId ||
            loc.name.includes(firstWaypoint.name)
          );
          if (location) setSelectedLocation(location);
        }}
      >
        <div
          className="w-3 h-3 rounded-full shrink-0 mt-0.5"
          style={{ backgroundColor: route.color }}
        />
        <div className="flex-1">
          <div className="font-medium">{route.name}</div>
          <div className="text-muted-foreground text-xs">
            {route.yearRange} · {route.period}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
```

---

## 四、踩坑记录

### 问题 1: 地点 ID 不匹配

**现象**: 路线绘制位置错误

**原因**: 前端 journeyRoutes.ts 中使用的地点 ID 与后端数据库不一致

**解决**:
1. 运行种子脚本，获取最新的地点 ID 对照表
2. 更新前端 journeyRoutes.ts 中的所有地点 ID

### 问题 2: 路线不显示

**现象**: 地图上看不到路线

**原因**:
1. 部分地点在后端数据库中不存在
2. 坐标数据格式错误

**解决**:
1. 扩充后端地点数据到 22 个
2. 使用 waypoint 自带的坐标作为主要数据源，不依赖 locations prop

### 问题 3: 高德地图 Text 组件导入问题

**现象**: `AMap.Text is not a constructor`

**原因**: 需要确保高德地图的 Text 组件已正确加载

**解决**: 检查高德地图 API 配置，确保 Text 组件可用

---

## 五、效果展示

### 5.1 路线颜色方案

| 颜色 | 十六进制 | 代表意义 |
|------|----------|----------|
| 绿色 | #22c55e | 起始、希望 |
| 蓝色 | #3b82f6 | 仕途开始 |
| 青色 | #06b6d4 | 江南水乡 |
| 橙色 | #f59e0b | 仕途上升 |
| 红色 | #ef4444 | 人生危机 |
| 紫色 | #a855f7 | 荣宠 |
| 蓝绿 | #14b8a6 | 建设成就 |
| 深橙 | #f97316 | 继续外放 |
| 深红 | #dc2626 | 更深危机 |
| 深紫 | #7c3aed | 最远流放 |
| 灰色 | #6b7280 | 人生终点 |

### 5.2 可视化效果

（此处应有截图展示地图上的 11 条彩色路线）

---

## 六、技术总结

### 6.1 高德地图 API 使用

```typescript
// 绘制折线
const polyline = new AMap.Polyline({
  path: [[lng1, lat1], [lng2, lat2], ...],
  isOutline: true,           // 是否显示描边
  outlineColor: '#ffffff',   // 描边颜色
  borderWeight: 1,           // 描边宽度
  strokeColor: '#ff0000',    // 线条颜色
  strokeOpacity: 0.8,        // 透明度
  strokeWeight: 4,           // 线条宽度
  strokeStyle: 'solid',      // 线条样式：solid/dashed
  lineJoin: 'round',         // 拐角样式
  lineCap: 'round',          // 端点样式
  zIndex: 50,
});

// 添加文字标注
const label = new AMap.Text({
  text: '路线名称',
  anchor: 'center',
  position: [lng, lat],
  offset: new AMap.Pixel(0, -20),
  style: {
    'background-color': 'rgba(255, 255, 255, 0.9)',
    'border': '1px solid #ddd',
    'border-radius': '4px',
    'padding': '4px 8px',
    'font-size': '11px',
    'color': '#ff0000',
    'white-space': 'nowrap',
    'box-shadow': '0 2px 4px rgba(0,0,0,0.2)',
  },
});
```

### 6.2 组件设计要点

1. **无 DOM 渲染**: 组件返回 null，只在地图上绘制
2. **自动清理**: useEffect 返回时清理所有路线和标注
3. **响应式更新**: 依赖 map、locations、showAll 等 props 变化
4. **标签管理**: 单独管理 Text 标签数组，确保清理时能正确移除

---

## 七、下午优化 - 旅程详情交互

### 7.1 用户反馈

早上完成的功能得到了用户的高度评价，但提出了进一步优化建议：

> "点击左侧旅程图例，右侧定位不准，建议统一优化定位到这段旅程的起点，同时右侧弹窗不止显示这个地点，而是显示这段旅程的名字"

### 7.2 优化内容

根据用户反馈，下午进行了以下优化：

1. **定位优化**: 点击旅程图例后，地图定位到旅程的起点
2. **弹窗内容重构**: 显示旅程详情而非地点信息
   - 旅程名称作为标题（如"凤翔签判·初入仕途"）
   - 详细的故事描述
   - 旅程路线图（文字链形式）
   - 此期间创作的诗词列表
3. **数据结构增强**: 为每条路线添加 `story` 和 `poetries` 字段

### 7.3 数据结构更新

```typescript
export interface JourneyRoute {
  id: number;
  name: string;
  description: string;
  story: string; // 详细故事描述
  color: string;
  period: string;
  yearRange: string;
  poetries: {
    id: number;
    title: string;
    year?: number;
  }[]; // 这段旅程期间创作的诗词
  waypoints: {...};
}
```

### 7.4 故事数据示例

以"乌台诗案·贬谪黄州"为例：

```typescript
{
  id: 5,
  name: '乌台诗案·贬谪黄州',
  story: '元丰二年（1079 年），苏轼因"乌台诗案"被捕入狱，险些丧命。后经多方营救，贬为黄州团练副使。黄州四年，是苏轼人生的低谷，却是他文学创作的高峰。他躬耕东坡，自号"东坡居士"，写下了《念奴娇·赤壁怀古》《前赤壁赋》《后赤壁赋》等千古名篇。',
  poetries: [
    { id: 401, title: '念奴娇·赤壁怀古', year: 1082 },
    { id: 402, title: '前赤壁赋', year: 1082 },
    { id: 403, title: '后赤壁赋', year: 1082 },
    { id: 404, title: '定风波·莫听穿林打叶声', year: 1082 },
    { id: 405, title: '卜算子·黄州定慧院寓居作', year: 1082 },
    { id: 406, title: '浣溪沙·游蕲水清泉寺', year: 1082 },
  ],
}
```

### 7.5 弹窗效果

新的旅程详情弹窗包含：

```
┌─────────────────────────────────────────┐
│ 乌台诗案·贬谪黄州                    [X] │
│ [贬谪时期] 1079-1084                     │
├─────────────────────────────────────────┤
│ 元丰二年（1079 年），苏轼因"乌台诗案"   │
│ 被捕入狱，险些丧命。后经多方营救，贬   │
│ 为黄州团练副使。黄州四年，是苏轼人生   │
│ 的低谷，却是他文学创作的高峰...         │
├─────────────────────────────────────────┤
│ 🗺️ 旅程路线                              │
│ 湖州 → 汴京 → 黄州                       │
├─────────────────────────────────────────┤
│ 📖 此期间创作 (6 首)                      │
│ • 念奴娇·赤壁怀古        1082 年         │
│ • 前赤壁赋               1082 年         │
│ • 后赤壁赋               1082 年         │
│ ...                                      │
├─────────────────────────────────────────┤
│ 📍 起点                                   │
│ 湖州 - 被捕入京                           │
└─────────────────────────────────────────┘
```

### 7.6 实现代码

**点击图例处理**:

```typescript
onClick={() => {
  setSelectedJourney(route);
  const firstWaypoint = route.waypoints[0];
  if (firstWaypoint) {
    // 定位到起点坐标
    const startLocation = locations?.find(loc =>
      loc.id === firstWaypoint.locationId ||
      loc.name.includes(firstWaypoint.name)
    );
    if (startLocation) {
      setSelectedLocation(startLocation);
    }
  }
}}
```

**弹窗条件渲染**:

```typescript
// 旅程详情弹窗（优先级高）
{selectedJourney && (
  <div className="journey-detail-modal">
    <h3>{selectedJourney.name}</h3>
    <p>{selectedJourney.story}</p>
    <div>旅程路线：{waypoints.map(...)}</div>
    <div>诗词列表：{poetries.map(...)}</div>
  </div>
)}

// 地点详情弹窗（无旅程时显示）
{selectedLocation && !selectedJourney && (
  <div className="location-detail-modal">
    ...
  </div>
)}
```

### 7.7 11 条旅程的故事数据

为所有 11 条旅程路线添加了详细的故事描述和诗词关联：

| ID | 名称 | 诗词数量 | 故事字数 |
|----|------|----------|----------|
| 1 | 少年求学·出川入京 | 0 | 120 |
| 2 | 凤翔签判·初入仕途 | 2 | 100 |
| 3 | 杭州通判·江南初仕 | 3 | 110 |
| 4 | 山东三州·知州历练 | 3 | 130 |
| 5 | 乌台诗案·贬谪黄州 | 6 | 120 |
| 6 | 回京拜相·短暂辉煌 | 1 | 100 |
| 7 | 再知杭州·疏浚西湖 | 1 | 120 |
| 8 | 颍州扬州·地方任职 | 0 | 80 |
| 9 | 一贬再贬·远谪岭南 | 2 | 120 |
| 10 | 渡海贬儋·天涯海角 | 2 | 140 |
| 11 | 北归中原·魂归常州 | 2 | 150 |

---

## 九、项目数据更新

| 指标 | DAY4 | DAY5 | 增长 |
|------|------|------|------|
| 地点数量 | 11 | 22 | +11 |
| 旅程路线 | 0 | 11 | +11 |
| 故事描述 | 0 | 11 | +11 |
| 诗词关联 | 0 | 22 | +22 |
| 代码行数 | ~5000 | ~6500 | +1500 |

---

## 十、后续优化

1. **诗词详情联动**: 点击旅程详情中的诗词，跳转到诗词详情页
2. **动画效果**: 路线绘制的动画过渡，沿路线行进效果
3. **悬停信息**: 鼠标悬停路线显示简要信息
4. **时间轴联动**: 点击时间轴自动高亮对应路线

---

## 十一、结尾感言

今天的工作让地图真正"活"了起来。11 条彩色路线在地图上交织，就像苏轼跌宕起伏的人生轨迹。从绿色的出川入京，到红色的乌台诗案，再到灰色的北归卒常州，每一段旅程都用颜色诉说着苏轼的故事。

下午的优化更是让旅程详情变得丰富起来。点击左侧图例，不仅能看到路线，还能读到这段旅程背后的故事，了解苏轼在此期间创作的经典诗词。特别是黄州时期，6 首代表作的关联，让人直观感受到贬谪时期反而是苏轼文学创作的高峰。

特别有感触的是"渡海贬儋"这段故事。62 岁高龄，被贬到当时的蛮荒之地海南，还能办学传道，培养出了海南历史上第一位举人，这种精神令人敬佩。他在儋州三年，著书立说，传播中原文化，为海南的文化发展做出了重要贡献。

明天要继续优化分享卡片功能，让用户也能把这份感动分享出去。

---

*（配图建议：完整地图路线截图、侧边栏图例截图、贬谪岭南路线特写）**
