# 开发日记 DAY4 - 内容扩充与体验优化

**日期**: 2026-04-01
**天气**: 晴转多云
**心情**: 充实而满足

---

## 一、今日目标

昨天完成了分享卡片和性能优化，项目的基础功能已经完备。今天的重点转向内容扩充和用户体验优化：

1. **新增页面开发** - 生平年表页、名句赏析页
2. **内容爬取** - 从 sudongpo.org 爬取更多内容
3. **学术研究页** - 展示学者研究资料
4. **书法欣赏页** - 展示苏轼书法作品
5. **名句扩充** - 从 12 条扩展到 50+ 条

---

## 二、新增页面开发

### 2.1 生平年表页

**需求**: 以时间轴形式展示苏轼完整生平，让用户一目了然地了解他的人生轨迹。

**设计思路**:

```
时间轴设计：
- 垂直布局，时间从上到下
- 事件交替显示在时间轴左右两侧
- 不同类型事件使用不同颜色和图标
- 支持点击查看详情
```

**事件分类**:

| 类型 | 颜色 | 图标 | 示例 |
|------|------|------|------|
| 出生 | 绿色 | 🌱 | 出生于眉山 |
| 家庭 | 粉色 | 💕 | 娶王弗 |
| 成就 | 金色 | 🏆 | 进士及第 |
| 职业 | 蓝色 | 💼 | 知杭州 |
| 危机 | 红色 | ⚠️ | 乌台诗案 |
| 创作 | 紫色 | ✍️ | 作《赤壁赋》 |
| 历史 | 灰色 | 📜 | 王安石变法 |
| 逝世 | 黑色 | 🕯️ | 卒于常州 |

**实现代码**:

```typescript
const LIFE_EVENTS = [
  { year: 1037, title: '出生', description: '生于眉州眉山', type: 'birth', icon: '🌱' },
  { year: 1057, title: '进士及第', description: '与弟苏辙同科及第', type: 'achievement', icon: '🏆' },
  { year: 1079, title: '乌台诗案', description: '因诗获罪，贬黄州', type: 'crisis', icon: '⚠️' },
  // ... 共 26 个事件
];
```

**踩坑记录**:

> 最初只准备了 26 个事件，但实际编写时发现很多重要节点缺失。最终扩充到 50+ 个事件，包括父母去世、子女出生、多次贬谪等。

---

### 2.2 名句赏析页

**需求**: 展示苏轼的经典名句，点击后显示完整诗词和赏析。

**数据结构**:

```typescript
interface FamousQuote {
  id: number;
  content: string;           // 名句
  source: string;            // 出处
  fullPoetry: string;        // 完整诗词
  appreciation: string;      // 赏析
  period: string;            // 创作时期
  tags: string[];            // 标签
}
```

**名句扩充过程**:

从最初的 12 条扩展到 52 条，按照创作时期分类：

| 时期 | 数量 | 代表名句 |
|------|------|----------|
| 早期 | 8 条 | "人生到处知何似，应似飞鸿踏雪泥" |
| 密州 | 6 条 | "十年生死两茫茫，不思量，自难忘" |
| 黄州 | 15 条 | "人生如梦，一尊还酹江月" |
| 杭州 | 8 条 | "欲把西湖比西子，淡妆浓抹总相宜" |
| 惠州 | 6 条 | "日啖荔枝三百颗，不辞长作岭南人" |
| 儋州 | 5 条 | "九死南荒吾不恨，兹游奇绝冠平生" |
| 其他 | 4 条 | "不识庐山真面目，只缘身在此山中" |

**高亮功能实现**:

这是今天的一个技术亮点。点击名句后，需要显示完整诗词并将名句高亮。

```typescript
function highlightQuote(fullText: string, quote: string) {
  // 转义特殊字符，防止正则表达式错误
  const escapedQuote = quote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuote})`, 'g');
  return fullText.replace(regex, '<mark class="bg-yellow-200 text-amber-900 px-1 rounded">$1</mark>');
}
```

**使用 dangerouslySetInnerHTML 渲染**:

```tsx
<div dangerouslySetInnerHTML={{
  __html: highlightQuote(quote.fullPoetry, quote.content)
}} />
```

**踩坑记录**:

> **问题**: 某些名句包含特殊标点，高亮失败。
>
> **排查**: 发现是正则表达式中的特殊字符未转义。
>
> **解决**: 添加了转义逻辑，将 `.` `*` `?` 等特殊字符转义。

---

## 三、内容爬取

### 3.1 目标网站分析

目标网站：https://www.sudongpo.org/

这是一个专门介绍苏东坡的 WordPress 网站，内容丰富：

```
网站结构：
├── 生平
│   ├── 三苏年谱
│   ├── 东坡纪年录
│   └── 人生地图
├── 诗词文书画
│   ├── 书法作品
│   ├── 诗词集
│   └── 尺牍文稿
├── 人物评价研究
│   ├── 苏轼研究资料
│   └── 学术论文
└── 相关
```

### 3.2 爬虫开发

WordPress 提供了 REST API，可以直接获取文章内容：

```python
BASE_URL = "https://www.sudongpo.org/wp-json/wp/v2"

