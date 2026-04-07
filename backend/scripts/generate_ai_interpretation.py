#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI 诗词解读批量生成脚本
使用 Claude API 生成苏轼诗词的 AI 解读
"""

import asyncio
import json
import os
from typing import List, Dict, Optional

# 尝试导入 anthropic，如果没有安装则跳过
try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    print("警告：anthropic 库未安装，请运行：pip install anthropic")

# 从环境获取 API Key
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# AI 解读生成 Prompt 模板
AI_INTERPRETATION_PROMPT = """你是一位精通中国古典文学的专家，专门研究苏轼诗词。请为以下诗词生成一份专业、深入且易于理解的解读。

诗词信息：
- 标题：{title}
- 作者：{author}
- 朝代：{dynasty}
- 题材：{genre}
- 时期：{period}
- 年份：{year}

诗词正文：
{content}

请以 JSON 格式返回解读，包含以下字段：
{{
    "summary": "用 1-2 句话概括全诗主旨（50 字以内）",
    "emotional_tone": "情感基调（如：豪放、婉约、沉郁、旷达等，20 字以内）",
    "key_imagery": ["核心意象 1", "核心意象 2", "核心意象 3"],
    "artistic_features": "艺术特色分析（如表现手法、修辞技巧、结构特点等，100 字以内）",
    "historical_context": "创作背景与历史典故（100 字以内）",
    "modern_relevance": "现代启示或共鸣点（能引发现代读者思考的内容，80 字以内）"
}}

要求：
1. 解读要准确、专业，体现苏轼诗词的特色
2. 语言要通俗易懂，让普通读者也能理解
3. 核心意象提取 2-4 个最具代表性的
4. 避免过度解读，尊重原意
5. 现代启示要贴近当代生活，有现实意义

