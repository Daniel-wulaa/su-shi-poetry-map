# 开发日记 DAY6 - 研究页面充实与分享功能集成

**日期**: 2026-04-01
**天气**: 晴
**心情**: 充实

---

## 一、今日目标

1. 完成分享卡片功能的最后集成
2. 充实学术研究页面的详情内容
3. 优化首页首屏视觉效果

---

## 二、首页背景图优化

### 2.1 需求分析

用户反馈首页首屏过于空白，需要增加水墨风格的底图来营造文化氛围。

### 2.2 实现过程

**第一步：背景图集成**

用户通过即梦 AI 生成了一张精美的水墨风格背景图，包含：
- 苏轼戴斗笠蓑衣的剪影站在左侧
- 淡墨远山和云雾缭绕
- 大面积留白供标题展示
- 色调淡雅，低饱和度

**第二步：代码集成**

```tsx
<section className="relative h-screen flex items-center justify-center overflow-hidden">
  {/* 水墨背景图 */}
  <div
    className="absolute inset-0 bg-cover bg-center opacity-60"
    style={{ backgroundImage: 'url(/hero-bg.png)' }}
  />
  {/* 渐变叠加 - 保证文字可读性 */}
  <div className="absolute inset-0 bg-gradient-to-b from-slate-50/40 via-slate-50/60 to-background/80" />
  {/* 内容 */}
  ...
</section>
```

**第三步：透明度调整**

用户反馈第一次集成后背景图太淡，几乎看不到。调整：
- 背景图透明度：`opacity-30` → `opacity-60`
- 渐变遮罩：`from-slate-50/60` → `from-slate-50/40`

### 2.3 跳转链接修正

修正首页两个按钮的跳转链接：
- **探索地图**：`/map` → `/explore`（新的探索页面）
- **浏览诗词**：`/map` → `/quotes`（名句赏析页面）

---

## 三、分享卡片功能集成

### 3.1 功能概述

分享卡片模块已有基础实现，今日完成与页面集成：

| 组件 | 功能 |
|------|------|
| `ShareModal.tsx` | 分享弹窗组件 |
| `CardPreview.tsx` | 卡片预览（三种样式） |
| `cardGenerator.ts` | 卡片生成工具 |

### 3.2 集成到诗词详情页

在 `PoetryDetail.tsx` 中添加分享按钮：

```tsx
<Button
  variant="outline"
  size="icon"
  onClick={() => setShowShareModal(true)}
>
  <Share className="w-5 h-5" />
</Button>
```

### 3.3 集成到探索页面

在探索页面的诗词弹窗中添加分享功能：

1. 引入 `ShareModal` 组件
2. 添加 `showPoetryShare` 状态
3. 在诗词详情弹窗中添加分享按钮
4. 将 `LocalPoetry` 数据转换为 `Poetry` 类型

**类型转换处理**：

```tsx
<ShareModal
  poetry={{
    id: selectedPoetry.id,
    title: selectedPoetry.title,
    content: selectedPoetry.content,
    dynasty: selectedPoetry.dynasty,
    author: selectedPoetry.author,
    year: selectedPoetry.year ?? null,
    period: selectedPoetry.period ?? null,
    genre: selectedPoetry.genre ?? null,
    tags: selectedPoetry.tags?.join(',') ?? null,
    background: selectedPoetry.background ?? null,
    annotations: selectedPoetry.annotations ?? null,
    translations: selectedPoetry.translations ?? null,
    year_range: null,
    created_at: '',
    updated_at: null,
  }}
  open={showPoetryShare}
  onClose={() => setShowPoetryShare(false)}
/>
```

### 3.4 卡片样式

提供三种卡片样式供用户选择：
- **古典**：`from-amber-50 to-orange-100`
- **水墨**：`from-slate-100 to-slate-200`
- **简约**：`from-white to-slate-50`

### 3.5 分享操作

