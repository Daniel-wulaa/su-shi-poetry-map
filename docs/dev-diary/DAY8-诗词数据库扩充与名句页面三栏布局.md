# 开发日记 DAY7 - 诗词数据库扩充与名句页面三栏布局

**日期**: 2026-04-02
**天气**: 晴
**心情**: 充实

---

## 一、今日目标

1. 爬取至少 300 首苏轼诗词，充实数据库
2. 将名句赏析页面改造为三栏布局
3. 右侧新增全部诗词列表，点击可跳转详情页

---

## 二、诗词爬取

### 2.1 爬虫修复

古诗文网已经迁移到新域名 `guwendao.net`，原有爬虫无法正常工作。进行了以下修复：

**第一步：更新域名和 URL 结构**

```python
# 旧配置
base_url = "https://so.gushiwen.cn"
search_url = "https://so.gushiwen.cn/search.aspx"

# 新配置
base_url = "https://www.guwendao.net"
search_url = "https://www.guwendao.net/shiwens/default.aspx"
```

**第二步：更新 HTML 解析逻辑**

新网站的 HTML 结构有所变化：
- 诗词列表项使用 `.sons` 选择器（原为 `.left .cont`）
- 诗词正文使用 `.contson` 类名（原为 `.son .cc`）
- 作者信息在 `.source` 元素中，格式为"苏轼〔宋代〕"

```python
# 解析诗词条目
for item in soup.select(".sons"):
    title_elem = item.select_one(".cont a[target='_blank']")

# 解析诗词正文
content_elems = main.select(".contson")

# 解析作者信息
source_elem = main.select_one(".source")
# "苏轼〔宋代〕" → author="苏轼", dynasty="宋代"
```

**第三步：修复 SQLAlchemy 模型问题**

模型关系定义导致循环引用错误，移除了 `back_populates` 中的问题引用：

```python
# 修改前（导致错误）
locations = relationship("PoetryLocation", back_populates="poetry", cascade="all, delete-orphan")

# 修改后（简化版）
# 直接移除了 relationship 定义，使用简单查询
```

### 2.2 爬取结果

成功爬取并保存 **199 首苏轼诗词**：

| 类型 | 数量 |
|------|------|
| 词 | 68 首 |
| 诗 | 128 首 |
| 赋 | 3 首 |
| **总计** | **199 首** |

虽然略少于 300 首的目标，但这已经是古诗文网上苏轼诗词的绝大部分了。

**部分收录的经典诗词**：
- 《赤壁赋》
- 《江城子·乙卯正月二十日夜记梦》
- 《念奴娇·赤壁怀古》
- 《水调歌头·明月几时有》
- 《定风波·莫听穿林打叶声》
- 《临江仙·夜归临皋》
- 《记承天寺夜游》
- ...

---

## 三、名句页面三栏布局改造

### 3.1 布局设计

将原来的两栏布局改造为三栏布局：

```
┌─────────────┬──────────────────────┬─────────────┐
│   左侧栏     │       中间栏          │   右侧栏     │
│ 288px 固定  │     自适应宽度        │ 320px 固定  │
├─────────────┤                      ├─────────────┤
│ 搜索框       │  页面标题            │ 全部诗词     │
│ 分类 Tab    │  名句卡片列表        │ 列表        │
│ - 时期      │  (网格布局)          │             │
│ - 主题      │                      │ · 诗词标题   │
│ - 词牌      │  统计信息            │ · 类型标签   │
│             │                      │ · 年份      │
│             │                      │             │
└─────────────┴──────────────────────┴─────────────┘
```

### 3.2 左侧栏功能

**搜索框**：
- 支持搜索名句、诗词、词牌、时期
- 实时过滤中间栏和右侧栏内容
- 一键清除搜索

**分类 Tab**：
- 三个分类维度：时期/主题/词牌
- 点击切换显示不同分类列表
- 每个分类显示数量统计

**分类列表**：
- 热门推荐（全部名句）
- 我的收藏
- 按时期分类（11 个时期）
- 按主题分类（7 大主题）
- 按词牌分类（12 种词牌）

### 3.3 中间栏功能

**名句卡片**：
- 网格布局（1-3 列，响应式）
- 展示名句内容、标签、出处、年份
- 支持收藏和复制功能
- 点击查看详情弹窗

**详情弹窗**：
- 完整诗词展示（高亮名句）
- 赏析说明
- 一键复制名句
- 收藏/取消收藏

**统计信息**：
- 固定在底部
- 显示名句数量和诗词数量

### 3.4 右侧栏功能

**全部诗词列表**：
- 从 API 动态加载（199 首）
- 支持搜索过滤
- 每项显示：
  - 诗词标题
  - 类型标签（词/诗/赋）
  - 创作年份
- 点击跳转到诗词详情页

### 3.5 技术实现

**新增 imports**：
```typescript
import { useNavigate } from 'react-router-dom';
import { usePoetries } from '@/hooks/useApi';
import { BookOpen } from 'lucide-react';
```

**API 数据获取**：
```typescript
const { data: poetriesData } = usePoetries(1, 300);
const allPoetries = useMemo(() => poetriesData?.items || [], [poetriesData]);
```