请直接返回 JSON，不要有其他说明文字。"""


class AIInterpretationGenerator:
    """AI 解读生成器"""

    def __init__(self, api_key: str = ""):
        self.api_key = api_key or ANTHROPIC_API_KEY
        self.client = None

        if ANTHROPIC_AVAILABLE and self.api_key:
            self.client = anthropic.Anthropic(api_key=self.api_key)
            print("✓ Claude API 客户端已初始化")
        else:
            print("✗ Claude API 客户端未初始化（缺少 API Key 或库）")

    async def generate_interpretation(
        self,
        title: str,
        content: str,
        author: str = "苏轼",
        dynasty: str = "宋",
        genre: Optional[str] = None,
        period: Optional[str] = None,
        year: Optional[int] = None,
        max_retries: int = 2
    ) -> Optional[Dict]:
        """生成单首诗词的 AI 解读"""

        if not self.client:
            print(f"  ⚠ 跳过 {title}：API 客户端未初始化")
            return None

        prompt = AI_INTERPRETATION_PROMPT.format(
            title=title,
            content=content,
            author=author,
            dynasty=dynasty,
            genre=genre or "未知",
            period=period or "未知",
            year=year or "未知"
        )

        for attempt in range(max_retries):
            try:
                # 调用 Claude API
                message = self.client.messages.create(
                    model="claude-sonnet-4-6-20250929",
                    max_tokens=1024,
                    messages=[
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                )

                # 解析返回的 JSON
                response_text = message.content[0].text.strip()

                # 尝试提取 JSON（可能包含在 markdown 代码块中）
                if "```json" in response_text:
                    json_str = response_text.split("```json")[1].split("```")[0].strip()
                elif "```" in response_text:
                    json_str = response_text.split("```")[1].split("```")[0].strip()
                else:
                    json_str = response_text

                interpretation = json.loads(json_str)

                # 验证必要字段
                if "summary" not in interpretation:
                    raise ValueError("缺少 summary 字段")

                print(f"  ✓ {title} 解读生成成功")
                return interpretation

            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"  ⚠ {title} 解读生成失败，重试中... ({e})")
                    await asyncio.sleep(2 ** attempt)  # 指数退避
                else:
                    print(f"  ✗ {title} 解读生成失败：{e}")
                    return None

        return None

    async def batch_generate(
        self,
        poetries: List[Dict],
        output_file: str = "ai_interpretations.json",
        concurrency: int = 3
    ) -> Dict[str, Dict]:
        """批量生成诗词解读"""

        print(f"\n开始批量生成 AI 解读，共 {len(poetries)} 首诗词")
        print(f"并发数：{concurrency}\n")

        results = {}
        semaphore = asyncio.Semaphore(concurrency)

        async def process_poetry(poetry: Dict) -> None:
            async with semaphore:
                interpretation = await self.generate_interpretation(
                    title=poetry.get("title", ""),
                    content=poetry.get("content", ""),
                    author=poetry.get("author", "苏轼"),
                    dynasty=poetry.get("dynasty", "宋"),
                    genre=poetry.get("genre"),
                    period=poetry.get("period"),
                    year=poetry.get("year")
                )

                if interpretation:
                    results[str(poetry.get("id", ""))] = interpretation
                    # 实时保存到文件
                    with open(output_file, "w", encoding="utf-8") as f:
                        json.dump(results, f, ensure_ascii=False, indent=2)

        # 创建任务
        tasks = [process_poetry(poetry) for poetry in poetries]
        await asyncio.gather(*tasks)

        print(f"\n✓ 批量生成完成，成功 {len(results)} 首")
        print(f"结果已保存到：{output_file}")

        return results


async def main():
    """主函数"""

    # 示例数据 - 实际使用时从数据库读取
    sample_poetries = [
        {
            "id": 1,
            "title": "念奴娇·赤壁怀古",
            "content": "大江东去，浪淘尽，千古风流人物。故垒西边，人道是，三国周郎赤壁。乱石穿空，惊涛拍岸，卷起千堆雪。江山如画，一时多少豪杰。\n\n遥想公瑾当年，小乔初嫁了，雄姿英发。羽扇纶巾，谈笑间，樯橹灰飞烟灭。故国神游，多情应笑我，早生华发。人生如梦，一尊还酹江月。",
            "author": "苏轼",
            "dynasty": "宋",
            "genre": "词",
            "period": "黄州时期",
            "year": 1082
        },
        {
            "id": 2,
            "title": "水调歌头·明月几时有",
            "content": "明月几时有？把酒问青天。不知天上宫阙，今夕是何年。我欲乘风归去，又恐琼楼玉宇，高处不胜寒。起舞弄清影，何似在人间。\n\n转朱阁，低绮户，照无眠。不应有恨，何事长向别时圆？人有悲欢离合，月有阴晴圆缺，此事古难全。但愿人长久，千里共婵娟。",
            "author": "苏轼",
            "dynasty": "宋",
            "genre": "词",
            "period": "密州时期",
            "year": 1076
        },
        {
            "id": 9,
            "title": "江城子·乙卯正月二十日夜记梦",
            "content": "十年生死两茫茫，不思量，自难忘。千里孤坟，无处话凄凉。纵使相逢应不识，尘满面，鬓如霜。\n\n夜来幽梦忽还乡，小轩窗，正梳妆。相顾无言，惟有泪千行。料得年年肠断处，明月夜，短松冈。",
            "author": "苏轼",
            "dynasty": "宋",
            "genre": "词",
            "period": "知密州时期",
            "year": 1075
        }
    ]

    # 创建生成器
    generator = AIInterpretationGenerator()

    # 批量生成（示例 3 首）
    results = await generator.batch_generate(
        poetries=sample_poetries,
        output_file="ai_interpretations_sample.json",
        concurrency=2
    )

    print("\n生成结果预览：")
    for poetry_id, interpretation in list(results.items())[:1]:
        print(f"\n【诗词 ID {poetry_id}】")
        print(f"主旨概括：{interpretation.get('summary', 'N/A')}")
        print(f"情感基调：{interpretation.get('emotional_tone', 'N/A')}")
        print(f"核心意象：{interpretation.get('key_imagery', [])}")


if __name__ == "__main__":
    asyncio.run(main())