def fetch_posts(category=None, per_page=100):
    params = {"per_page": per_page}
    if category:
        params["categories"] = category
    response = requests.get(f"{BASE_URL}/posts", params=params)
    return response.json()

def fetch_categories():
    response = requests.get(f"{BASE_URL}/categories")
    return response.json()
```

**爬取结果**:

| 类别 | 数量 |
|------|------|
| 人物评价研究 | 48 篇 |
| 生平 | 62 篇 |
| 相关 | 34 篇 |
| 诗词文书画 | 52 篇 |
| **总计** | **196 篇** |

### 3.3 数据清洗

爬取的数据需要清洗后才能使用：

```python
def clean_content(html_content):
    # 移除脚本和样式
    soup = BeautifulSoup(html_content, 'html.parser')

    # 移除广告和无关元素
    for tag in soup(['script', 'style', 'iframe']):
        tag.decompose()

    # 提取正文
    content_div = soup.find('div', class_='entry-content')
    if content_div:
        return content_div.get_text('\n', strip=True)
    return soup.get_text('\n', strip=True)
```

---

## 四、学术研究页

### 4.1 数据结构

学术研究页分为三个部分：学者、著作、论文。

**学者数据**:

```typescript
const SCHOLARS = [
  {
    id: 1,
    name: '王水照',
    title: '复旦大学教授',
    avatar: '👨‍🏫',
    introduction: '复旦大学中文系教授，博士生导师...',
    works: ['《苏轼论集》', '《苏轼选集》', '《苏轼研究史》'],
    tags: ['苏轼研究', '宋代文学', '唐宋八大家'],
  },
  // ... 共 6 位学者
];
```

**研究著作**:

```typescript
const RESEARCH_BOOKS = [
  {
    id: 1,
    title: '王状元集百家注分类东坡先生诗',
    author: '王十朋（编）',
    dynasty: '南宋',
    description: '收录黄庭坚至王十朋三兄弟凡九十六家注...',
    tags: ['诗集注释', '宋代', '百家注'],
    category: '古籍注释',
  },
  // ... 共 8 部著作
];
```

**学术论文**:

```typescript
const RESEARCH_PAPERS = [
  {
    id: 1,
    title: '论苏轼的"自然"文艺观',
    author: '王水照',
    journal: '《文学评论》',
    year: 1992,
    summary: '探讨苏轼文艺思想中"自然"概念的内涵...',
    tags: ['文艺观', '自然', '美学思想'],
  },
  // ... 共 6 篇论文
];
```

### 4.2 Tabs 组件

使用 Radix UI 的 Tabs 组件来切换三个部分：

```typescript
import * as TabsPrimitive from "@radix-ui/react-tabs";

const Tabs = TabsPrimitive.Root;
const TabsList = TabsPrimitive.List;
const TabsTrigger = TabsPrimitive.Trigger;
const TabsContent = TabsPrimitive.Content;
```

**使用方式**:

```tsx
<Tabs defaultValue="scholars">
  <TabsList>
    <TabsTrigger value="scholars">研究学者</TabsTrigger>
    <TabsTrigger value="books">研究著作</TabsTrigger>
    <TabsTrigger value="papers">学术论文</TabsTrigger>
  </TabsList>

  <TabsContent value="scholars">...</TabsContent>
  <TabsContent value="books">...</TabsContent>
  <TabsContent value="papers">...</TabsContent>
