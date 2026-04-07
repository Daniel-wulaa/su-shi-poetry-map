# 开发日记 DAY10 - 名句页布局重构与风格筛选新增

**日期**: 2026-04-02
**天气**: 晴
**心情**: 专注

---

## 一、今日目标

1. **名句赏析页面布局重构**：从三栏布局改为两栏布局，将左侧筛选栏整合到顶部
2. **新增风格筛选项**：添加 15 种诗词风格分类（悼亡诗、哲理诗、思乡诗等）
3. **两侧栏目高度对齐**：精确计算左右两侧内容高度，避免底部大片空白

---

## 二、名句页面布局重构

### 2.1 布局变更对比

**原布局（三栏）**：
```
┌─────────┬─────────────────┬──────────┐
│  左侧   │     中间        │   右侧   │
│ 筛选栏  │   名句赏析      │ 全部诗词 │
│ w-72    │   flex-1        │  w-80    │
│(288px)  │   (flex 弹性)   │ (320px)  │
│         │                 │          │
│ 搜索框  │  52 条名句       │ 199 首   │
│ 分类 Tab │  三列网格       │ 列表     │
│ 时期    │                 │ 分页     │
│ 题材    │                 │          │
│ 词牌    │                 │          │
└─────────┴─────────────────┴──────────┘
```

**问题分析**：
1. 名句赏析在中间用三列网格，但左右两栏宽度固定，视觉上中间区域被挤压
2. 左侧筛选栏独立存在，占用宝贵水平空间
3. 名句赏析宽度（320px）不足以展示卡片内容

**新布局（两栏）**：
```
┌──────────────────────────────┬──────────────────┐
│         左侧 + 中间合并       │       右侧       │
│  顶部筛选 + 诗词列表         │    名句赏析      │
│        (flex-1)              │     (960px)      │
│                              │                  │
│ ┌─────────────────────────┐  │ ┌──────────────┐ │
│ │  头部标签栏              │  │ │ 名句 1 │ 名句 2 │ │
│ ├─────────────────────────┤  │ ├──────────────┤ │
│ │  搜索框 | 全部诗词 | 标签  │  │ │ 名句 3 │ 名句 4 │ │
│ │  按时期│按题材│按词牌│按风格│  │ │ 名句 5 │ 名句 6 │ │
│ │  [时期按钮组]            │  │ └──────────────┘ │
│ ├─────────────────────────┤  │ ... (18 行)       │
│ │  诗词列表 (37 首/页)      │  │                  │
│ │  【词】水调歌头          │  │ ┌──────────────┐ │
│ │  【诗】饮湖上初晴后雨    │  │ │    统计       │ │
│ │  ...                     │  │ └──────────────┘ │
│ ├─────────────────────────┤  └──────────────────┘
│ │  ‹ 1 2 3 4 5 ›           │
│ └─────────────────────────┘  52 名句 ÷ 3 列 = 18 行
└──────────────────────────────
```

### 2.2 用户原始反馈

> 我们改下布局位置，把目前中间的名句和右侧的全部诗词换一个位置

> 现在左侧多了，建议少 5 行左右

> 我觉得应该像其他网站类似电商的，把左侧的搜索和筛选项放到全部诗词的顶部去，这样左和中就可以合并成一个了，变成上面是搜索和筛选项，下面是全部诗词的列表页

### 2.3 实现方案详解

#### 第一步：删除独立左侧栏

