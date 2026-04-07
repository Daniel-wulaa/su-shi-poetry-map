#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI 诗词解读批量生成脚本 - 阿里百炼（灵积）API
"""

import asyncio
import json
import os
from typing import Optional, Dict

try:
    import httpx
except ImportError:
    print("请安装 httpx: pip install httpx")
    exit(1)

# API Key
DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY", "")

# 阿里百炼 API 端点
# 通义千问 Qwen-Max 或 Qwen-Plus
API_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"

# AI 解读生成 Prompt 模板
AI_INTERPRETATION_PROMPT = """你是一位精通中国古典文学的专家，专门研究苏轼诗词。请为以下诗词生成一份专业、深入且易于理解的解读。

诗词信息：
- 标题：{title}
- 作者：{author}
- 朝代：{dynasty}
- 题材：{genre}
- 时期：{period}

诗词正文：
{content}

请以 JSON 格式返回解读，包含以下字段：
{{
    "summary": "用 1-2 句话概括全诗主旨（50 字以内）",
    "key_imagery": ["核心意象 1", "核心意象 2"],
    "artistic_features": "艺术特色分析（100 字以内）",
    "historical_context": "创作背景与历史典故（150 字以内）",
    "modern_relevance": "现代启示或共鸣点（80 字以内）"
}}

要求：
1. 解读要准确、专业，体现苏轼诗词的特色
2. 语言要通俗易懂
3. 核心意象提取 2-4 个
4. 直接返回 JSON，不要有其他说明文字"""


async def generate_interpretation(
    client: httpx.AsyncClient,
    title: str,
    content: str,
    author: str = "苏轼",
    dynasty: str = "宋",
    genre: str = "词",
    period: str = "未知",
    poetry_id: int = 0,
    model: str = "qwen-plus"
) -> Optional[Dict]:
    """生成单首诗词的 AI 解读"""

    if not DASHSCOPE_API_KEY:
        print(f"  ⚠ 跳过 {title}：缺少 DASHSCOPE_API_KEY")
        return None

    prompt = AI_INTERPRETATION_PROMPT.format(
        title=title,
        content=content,
        author=author,
        dynasty=dynasty,
        genre=genre,
        period=period
    )

    try:
        response = await client.post(
            API_URL,
            headers={
                "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": model,
                "messages": [
                    {
                        "role": "system",
                        "content": "你是一位精通中国古典文学的专家，专门研究苏轼诗词。请返回 JSON 格式的解读。"
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 1024
            },
            timeout=30.0
        )

        if response.status_code != 200:
            print(f"  ✗ {title} API 错误：{response.status_code} - {response.text[:150]}")
            return None

        data = response.json()

        if "choices" not in data or len(data["choices"]) == 0:
            print(f"  ✗ {title} API 返回格式错误")
            return None

        response_text = data["choices"][0]["message"]["content"].strip()

        # 提取 JSON
        if "```json" in response_text:
            json_str = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            json_str = response_text.split("```")[1].split("```")[0].strip()
        else:
            json_str = response_text

        interpretation = json.loads(json_str)
        print(f"  ✓ {title} 解读生成成功")
        return interpretation

    except Exception as e:
        print(f"  ✗ {title} 生成失败：{e}")
        return None


async def main():
    """主函数 - 生成 3 首样例"""

    # 示例诗词
    sample_poetries = [
        {
            "id": 1,
            "title": "念奴娇·赤壁怀古",
            "content": "大江东去，浪淘尽，千古风流人物。故垒西边，人道是，三国周郎赤壁。乱石穿空，惊涛拍岸，卷起千堆雪。江山如画，一时多少豪杰。\n\n遥想公瑾当年，小乔初嫁了，雄姿英发。羽扇纶巾，谈笑间，樯橹灰飞烟灭。故国神游，多情应笑我，早生华发。人生如梦，一尊还酹江月。",
            "author": "苏轼",
            "dynasty": "宋",
            "genre": "词",
            "period": "黄州团练"
        },
        {
            "id": 2,
            "title": "水调歌头·明月几时有",
            "content": "明月几时有？把酒问青天。不知天上宫阙，今夕是何年。我欲乘风归去，又恐琼楼玉宇，高处不胜寒。起舞弄清影，何似在人间。\n\n转朱阁，低绮户，照无眠。不应有恨，何事长向别时圆？人有悲欢离合，月有阴晴圆缺，此事古难全。但愿人长久，千里共婵娟。",
            "author": "苏轼",
            "dynasty": "宋",
            "genre": "词",
            "period": "密州时期"
        },
        {
            "id": 9,
            "title": "江城子·乙卯正月二十日夜记梦",
            "content": "十年生死两茫茫，不思量，自难忘。千里孤坟，无处话凄凉。纵使相逢应不识，尘满面，鬓如霜。\n\n夜来幽梦忽还乡，小轩窗，正梳妆。相顾无言，惟有泪千行。料得年年肠断处，明月夜，短松冈。",
            "author": "苏轼",
            "dynasty": "宋",
            "genre": "词",
            "period": "知密州时期"
        }
    ]

    print("=" * 50)
    print("AI 诗词解读生成器 - 阿里百炼版")
    print("=" * 50)

    if not DASHSCOPE_API_KEY:
        print("\n⚠ 警告：缺少 DASHSCOPE_API_KEY")
        print("请在 .env 文件中添加：DASHSCOPE_API_KEY=sk-xxxxx")
        print("\n或在阿里云百炼控制台获取：https://bailian.console.aliyun.com/")
        return

    async with httpx.AsyncClient() as client:
        results = {}

        for poetry in sample_poetries:
            interpretation = await generate_interpretation(
                client,
                title=poetry["title"],
                content=poetry["content"],
                author=poetry["author"],
                dynasty=poetry["dynasty"],
                genre=poetry["genre"],
                period=poetry["period"],
                poetry_id=poetry["id"],
                model="qwen-plus"  # 通义千问 Plus
            )

            if interpretation:
                results[str(poetry["id"])] = interpretation

            # 避免限流，每首间隔 1 秒
            await asyncio.sleep(1)

    # 保存结果
    output_file = "ai_interpretations_sample.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n✓ 生成完成！共 {len(results)} 首")
    print(f"结果已保存到：{output_file}")

    # 预览结果
    if results:
        print("\n【结果预览】")
        first_id = list(results.keys())[0]
        first = results[first_id]
        print(f"\n诗词 ID {first_id}:")
        print(f"  主旨概括：{first.get('summary', 'N/A')[:50]}...")
        print(f"  情感基调：{first.get('emotional_tone', 'N/A')}")
        print(f"  核心意象：{first.get('key_imagery', [])}")


if __name__ == "__main__":
    asyncio.run(main())