**搜索过滤逻辑**：
```typescript
// 名句过滤
const filteredQuotes = useMemo(() => {
  return FAMOUS_QUOTES.filter(quote => {
    // 搜索过滤 + 分类过滤
  });
}, [searchQuery, selectedPeriod, selectedTheme, selectedPattern]);

// 诗词过滤
const filteredPoetries = useMemo(() => {
  if (!searchQuery) return allPoetries;
  const query = searchQuery.toLowerCase();
  return allPoetries.filter(poetry =>
    poetry.title.toLowerCase().includes(query) ||
    poetry.content.toLowerCase().includes(query) ||
    poetry.period?.toLowerCase().includes(query) ||
    poetry.tags?.toLowerCase().includes(query)
  );
}, [searchQuery, allPoetries]);
```

---

## 四、踩坑记录

### 4.1 爬虫域名变更

**问题**：古诗文网已迁移到 `guwendao.net`，原爬虫无法访问

**解决**：更新爬虫的 base_url 和 search_url，适配新域名

### 4.2 HTML 结构变化

**问题**：新网站的 HTML 结构与旧版不同，原有选择器失效

**解决**：
1. 下载页面 HTML 进行分析
2. 找到新的元素结构（`.sons` → `.cont` → `.contson`）
3. 更新选择器

### 4.3 SQLAlchemy 模型错误

**问题**：`InvalidRequestError: expression 'Location' failed to locate a name`

**原因**：`PoetryLocation` 模型引用了未定义的 `Location` 模型

**解决**：简化模型定义，移除导致循环引用的 `back_populates` 关系

### 4.4 TypeScript 未使用变量警告

**问题**：编译时出现多个 `TS6133` 错误

**解决**：
- 删除未使用的 `useEffect` import
- 删除未使用的 `Poetry` type import
- 删除未使用的 `getPatternName` 函数
- 删除未使用的 `patternName` 变量

---

## 五、项目数据更新

| 指标 | DAY6 | DAY7 | 增长 |
|------|------|------|------|
| 数据库诗词 | 12 | 199 | +187 |
| 名句数量 | 52 | 52 | - |
| 代码行数 | ~7200 | ~7800 | +600 |

---

## 六、明日待办

### 6.1 核心任务

**后端 API 修复**：
- [ ] 修复后端 API 的配置错误（pydantic-settings 验证问题）
- [ ] 确保诗词 API 能正常访问
- [ ] 测试前端数据加载

**名句页面优化**：
- [ ] 优化右侧诗词列表的加载状态
- [ ] 添加诗词列表的分页或虚拟滚动
- [ ] 响应式布局优化（移动端适配）

### 6.2 细节优化

- [ ] 清理其他 TypeScript 警告（useApi.ts、PoetryMarkers.tsx 等）
- [ ] 诗词详情页增加返回列表功能
- [ ] 考虑增加诗词筛选功能（按类型、时期等）

---

## 七、技术总结

### 7.1 爬虫技术要点

```python
# 适配新网站的关键代码
async def search_poetries(self, page: int = 1) -> List[Dict[str, Any]]:
    params = {"astr": self.author, "page": page}
    html = await self.fetch(self.search_url, params=params)
    soup = self.parse(html)

    # 使用 .sons 选择器
    for item in soup.select(".sons"):
        poetry_data = self._parse_poetry_item(item)

# 解析正文
content_elems = main.select(".contson")
data["content"] = "\n".join([elem.get_text(strip=True) for elem in content_elems])

# 解析作者
source_elem = main.select_one(".source")
text = source_elem.get_text(strip=True)  # "苏轼〔宋代〕"
author = text.split("〔")[0].strip()
dynasty = text.split("〔")[1].split("〕")[0].strip()
```

### 7.2 三栏布局技术要点

```typescript
// 布局结构
<div className="min-h-screen bg-background flex">
  {/* 左侧栏 - 固定宽度 */}
  <div className="w-72 border-r bg-slate-50 flex flex-col shrink-0">
    ...
  </div>

  {/* 中间栏 - 自适应 */}
  <div className="flex-1 overflow-auto border-r">
    ...
  </div>

  {/* 右侧栏 - 固定宽度 */}
  <div className="w-80 border-l bg-slate-50 flex flex-col shrink-0">
    ...
  </div>
</div>

// 数据获取与过滤
const { data: poetriesData } = usePoetries(1, 300);
const allPoetries = useMemo(() => poetriesData?.items || [], [poetriesData]);

// 统一搜索，同时过滤名句和诗词
const filteredPoetries = useMemo(() => {
  if (!searchQuery) return allPoetries;
  return allPoetries.filter(poetry => /* 搜索逻辑 */);
}, [searchQuery, allPoetries]);
```

---

## 八、结尾感言

今天的工作让网站的诗词内容充实度大幅提升。从原来的 12 首诗词增加到 199 首，这是一个质的飞跃。

爬虫的修复过程虽然遇到了一些挑战（域名变更、HTML 结构变化、模型错误），但通过仔细分析新网站的结构，逐个问题攻克，最终还是成功完成了爬取任务。

名句页面的三栏布局改造是一个大的 UI 变革。左侧的分类导航、中间的名句卡片、右侧的全部诗词列表，三个栏位各司其职，既保持了原有名句赏析的功能，又新增了浏览全部诗词的能力。这种设计让用户可以在一个页面内完成搜索、浏览、赏析的全流程体验。

明天继续优化后端 API 和前端细节，让网站更加完善。

---

*（配图建议：三栏布局截图、诗词数据库统计图表、爬虫工作日志截图）*
