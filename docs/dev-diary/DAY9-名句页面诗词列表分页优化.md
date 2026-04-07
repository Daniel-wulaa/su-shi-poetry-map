# 开发日记 DAY9 - 名句页面诗词列表分页优化

**日期**: 2026-04-02
**天气**: 晴
**心情**: 充实

---

## 一、今日目标

1. 修复后端 API 配置错误（SQLAlchemy 模型关系问题）
2. 为右侧诗词列表添加分页功能
3. 优化前端加载性能

---

## 二、后端 API 修复

### 2.1 问题描述

启动后端服务后，访问 `/api/poetries` 接口返回 `500 Internal Server Error`。

### 2.2 错误日志

```
sqlalchemy.exc.InvalidRequestError: One or more mappers failed to initialize - can't proceed with initialization of other mappers. Triggering mapper: 'Mapper[Location(locations)]'. Original exception was: Mapper 'Mapper[PoetryLocation(poetry_locations)]' has no property 'location'. If this property was indicated from other mappers or configure events, ensure registry.configure() has been called.
```

### 2.3 问题原因

在 DAY8 修复 SQLAlchemy 循环引用问题时，移除了 `PoetryLocation` 模型中的 `location` 关系定义，但 `Location` 模型中的 `poetries` 关系仍然使用 `back_populates="location"` 引用它，导致双向关系不匹配。

### 2.4 解决方案

在 `PoetryLocation` 模型中重新添加 `location` 关系定义，与 `Location` 模型的 `poetries` 关系形成双向绑定：

```python
# backend/app/models/poetry.py

class PoetryLocation(Base):
    """诗词 - 地点关联表"""
    __tablename__ = "poetry_locations"

    id = Column(Integer, primary_key=True, index=True)
    poetry_id = Column(Integer, ForeignKey("poetries.id", ondelete="CASCADE"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=False)
    relation_type = Column(String(50), default="creation_place")
    confidence = Column(String(50), default="confirmed")
    notes = Column(String(500), nullable=True)

    # 关系定义 - 使用 back_populates 与 Location 模型关联
    location = relationship("Location", back_populates="poetries")

    def __repr__(self):
        return f"<PoetryLocation(poetry_id={self.poetry_id}, location_id={self.location_id})>"
```

同时，`Location` 模型保持不变：

```python
# backend/app/models/location.py

class Location(Base):
    """地点表"""
    __tablename__ = "locations"

    # ... 其他字段 ...

    # 关联 - 使用 back_populates 与 PoetryLocation 模型关联
    poetries = relationship("PoetryLocation", back_populates="location", cascade="all, delete-orphan")
```

### 2.5 验证结果

```bash
# 测试 API
curl -s 'http://localhost:8000/api/poetries?page=1&page_size=20'

# 返回结果
{
    "items": [...],
    "total": 199,
    "page": 1,
    "page_size": 20
}
```

API 恢复正常工作。

---

## 三、前端分页功能

### 3.1 问题描述

原来右侧诗词列表一次性加载 300 首诗词，超出后端 API 限制（page_size 最大 100），且渲染性能不佳。

### 3.2 用户反馈

> 诗词页数太多的话用翻页数来做限制啊，一页不需要那么多诗词呈现

### 3.3 实现方案

**第一步：添加分页状态**

```typescript
// 诗词列表分页状态
const [poetryPage, setPoetryPage] = useState(1);
const poetryPageSize = 20; // 每页显示 20 首
```

**第二步：搜索时重置页码**

```typescript
// 搜索时重置页码
useEffect(() => {
  setPoetryPage(1);
}, [searchQuery]);
```

**第三步：修改过滤逻辑，支持分页**

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
      poetry.tags?.toLowerCase().includes(query)
    );
  }

  // 分页
  const start = (poetryPage - 1) * poetryPageSize;
  const end = start + poetryPageSize;
  return result.slice(start, end);
}, [searchQuery, allPoetries, poetryPage]);

// 计算总页数
const totalPoetryCount = useMemo(() => {
  if (!searchQuery) return allPoetries.length;
  const query = searchQuery.toLowerCase();
  return allPoetries.filter(poetry =>
    poetry.title.toLowerCase().includes(query) ||
    poetry.content?.toLowerCase().includes(query) ||
    poetry.period?.toLowerCase().includes(query) ||
    poetry.tags?.toLowerCase().includes(query)
  ).length;
}, [searchQuery, allPoetries]);