**原代码（删除）**：
```tsx
{/* 左侧分栏 - 搜索和分类 */}
<div className="w-72 border-r bg-slate-50 flex flex-col shrink-0">
  {/* 搜索框 */}
  <div className="p-4 border-b">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="搜索名句、诗词、词牌、时期..."
        className="w-full pl-10 pr-8 py-2 border rounded-lg bg-white text-sm"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  </div>

  {/* 分类 Tab */}
  <div className="flex border-b bg-white">
    <button onClick={() => setActiveTab('period')}>时期</button>
    <button onClick={() => setActiveTab('genre')}>题材</button>
    <button onClick={() => setActiveTab('pattern')}>词牌</button>
  </div>

  {/* 分类列表 */}
  <ScrollArea className="flex-1">
    <div className="p-4 space-y-2">
      {activeTab === 'period' && PERIODS.map(...)}
      {activeTab === 'genre' && GENRES.map(...)}
      {activeTab === 'pattern' && CI_PATTERNS.map(...)}
    </div>
  </ScrollArea>
</div>
```

**问题**：
- 垂直堆叠的筛选方式占用水平空间
- 分类列表需要滚动才能看到全部选项
- 与名句赏析栏目宽度接近，视觉不平衡

#### 第二步：顶部筛选栏设计（完整版）