- **下载卡片**：使用 `html-to-image` 生成 PNG 图片
- **复制到剪贴板**：支持直接粘贴到社交平台

---

## 四、学术研究页面充实

### 4.1 问题分析

学术研究页面的著作和论文详情页内容空白，点击后只有基本信息，没有详细内容。

### 4.2 研究著作扩充

将研究著作从 8 部扩充到 10 部，新增：
- 《苏轼词编年校注》（邹同庆、王宗堂）
- 《苏轼全集校注》（张志烈、马德富、周裕锴）

**数据结构增强**：

```typescript
interface ResearchBook {
  id: number;
  title: string;
  author: string;
  dynasty: string;
  description: string;      // 内容简介
  detail: string;           // 详细介绍（新增）
  tags: string[];
  category: string;
}
```

**详细介绍示例**（《苏轼年谱》）：

> 本书以丰富的史料为基础，广泛征引正史、方志、笔记、诗文集等各类文献，对苏轼的生平进行了全面系统的考证。每年之下，先列苏轼行迹，次列交游，再列诗文系年，体例严谨，考证精审。

### 4.3 学术论文扩充

将学术论文从 6 篇扩充到 10 篇，新增：
- 《苏轼词的艺术成就》（叶嘉莹）
- 《苏轼的儒释道思想融合》（张惠民）
- 《论苏轼的史论文学》（莫砺锋）
- 《苏轼与宋代士大夫文化》（内山精也）

**数据结构大幅增强**：

```typescript
interface ResearchPaper {
  id: number;
  title: string;
  author: string;
  journal: string;
  year: number;
  summary: string;          // 论文摘要
  detail: string;           // 详细内容
  keyPoints: string[];      // 核心论点（新增）
  quotes: string[];         // 相关名句（新增）
  analysis: string;         // 深度赏析（新增）
  tags: string[];
}
```

### 4.4 核心论点

每篇论文提炼 3-5 个核心论点，条目式展示：

```tsx
{selectedPaper.keyPoints && (
  <ul className="space-y-2">
    {selectedPaper.keyPoints.map((point, i) => (
      <li key={i} className="flex items-start gap-2 text-muted-foreground">
        <span className="text-primary mt-1">•</span>
        <span>{point}</span>
      </li>
    ))}
  </ul>
)}
```

### 4.5 相关名句

每条论文关联 2-3 句相关名句：

**示例**（《苏轼豪放词风的形成》）：
- 苏轼《江城子·密州出猎》："老夫聊发少年狂，左牵黄，右擎苍。"
- 苏轼《念奴娇·赤壁怀古》："大江东去，浪淘尽，千古风流人物。"
- 刘辰翁评："词至东坡，倾荡磊落，如诗如文，如天地奇观。"

### 4.6 深度赏析

为每篇论文生成 500-800 字的深度赏析，包括：
- 论文的学术贡献和创新点
- 研究方法和论证特点
- 学术价值和局限性评价
- 与相关研究的关联

**示例**（《论苏轼的"自然"文艺观》）：

> 王水照先生此文是研究苏轼文艺观的经典之作。文章的最大贡献在于将散见于苏轼各篇文章中的"自然"论述进行了系统梳理，提炼出三层内涵的理论框架。特别是将"随物赋形"与苏轼的绘画理论相联系，揭示了其文艺思想的贯通性。文中引用《答谢民师书》《文说》等苏轼自述，论证有力。此文的局限在于对"自然"与"功夫"的关系讨论不够充分，实际上苏轼也强调"绚烂之极归于平淡"，并非完全否定技巧。

### 4.7 学者详情优化

为学者详情弹窗添加：
- 主要著作列表（网格布局）
- 学术评价提示框（琥珀色背景）

---

## 五、踩坑记录

### 问题 1: TypeScript 类型不兼容

**现象**：分享卡片集成时报错 `Type 'number | undefined' is not assignable to type 'number | null'`

**原因**：`LocalPoetry` 类型与 `Poetry` 类型的字段定义不完全一致

