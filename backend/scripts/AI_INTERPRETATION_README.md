# AI 诗词解读功能 - 使用说明

## 功能概述

在诗词详情页底部增加"AI 智能解读"模块，包含：
- 主旨概括
- 情感基调
- 核心意象
- 艺术特色
- 创作背景
- 现代启示

## 技术实现

### 方案 A：预生成模式（推荐）

**流程**：
```
后端批量调用 AI → 生成解读存入数据库 → 前端直接读取
```

**优点**：
- 无 API 调用延迟，用户体验好
- 成本可控（一次性生成）
- 可人工审核修改后再上线

## 当前状态

✅ 前端展示模块已完成
✅ 后端数据库字段已添加
✅ API 已支持返回 `ai_interpretation` 字段
✅ 3 首样例诗词已生成 AI 解读

## 批量生成 AI 解读

### 1. 获取 API Key

你需要一个 Anthropic API Key 来调用 Claude 生成解读：

```bash
export ANTHROPIC_API_KEY='sk-ant-api04-xxxxx'
```

或在 `.env` 文件中添加：
```
ANTHROPIC_API_KEY=sk-ant-api04-xxxxx
```

### 2. 运行生成脚本

```bash
cd /Users/daniel/claude-out/su-shi-poetry-map/backend

# 生成 3 首样例
python3 scripts/generate_ai_interpretation_simple.py

# 生成全部 199 首（需要先修改脚本从数据库读取）
python3 scripts/generate_ai_interpretation.py
```

### 3. 导入数据库

```bash
python3 scripts/migrate_add_ai_interpretation.py
```

## 成本估算

| 模型 | 单价 | 199 首成本 |
|------|------|-----------|
| Claude Haiku | ~$0.03/首 | ~$6 |
| Claude Sonnet | ~$0.06/首 | ~$12 |

## 解读内容示例

**《念奴娇·赤壁怀古》**：
```json
{
  "summary": "词人借赤壁之战的历史典故，抒发对英雄人物的缅怀和对人生短暂的感慨。",
  "emotional_tone": "豪放中见沉郁，旷达中藏悲凉",
  "key_imagery": ["大江", "赤壁", "明月"],
  "artistic_features": "时空交错，古今对话。上阕写景怀古，描绘赤壁壮丽景色；下阕抒情言志，借周瑜典故抒发人生感慨。",
  "historical_context": "元丰五年（1082 年），苏轼贬谪黄州第三年，游赤壁所作。此时词人历经乌台诗案，人生跌入低谷。",
  "modern_relevance": "面对人生挫折，保持旷达胸襟；在历史长河中定位自我，获得精神超越。"
}
```

## 前端展示

访问诗词详情页（如 `/poetry/1`），滚动到页面底部即可看到"AI 智能解读"模块。

## 后续优化

1. **批量生成**：修改脚本从数据库读取全部 199 首诗词
2. **人工审核**：生成的解读可以人工校對後再上線
3. **多版本对比**：可以生成不同风格的解读（学术版/通俗版/青少年版）
4. **用户反馈**：增加"有用/无用"反馈按钮