```tsx
{/* 左侧 + 中间 - 合并为诗词列表区域 */}
<div className="flex-1 flex flex-col overflow-hidden border-r">
  {/* 顶部标签栏 - 与右侧名句赏析对齐 */}
  <div className="bg-gradient-to-r from-primary to-blue-700 text-white py-6 px-6 shrink-0">
    <h2 className="text-xl font-bold mb-1">全部诗词</h2>
    <p className="text-primary-100 text-xs">数据库共 {allPoetries.length} 首，跟着东坡足迹读诗词</p>
  </div>

  {/* 顶部筛选栏 */}
  <div className="bg-white border-b p-4 shrink-0">
    <div className="flex items-start gap-4">
      {/* 搜索框 */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索诗词、词牌、时期..."
          className="w-full pl-10 pr-8 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => setSearchQuery('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* 分类按钮 - 全部诗词 */}
      <div className="flex items-center gap-2">
        <button
          className={cn(
            'px-4 py-2 text-sm rounded-lg transition-colors border',
            selectedPeriod === 'all' && selectedGenre === 'all' &&
            selectedPattern === 'all' && selectedStyle === 'all' && searchQuery === ''
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-white hover:bg-slate-100 border-slate-200'
          )}
          onClick={() => {
            setSearchQuery('');
            setSelectedPeriod('all');
            setSelectedGenre('all');
            setSelectedPattern('all');
            setSelectedStyle('all');
          }}
        >
          📖 全部诗词 ({allPoetries.length})
        </button>
      </div>

      {/* 筛选条件展示 - 动态显示已选条件 */}
      {(selectedPeriod !== 'all' || selectedGenre !== 'all' ||
        selectedPattern !== 'all' || selectedStyle !== 'all') && (
        <div className="flex items-center gap-2 flex-1">
          {selectedPeriod !== 'all' && (
            <Badge variant="secondary" className="px-3 py-1">
              时期：{PERIODS.find(p => p.id === selectedPeriod)?.name}
              <button
                className="ml-2 hover:text-destructive"
                onClick={() => setSelectedPeriod('all')}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedGenre !== 'all' && (
            <Badge variant="secondary" className="px-3 py-1">
              题材：{GENRES.find(g => g.id === selectedGenre)?.name}
              <button
                className="ml-2 hover:text-destructive"
                onClick={() => setSelectedGenre('all')}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedPattern !== 'all' && (
            <Badge variant="secondary" className="px-3 py-1">
              词牌：{CI_PATTERNS.find(p => p.id === selectedPattern)?.name}
              <button
                className="ml-2 hover:text-destructive"
                onClick={() => setSelectedPattern('all')}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedStyle !== 'all' && (
            <Badge variant="secondary" className="px-3 py-1">
              风格：{STYLES.find(s => s.id === selectedStyle)?.name}
              <button
                className="ml-2 hover:text-destructive"
                onClick={() => setSelectedStyle('all')}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>

    {/* 筛选 Tab - 切换筛选维度 */}
    <div className="flex items-center gap-2 mt-3">
      <span className="text-sm text-muted-foreground">筛选：</span>
      <button
        className={cn(
          'px-3 py-1 text-sm rounded-md transition-colors border font-medium',
          activeTab === 'period'
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-slate-200 hover:bg-slate-300 border-slate-300'
        )}
        onClick={() => setActiveTab('period')}
      >
        按时期
      </button>
      <button
        className={cn(
          'px-3 py-1 text-sm rounded-md transition-colors border font-medium',
          activeTab === 'genre'
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-slate-200 hover:bg-slate-300 border-slate-300'
        )}
        onClick={() => setActiveTab('genre')}
      >
        按题材
      </button>
      <button
        className={cn(
          'px-3 py-1 text-sm rounded-md transition-colors border font-medium',
          activeTab === 'pattern'
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-slate-200 hover:bg-slate-300 border-slate-300'
        )}
        onClick={() => setActiveTab('pattern')}
      >
        按词牌
      </button>
      <button
        className={cn(
          'px-3 py-1 text-sm rounded-md transition-colors border font-medium',
          activeTab === 'style'
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-slate-200 hover:bg-slate-300 border-slate-300'
        )}
        onClick={() => setActiveTab('style')}
      >
        按风格
      </button>
    </div>

    {/* 筛选选项按钮组 - 根据 Tab 动态显示 */}
    <div className="mt-3 flex flex-wrap gap-2">
      {activeTab === 'period' && PERIODS.filter(p => p.id !== 'all').map((period) => (
        <button
          key={period.id}
          className={cn(
            'px-3 py-1 text-sm rounded-md border transition-colors',
            selectedPeriod === period.id
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          )}
          onClick={() => setSelectedPeriod(period.id === selectedPeriod ? 'all' : period.id)}
        >
          {period.name}
        </button>
      ))}
      {activeTab === 'genre' && GENRES.filter(g => g.id !== 'all').map((genre) => (
        <button
          key={genre.id}
          className={cn(
            'px-3 py-1 text-sm rounded-md border transition-colors',
            selectedGenre === genre.id
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          )}
          onClick={() => setSelectedGenre(genre.id === selectedGenre ? 'all' : genre.id)}
        >
          {genre.name}
        </button>
      ))}
      {activeTab === 'pattern' && CI_PATTERNS.filter(p => p.id !== 'all').map((pattern) => (
        <button
          key={pattern.id}
          className={cn(
            'px-3 py-1 text-sm rounded-md border transition-colors',
            selectedPattern === pattern.id
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          )}
          onClick={() => setSelectedPattern(pattern.id === selectedPattern ? 'all' : pattern.id)}
        >
          {pattern.name}
        </button>
      ))}
      {activeTab === 'style' && STYLES.filter(s => s.id !== 'all').map((style) => (
        <button
          key={style.id}
          className={cn(
            'px-3 py-1 text-sm rounded-md border transition-colors',
            selectedStyle === style.id
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          )}
          onClick={() => setSelectedStyle(style.id === selectedStyle ? 'all' : style.id)}
        >
          {style.name}
        </button>
      ))}
    </div>
  </div>

  {/* 诗词列表区域 */}
  <ScrollArea className="flex-1">
    <div className="p-4 space-y-2">
      {filteredPoetries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">暂无诗词</p>
        </div>
      ) : (
        filteredPoetries.map((poetry) => (
          <button
            key={poetry.id}
            className="w-full text-left p-3 rounded-lg hover:bg-slate-200 transition-colors border border-transparent hover:border-slate-300"
            onClick={() => navigate(`/poetry/${poetry.id}`)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {poetry.genre && (
                    <span className="text-muted-foreground mr-1">
                      【{poetry.genre}】
                    </span>
                  )}
                  {poetry.title}
                </p>
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  </ScrollArea>

  {/* 分页控制 */}
  {totalPoetryPages > 1 && (
    <div className="p-4 border-t bg-white shrink-0">
      <div className="flex items-center justify-center gap-2">
        {/* 上一页 */}
        <Button
          variant="outline"
          size="sm"
          disabled={poetryPage === 1}
          onClick={() => setPoetryPage(poetryPage - 1)}
          className="w-8 h-8 p-0"
        >
          ‹
        </Button>

        {/* 页码按钮 */}
        {Array.from({ length: totalPoetryPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={poetryPage === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPoetryPage(page)}
            className="w-8 h-8 p-0"
          >
            {page}
          </Button>
        ))}

        {/* 下一页 */}
        <Button
          variant="outline"
          size="sm"
          disabled={poetryPage === totalPoetryPages}
          onClick={() => setPoetryPage(poetryPage + 1)}
          className="w-8 h-8 p-0"
        >
          ›
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2">
        第 {poetryPage} / {totalPoetryPages} 页 · 本页 {filteredPoetries.length} 首
      </p>
    </div>
  )}
</div>
```