**解决**：使用空值合并运算符 `??` 进行类型转换：
```typescript
year: selectedPoetry.year ?? null,
period: selectedPoetry.period ?? null,
```

### 问题 2: 未使用的导入警告

**现象**：编译警告 `ScrollArea` 和 `ExternalLink` 未使用

**解决**：清理未使用的 import 语句

---

## 六、技术总结

### 6.1 分享卡片技术要点

```typescript
// 使用 html-to-image 生成图片
import { toPng } from 'html-to-image';

const dataUrl = await toPng(element, {
  quality: 1,
  pixelRatio: 2,  // 2x 分辨率
  backgroundColor: '#ffffff',
  cacheBust: true,
});
```

### 6.2 论文数据结构设计

采用分层结构设计：
1. **summary** - 一句话摘要（50 字）
2. **detail** - 详细内容（100-200 字）
3. **keyPoints** - 核心论点（3-5 条）
4. **quotes** - 相关名句（2-3 条）
5. **analysis** - 深度赏析（500-800 字）

这种设计满足了不同阅读深度的需求：快速浏览 → 了解要点 → 深入阅读

### 6.3 学术内容合规性

对于现代学术论文，采用"合理使用"原则：
- 不直接爬取全文（版权问题）
- 生成摘要和赏析（原创内容）
- 引用名句（符合引用规范）
- 提供期刊信息（指引官方来源）

---

## 七、项目数据更新

| 指标 | DAY5 | DAY6 | 增长 |
|------|------|------|------|
| 研究著作 | 8 | 10 | +2 |
| 学术论文 | 6 | 10 | +4 |
| 深度赏析 | 0 | 10 | +10 |
| 相关名句 | 0 | 30+ | +30 |
| 核心论点 | 0 | 40+ | +40 |
| 代码行数 | ~6500 | ~7200 | +700 |

---

## 八、明日待办

### 8.1 核心任务

**首页增加视频入口**

- [ ] 在首页"关于苏轼"部分添加视频播放入口
- [ ] 链接到百度百科苏轼词条的首条视频
- [ ] 设计视频封面和播放按钮样式
- [ ] 考虑嵌入播放还是跳转播放

**实现建议**：

```tsx
// 方案一：跳转播放（简单）
<Link
  to="https://baike.baidu.com/item/苏轼/184172"
  target="_blank"
>
  <Button>观看苏轼介绍视频</Button>
</Link>

// 方案二：嵌入播放（需要处理跨域）
<iframe
  src="https://baike.baidu.com/widget?lemmaId=184172"
  width="100%"
  height="500"
/>
```

### 8.2 其他细节优化

- [ ] 学者头像替换为真实照片（用户已表示会找图）
- [ ] 清理编译警告（useApi.ts、PoetryMarkers.tsx 等）
- [ ] 考虑在研究论文详情页添加"查看全文"链接（指向知网/期刊官网）
- [ ] 响应式优化：移动端适配检查

---

## 九、结尾感言

今天的工作让网站的内容丰富度又上了一个台阶。

学术研究页面的充实是一项细致活。10 篇经典论文的深度赏析，每一篇都要结合苏轼的原作来分析，既要准确传达论文的核心观点，又要让非专业读者能够理解。特别是添加的"核心论点"和"相关名句"两个字段，让用户可以在 30 秒内快速把握一篇论文的要点。

分享卡片的集成虽然技术上不算复杂，但让网站的传播性大大增强。用户读到喜欢的诗词，一键就能生成精美的卡片分享到社交平台，这对推广传统文化很有意义。

首页背景图的优化效果也很显著。用户通过 AI 生成的那张水墨图，苏轼剪影站在江边望向远方，意境悠远，非常契合"跟着苏轼去旅行，读他读过的风景"这个主题。

明天继续优化视频入口和细节打磨，让网站更加完善。

---

*（配图建议：首页新背景截图、分享卡片三种样式截图、论文详情页截图）**