</Tabs>
```

**踩坑记录**:

> **问题**: `[plugin:vite:import-analysis] Failed to resolve import "@radix-ui/react-tabs"`
>
> **原因**: 只创建了组件文件，没有安装依赖包。
>
> **解决**: 运行 `npm install @radix-ui/react-tabs` 并重启开发服务器。
>
> **教训**: 添加新组件时，记得同时安装依赖和更新配置。

---

## 五、书法欣赏页

### 5.1 作品收集

苏轼是"宋四家"之一，书法造诣极高。收集了 7 幅代表作品：

| 作品 | 类型 | 收藏地 | 备注 |
|------|------|--------|------|
| 黄州寒食诗帖 | 行书 | 台北故宫博物院 | 天下第三行书 |
| 渡海帖 | 行书 | 台北故宫博物院 | 晚年代表作 |
| 前赤壁赋 | 行书 | 台北故宫博物院 | 文学 + 书法双璧 |
| 李白仙诗卷 | 行书 | 上海博物馆 | - |
| 次韵秦太虚诗帖 | 行书 | 台北故宫博物院 | - |
| 天际乌云帖 | 行书 | 私人收藏 | - |
| 新岁展庆帖 | 行书 | 北京故宫博物院 | 尺牍 |

### 5.2 页面设计

```tsx
<Card onClick={() => setSelectedWork(work)}>
  <img src={work.image} alt={work.title} />
  <h3>{work.title}</h3>
  <div className="tags">
    {work.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
  </div>
</Card>
```

**详情弹窗**:

- 作品高清图
- 描述信息
- 释文（繁体竖排）
- 标签

---

## 六、导航优化

随着页面增多，导航栏需要重新组织：

```tsx
<nav>
  <Link to="/">首页</Link>
  <Link to="/explore">探索</Link>
  <Link to="/research">研究</Link>
  <Link to="/calligraphy">书法</Link>
  <Link to="/quotes">名句</Link>
</nav>
```

**路由配置**:

```tsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/explore" element={<ExplorePage />} />
  <Route path="/research" element={<ResearchPage />} />
  <Route path="/timeline" element={<TimelinePage />} />
  <Route path="/calligraphy" element={<CalligraphyPage />} />
  <Route path="/quotes" element={<QuotesPage />} />
  <Route path="/poetry/:id" element={<PoetryDetail />} />
</Routes>
```

---

## 七、优化方案追踪

根据 `/docs/优化方案.md` 的规划，今天的完成情况：

| 模块 | 路由 | 状态 |
|------|------|------|
| 书法作品 | `/calligraphy` | ✅ 已完成 |
| 名句赏析 | `/quotes` | ✅ 已完成 |
| 学术研究 | `/research` | ✅ 已完成 |
| 生平年表 | `/timeline` | ✅ 已完成 |
| 家庭关系 | `/family` | ⏳ 待开发 |

---

## 八、项目数据更新

| 指标 | DAY3 | DAY4 | 增长 |
|------|------|------|------|
| 页面数量 | 4 | 8 | +4 |
| 名句数量 | 12 | 52 | +40 |
| 学者数量 | 0 | 6 | +6 |
| 著作数量 | 0 | 8 | +8 |
| 书法作品 | 0 | 7 | +7 |
| 爬取文章 | 0 | 196 | +196 |
| 代码行数 | ~2000 | ~5000 | +3000 |

---

## 九、今日总结

### 技术收获

1. **WordPress API 爬虫** - 学会了如何快速爬取 WordPress 网站内容
2. **Radix UI 组件** - 掌握了 headless UI 组件库的使用方式
3. **文本高亮技术** - 使用正则 + dangerouslySetInnerHTML 实现高亮

### 内容收获

1. 深入了解了苏轼的人生经历和文学成就
2. 收集了大量学术研究资料
3. 欣赏了苏轼的书法作品

### 踩坑记录

| 问题 | 原因 | 解决 |
|------|------|------|
| Radix UI 导入失败 | 未安装依赖 | npm install + 重启 dev |
| 名句高亮失效 | 特殊字符未转义 | 添加正则转义逻辑 |
| 繁简转换问题 | 部分诗词是繁体 | 统一转为简体或保留原貌 |

---

## 十、明日计划

1. **分享卡片功能完善** - 昨天的功能还没完全做好
2. **诗词详情页** - 点击诗词后显示完整详情
3. **家庭关系页面** - 三苏关系图谱
4. **响应式优化** - 移动端适配

---

**结尾感言**:

今天的工作重点是内容填充，让网站从一个空架子变成了内容丰富的文化站点。特别是名句赏析页，从 12 条扩展到 52 条，每一条都包含了完整的诗词和赏析。点击名句后，完整诗词以黄色高亮显示出那句经典，视觉效果很好。

学术研究页的学者资料让我印象深刻。王水照、曾枣庄、孔凡礼等学者对苏轼研究的贡献令人敬佩。他们的著作和论文为后人研究苏轼提供了宝贵资料。

书法欣赏页则展示了苏轼作为"宋四家"之一的艺术成就。《黄州寒食诗帖》被誉为"天下第三行书"，果然名不虚传。

这个项目越来越有样子了。从最初的一个地图想法，发展到现在的综合性苏轼文化网站，每一步都很有意义。

---

*（配图建议：名句赏析页高亮效果截图、学术研究页 tabs 切换效果、书法作品展示页、开发日志四连图）**