#### 第三步：右侧名句赏析栏目

```tsx
{/* 右侧 - 名句赏析 */}
<div className="w-[960px] border-l bg-slate-50 flex flex-col shrink-0">
  {/* 头部 */}
  <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white py-6 px-6">
    <h2 className="text-xl font-bold mb-1">苏轼名句赏析</h2>
    <p className="text-amber-100 text-xs">千古传诵的经典名句</p>
  </div>

  {/* 名句卡片列表 - 三列网格 */}
  <ScrollArea className="flex-1">
    <div className="p-4 grid grid-cols-3 gap-3">
      {FAMOUS_QUOTES.map((quote) => (
        <Card
          key={quote.id}
          className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]"
          onClick={() => setSelectedQuote(quote)}
        >
          <CardContent className="p-4">
            <p className="text-sm font-medium leading-relaxed line-clamp-3">
              "{quote.content}"
            </p>
            <p className="text-xs text-muted-foreground mt-2 text-right">
              ——{quote.source}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  </ScrollArea>

  {/* 统计信息 */}
  <div className="p-3 border-t bg-white">
    <div className="text-center">
      <p className="text-lg font-bold text-primary">{FAMOUS_QUOTES.length}</p>
      <p className="text-xs text-muted-foreground">名句</p>
    </div>
  </div>
</div>
```

---

## 三、风格筛选项新增

### 3.1 用户需求

> 增加一个筛选项：按风格，你之前做了这次又删了，比如悼亡诗、哲理诗、思乡诗等等

### 3.2 数据结构设计

新增风格分类配置（15 种风格）：

```typescript
// 风格分类配置 - 用于筛选诗词
const STYLES = [
  { id: 'all', name: '全部风格' },
  { id: '豪放', name: '豪放' },
  { id: '婉约', name: '婉约' },
  { id: '哲理', name: '哲理' },
  { id: '思乡', name: '思乡' },
  { id: '悼亡', name: '悼亡' },
  { id: '咏物', name: '咏物' },
  { id: '怀古', name: '怀古' },
  { id: '送别', name: '送别' },
  { id: '田园', name: '田园' },
  { id: '边塞', name: '边塞' },
  { id: '爱情', name: '爱情' },
  { id: '友情', name: '友情' },
  { id: '励志', name: '励志' },
  { id: '讽喻', name: '讽喻' },
];
```

**风格分类说明**：

| 风格 | 说明 | 代表作品 |
|------|------|----------|
| 豪放 | 气势磅礴，意境开阔 | 《念奴娇·赤壁怀古》 |
| 婉约 | 含蓄委婉，情感细腻 | 《江城子·乙卯正月二十日夜记梦》 |
| 哲理 | 蕴含人生哲理 | 《题西林壁》 |
| 思乡 | 思念家乡亲人 | 《水调歌头·明月几时有》 |
| 悼亡 | 悼念逝者 | 《江城子·乙卯正月二十日夜记梦》 |
| 咏物 | 咏叹事物 | 《海棠》 |
| 怀古 | 怀古咏史 | 《念奴娇·赤壁怀古》 |
| 送别 | 送别友人 | 《送子由使契丹》 |
| 田园 | 田园风光 | 《浣溪沙·簌簌衣巾落枣花》 |
| 边塞 | 边塞生活 | 《江城子·密州出猎》 |
| 爱情 | 爱情主题 | 《蝶恋花·春景》 |
| 友情 | 朋友情谊 | 《临江仙·送钱穆父》 |
| 励志 | 激励向上 | 《浣溪沙·游蕲水清泉寺》 |
| 讽喻 | 讽刺时弊 | 《荔枝叹》 |