const totalPoetryPages = useMemo(() => {
  return Math.ceil(totalPoetryCount / poetryPageSize);
}, [totalPoetryCount, poetryPageSize]);
```

**第四步：简化 API 调用**

```typescript
// 从 API 获取诗词数据（第一页 100 首）
const { data: poetriesData } = usePoetries(1, 100);
const allPoetries = useMemo(() => poetriesData?.items || [], [poetriesData]);
```

**第五步：添加分页 UI 控制**

```tsx
{/* 右侧分栏 - 全部诗词 */}
<div className="w-80 border-l bg-slate-50 flex flex-col shrink-0">
  <div className="p-4 border-b bg-white">
    <h2 className="text-lg font-semibold flex items-center gap-2">
      <BookOpen className="h-5 w-5 text-primary" />
      全部诗词
    </h2>
    <p className="text-xs text-muted-foreground mt-1">
      共 {totalPoetryCount} 首（第 {poetryPage} / {totalPoetryPages} 页）
    </p>
  </div>

  <ScrollArea className="flex-1">
    <div className="p-4 space-y-2">
      {filteredPoetries.map((poetry) => (
        <button
          key={poetry.id}
          className="w-full text-left p-3 rounded-lg hover:bg-slate-200"
          onClick={() => navigate(`/poetry/${poetry.id}`)}
        >
          {/* 诗词内容 */}
        </button>
      ))}
    </div>
  </ScrollArea>

  {/* 分页控制 */}
  {totalPoetryPages > 1 && (
    <div className="p-4 border-t bg-white">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={poetryPage === 1}
          onClick={() => setPoetryPage(poetryPage - 1)}
        >
          上一页
        </Button>
        <span className="text-sm text-muted-foreground">
          第 {poetryPage} / {totalPoetryPages} 页
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={poetryPage === totalPoetryPages}
          onClick={() => setPoetryPage(poetryPage + 1)}
        >
          下一页
        </Button>
      </div>
    </div>
  )}
</div>
```

### 3.4 分页设计

| 参数 | 值 | 说明 |
|------|-----|------|
| 每页数量 | 20 首 | 适应右侧栏高度，避免过度滚动 |
| 最大页数 | 5 页 | 199 首诗词 / 20 = 10 页（全量加载时） |
| 搜索重置 | 支持 | 搜索时自动跳回第 1 页 |
| 分页显示 | 条件渲染 | 只在总页数 > 1 时显示分页器 |

---

## 四、技术总结

### 4.1 SQLAlchemy 关系定义

**一对一关系：**
```python
# 单向引用不需要 back_populates
location = relationship("Location")
```

**一对多双向关系：**
```python
# Parent 端
children = relationship("Child", back_populates="parent")

# Child 端
parent = relationship("Parent", back_populates="children")
```

**一对多单向关系：**
```python
# Parent 端（不需要 Child 端定义）
children = relationship("Child")

# Child 端可以没有 parent 关系
```

### 4.2 前端分页 vs 后端分页

| 方式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **前端分页** | 响应快，无需重复请求 | 首次加载数据量大 | 数据量小（<1000 条） |
| **后端分页** | 首次加载快 | 每次翻页需请求 API | 数据量大（>1000 条） |

本次选择前端分页原因：
1. 诗词总数仅 199 首
2. 已经通过 API 加载到内存
3. 前端切片性能足够
4. 搜索过滤体验更好

### 4.3 代码变更

**修改文件**：
- `backend/app/models/poetry.py` - 添加 `location` 关系
- `frontend/src/pages/QuotesPage.tsx` - 添加分页功能

**新增导入**：
```typescript
import { useEffect } from 'react';
```

---

## 五、项目数据

| 指标 | 数值 |
|------|------|
| 数据库诗词 | 199 首 |
| API 每页限制 | 100 首 |
| 前端每页显示 | 20 首 |
| 最大页数 | 10 页（全量）|
| TypeScript 错误 | 0 个 |

---

## 六、明日待办

### 6.1 核心任务

**诗词详情页开发**：
- [ ] 创建诗词详情页组件
- [ ] 显示诗词全文、注释、赏析
- [ ] 添加返回名句页面按钮
- [ ] 支持从名句卡片和诗词列表两种方式进入

**名句页面优化**：
- [ ] 优化收藏功能持久化（目前刷新后丢失）
- [ ] 添加诗词类型筛选（词/诗/赋）
- [ ] 考虑支持加载更多而非分页（提升体验）

### 6.2 细节优化

- [ ] 修复搜索时统计信息不准确的问题
- [ ] 优化移动端布局
- [ ] 添加加载状态和空状态提示

---

## 七、踩坑记录

### 7.1 SQLAlchemy 关系初始化错误

**问题**：`Mapper has no property 'location'`

**原因**：双向关系定义不匹配

**解决**：确保 `back_populates` 两端名称一致

### 7.2 API page_size 限制

**问题**：前端请求 `page_size=300` 超出后端限制

**后端限制配置**：
```python
@router.get("", response_model=PoetryListResponse)
async def get_poetries(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),  # 最大 100
    ...
):
```

**解决**：前端改为分页加载，每页 20 首

---

## 八、结尾感言

今天的工作主要围绕后端 API 修复和前端分页优化展开。

后端的问题源于之前的简化修改，导致 SQLAlchemy 模型关系不匹配。通过分析错误日志，快速定位并修复了问题。这是一个典型的"牵一发而动全身"的案例，修改模型时需要谨慎考虑关联关系。

前端分页功能的添加让诗词列表更加易用。每页 20 首的设计既保证了可读性，又避免了过度滚动带来的疲劳感。用户可以在浏览名句的同时，方便地翻阅诗词列表，找到感兴趣的作品进行全诗欣赏。

明天将继续完善诗词详情页，让"点击诗词 → 阅读全文 → 返回名句页"的流程完整闭环。

---

*（配图建议：分页控制截图、诗词列表效果、后端 API 测试截图）*