### 3.3 状态管理

```typescript
// 搜索和筛选状态
const [searchQuery, setSearchQuery] = useState('');
const [selectedPeriod, setSelectedPeriod] = useState('all');
const [selectedPattern, setSelectedPattern] = useState('all');
const [selectedGenre, setSelectedGenre] = useState('all');
const [selectedStyle, setSelectedStyle] = useState('all'); // 新增
const [activeTab, setActiveTab] = useState<'period' | 'genre' | 'pattern' | 'style'>('period');
```

### 3.4 筛选逻辑

```typescript
// 筛选全部诗词（带分页）
const filteredPoetries = useMemo(() => {
  let result = allPoetries;

  // 搜索过滤
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(poetry =>
      poetry.title.toLowerCase().includes(query) ||
      poetry.content?.toLowerCase().includes(query) ||
      poetry.period?.toLowerCase().includes(query) ||
      poetry.tags?.toLowerCase().includes(query) ||
      poetry.genre?.toLowerCase().includes(query)
    );
  }

  // 时期筛选
  if (selectedPeriod !== 'all') {
    result = result.filter(poetry => poetry.period?.includes(selectedPeriod));
  }

  // 词牌名筛选
  if (selectedPattern !== 'all') {
    if (selectedPattern === '其他') {
      const knownPatterns = CI_PATTERNS.filter(p => p.id !== 'all' && p.id !== '其他').map(p => p.id);
      result = result.filter(poetry =>
        !knownPatterns.some(pattern => poetry.title.includes(pattern))
      );
    } else {
      result = result.filter(poetry => poetry.title.includes(selectedPattern));
    }
  }

  // 题材筛选
  if (selectedGenre !== 'all') {
    result = result.filter(poetry => poetry.genre === selectedGenre);
  }

  // 风格筛选（新增）
  if (selectedStyle !== 'all') {
    result = result.filter(poetry => poetry.tags?.includes(selectedStyle));
  }

  // 分页
  const start = (poetryPage - 1) * poetryPageSize;
  const end = start + poetryPageSize;
  return result.slice(start, end);
}, [searchQuery, allPoetries, poetryPage, selectedPeriod, selectedPattern, selectedGenre, selectedStyle]);
```

### 3.5 计算总诗词数（用于分页）

```typescript
// 计算总诗词数（用于分页显示）
const totalPoetryCount = useMemo(() => {
  let count = allPoetries.length;

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    count = allPoetries.filter(poetry =>
      poetry.title.toLowerCase().includes(query) ||
      poetry.content?.toLowerCase().includes(query) ||
      poetry.period?.toLowerCase().includes(query) ||
      poetry.tags?.toLowerCase().includes(query) ||
      poetry.genre?.toLowerCase().includes(query)
    ).length;
  }

  if (selectedPeriod !== 'all') {
    count = allPoetries.filter(poetry => poetry.period?.includes(selectedPeriod)).length;
  }

  if (selectedPattern !== 'all') {
    if (selectedPattern === '其他') {
      const knownPatterns = CI_PATTERNS.filter(p => p.id !== 'all' && p.id !== '其他').map(p => p.id);
      count = allPoetries.filter(poetry =>
        !knownPatterns.some(pattern => poetry.title.includes(pattern))
      ).length;
    } else {
      count = allPoetries.filter(poetry => poetry.title.includes(selectedPattern)).length;
    }
  }

  if (selectedGenre !== 'all') {
    count = allPoetries.filter(poetry => poetry.genre === selectedGenre).length;
  }

  // 风格筛选计数（新增）
  if (selectedStyle !== 'all') {
    count = allPoetries.filter(poetry => poetry.tags?.includes(selectedStyle)).length;
  }

  return count;
}, [searchQuery, allPoetries, selectedPeriod, selectedPattern, selectedGenre, selectedStyle]);
```

### 3.6 UI 展示

**筛选 Tab 新增"按风格"按钮**：
```tsx
<button
  className={cn(
    'px-3 py-1 text-sm rounded-md transition-colors border font-medium',
    activeTab === 'style'
      ? 'bg-primary text-primary-foreground border-primary'
      : 'bg-slate-200 hover:bg-slate-300 border-slate-300'
  )}
  onClick={() => setActiveTab('style')}
>
  按风格
</button>
```

**筛选选项按钮组**：
```tsx
{activeTab === 'style' && STYLES.filter(s => s.id !== 'all').map((style) => (
  <button
    key={style.id}
    className={cn(
      'px-3 py-1 text-sm rounded-md border transition-colors',
      selectedStyle === style.id
        ? 'bg-primary text-primary-foreground border-primary'
        : 'bg-white hover:bg-slate-50 border-slate-200'
    )}
    onClick={() => setSelectedStyle(style.id === selectedStyle ? 'all' : style.id)}
  >
    {style.name}
  </button>
))}
```

**筛选条件标签**：
```tsx
{selectedStyle !== 'all' && (
  <Badge variant="secondary" className="px-3 py-1">
    风格：{STYLES.find(s => s.id === selectedStyle)?.name}
    <button
      className="ml-2 hover:text-destructive"
      onClick={() => setSelectedStyle('all')}
    >
      <X className="h-3 w-3" />
    </button>
  </Badge>
)}
```

---

## 四、细节优化

### 4.1 筛选标签样式调整

**用户反馈**：
> 现在这四个标签的底色更明显一点

**第一次调整**：
```tsx
className={cn(
  'px-3 py-1 text-sm rounded-md transition-colors border',
  activeTab === 'period'
    ? 'bg-primary text-primary-foreground border-primary'
    : 'bg-slate-100 hover:bg-slate-200 border-slate-200'
)}
```

**用户反馈**：
> 还是不够明显

**第二次调整（最终）**：
```tsx
className={cn(
  'px-3 py-1 text-sm rounded-md transition-colors border font-medium',
  activeTab === 'period'
    ? 'bg-primary text-primary-foreground border-primary'
    : 'bg-slate-200 hover:bg-slate-300 border-slate-300'
)}
```

**变化**：
- 未选中状态：`bg-slate-100` → `bg-slate-200`（底色更深）
- 悬停状态：`hover:bg-slate-200` → `hover:bg-slate-300`
- 字体：添加 `font-medium`（加粗）

### 4.2 诗词列表标题格式

**原设计**：
```
标题        【词】
            2024 年
```

**新设计**：
```
【词】标题
```

**代码变更**：
```tsx
<p className="font-medium text-sm truncate">
  {poetry.genre && (
    <span className="text-muted-foreground mr-1">
      【{poetry.genre}】
    </span>
  )}
  {poetry.title}
</p>
```

**优势**：
- 分类标识更醒目
- 节省垂直空间
- 视觉更整洁

---

## 五、技术总结

### 5.1 布局设计原则

**电商式筛选布局**（参考淘宝/京东）：
- 顶部：搜索 + 筛选（固定高度）
- 中间：内容列表（可滚动）
- 底部：分页控制（固定高度）

**优点**：
1. 筛选条件始终可见
2. 内容区域最大化
3. 分页操作方便
4. 符合用户习惯

### 5.2 响应式设计

**使用 `shrink-0` 防止收缩**：
```tsx
<div className="p-4 border-b bg-white shrink-0">
  {/* 筛选栏不随内容收缩 */}
</div>

<div className="p-4 border-t bg-white shrink-0">
  {/* 分页栏不随内容收缩 */}
</div>
```

**使用 `flex-1` 占据剩余空间**：
```tsx
<div className="flex-1 flex flex-col overflow-hidden border-r">
  {/* 诗词列表区域自动填充剩余高度 */}
</div>
```

### 5.3 状态管理

**多条件筛选**：
- 4 个筛选维度（时期/题材/词牌/风格）
- 1 个搜索框
- 1 个 Tab 状态（当前激活的筛选维度）
- 1 个分页状态（当前页码）

**状态联动**：
- 搜索时重置页码
- 切换筛选条件时重置页码
- 清除全部筛选时恢复默认状态

---

## 六、项目数据

| 指标 | 数值 |
|------|------|
| 名句数量 | 52 条 |
| 右侧列数 | 3 列 |
| 右侧行数 | 18 行 |
| 右侧宽度 | 960px |
| 左侧每页诗词 | 37 首 |
| 风格分类 | 15 种 |
| 筛选维度 | 4 个（时期/题材/词牌/风格） |
| TypeScript 错误 | 0 个 |

---

## 七、明日待办

### 7.1 核心任务

**诗词详情页排版优化**：
- [ ] 当前诗词详情页显示杂乱，需要优化排版
- [ ] 按体裁（诗/词/赋）自适应排版
- [ ] 或统一采用居中排版

**高度对齐优化**：
- [ ] 根据右侧名句行数，精确计算左侧诗词每页数量
- [ ] 避免底部大片空白

### 7.2 细节优化

- [ ] 修复 TypeScript 未使用变量警告
- [ ] 优化移动端响应式布局
- [ ] 添加加载状态和空状态提示

---

## 八、踩坑记录

### 8.1 JSX 注释错误

**问题代码**：
```tsx
{layoutType === 'card' && (
  /* 方案 B：分片卡片 */}  // ❌ 错误：JSX 注释不能在表达式中
  <div>...</div>
)}
```

**错误信息**：
```
[PARSE_ERROR] Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
```

**正确写法**：
```tsx
{layoutType === 'card' && (
  // 注释写在外面，不要用 {/* */}
  <div>...</div>
)}
```

或在 JSX 内部用 `{/* ... */}`：
```tsx
<div>
  {/* 注释在 JSX 内部 */}
  {items.map(item => <div key={item.id}>{item.name}</div>)}
</div>
```

### 8.2 筛选条件同步问题

**问题**：搜索时没有重置页码，导致用户搜索后停留在第 N 页，但搜索结果可能只有 1 页。

**解决**：
```typescript
// 搜索时重置页码
useEffect(() => {
  setPoetryPage(1);
}, [searchQuery]);
```

---

## 九、结尾感言

今天的工作主要集中在名句赏析页面的布局重构和筛选功能增强上。

从三栏布局改为两栏布局，不仅仅是视觉上的变化，更是对用户浏览习惯的深度思考。电商式的顶部筛选布局，让用户可以更直观地看到筛选条件，同时也让诗词列表获得了更大的展示空间。

风格筛选的添加，让 199 首诗词又多了一个维度的组织方式。用户可以根据自己的喜好，快速找到特定风格的诗词作品，比如想看豪放派的《念奴娇·赤壁怀古》，或者婉约派的《江城子·乙卯正月二十日夜记梦》。

布局调整过程中，两侧栏目的高度对齐是一个需要精细计算的问题。通过多次调整，最终找到了一个比较合适的平衡点。

明天将继续完善诗词详情页的排版，让阅读体验更加舒适。

---

*（配图建议：两栏布局对比图、风格筛选 UI、筛选标签样式演变、诗词列表标题格式对比）*
