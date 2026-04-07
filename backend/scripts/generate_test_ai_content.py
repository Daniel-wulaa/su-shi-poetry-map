#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用阿里 DashScope API 测试生成 3 首诗词的译文、赏析和 AI 解读
"""

import asyncio
import json
import os
import sqlite3
from typing import Optional, Dict

try:
    import httpx
except ImportError:
    print("请安装 httpx: pip install httpx")
    exit(1)

# API Key - 从 .env 文件读取
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
DASHSCOPE_API_KEY = ""
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("DASHSCOPE_API_KEY="):
                DASHSCOPE_API_KEY = line.split("=", 1)[1].strip()
                break

# API 端点
API_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"

# AI 生成 Prompt 模板
AI_GENERATION_PROMPT = """你是一位精通中国古典文学的专家，专门研究苏轼诗词。请为以下诗词生成完整的专业解读。

诗词信息：
- 标题：{title}
- 作者：{author}
- 朝代：{dynasty}
- 题材：{genre}

诗词正文：
{content}

请以严格的 JSON 格式返回以下内容：
{{
    "translations": "完整准确的白话文译文，保持原文意境（200-400 字）",
    "appreciation": "专业的诗词赏析，包括意象分析、艺术特色、情感表达等（300-500 字）",
    "ai_interpretation": {{
        "summary": "用 1-2 句话概括全诗主旨（50 字以内）",
        "key_imagery": ["核心意象 1", "核心意象 2", "核心意象 3"],
        "artistic_features": "艺术特色分析（100 字以内）",
        "historical_context": "创作背景与历史典故（150 字以内）",
        "modern_relevance": "现代启示或共鸣点（80 字以内）"
    }}
}}

要求：
1. 译文要准确通顺，保持原文意境
2. 赏析要专业深入，体现苏轼诗词的特色
3. AI 解读要简洁精准
4. 直接返回 JSON，不要有其他说明文字
5. 确保 JSON 格式正确，可以被解析"""


async def generate_content(
    client: httpx.AsyncClient,
    title: str,
    content: str,
    author: str = "苏轼",
    dynasty: str = "宋",
    genre: str = "词",
    poetry_id: int = 0
) -> Optional[Dict]:
    """生成单首诗词的译文、赏析和 AI 解读"""

    if not DASHSCOPE_API_KEY:
        print(f"  ⚠ 跳过 {title}：缺少 DASHSCOPE_API_KEY")
        return None

    prompt = AI_GENERATION_PROMPT.format(
        title=title,
        content=content,
        author=author,
        dynasty=dynasty,
        genre=genre
    )

    try:
        response = await client.post(
            API_URL,
            headers={
                "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "qwen-plus",
                "messages": [
                    {
                        "role": "system",
                        "content": "你是一位精通中国古典文学的专家，专门研究苏轼诗词。请返回 JSON 格式的解读，包含译文、赏析和 AI 解读。"
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 2048
            },
            timeout=60.0
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

        result = json.loads(json_str)
        print(f"  ✓ {title} 生成成功")
        return result

    except Exception as e:
        print(f"  ✗ {title} 生成失败：{e}")
        return None


async def main():
    """主函数 - 测试生成 3 首"""
    print("=" * 60)
    print("AI 生成测试 - 阿里 DashScope")
    print("=" * 60)

    if not DASHSCOPE_API_KEY:
        print("\n⚠ 警告：缺少 DASHSCOPE_API_KEY")
        print("请在 .env 文件中添加：DASHSCOPE_API_KEY=sk-xxxxx")
        return

    # 测试用的 3 首诗词
    test_poetries = [
        {
            "id": 4,
            "title": "江城子·密州出猎",
            "content": "老夫聊发少年狂，左牵黄，右擎苍，锦帽貂裘，千骑卷平冈。为报倾城随太守，亲射虎，看孙郎。酒酣胸胆尚开张。鬓微霜，又何妨！持节云中，何日遣冯唐？会挽雕弓如满月，西北望，射天狼。",
            "genre": "词"
        },
        {
            "id": 5,
            "title": "饮湖上初晴后雨",
            "content": "水光潋滟晴方好，山色空蒙雨亦奇。欲把西湖比西子，淡妆浓抹总相宜。",
            "genre": "诗"
        },
        {
            "id": 6,
            "title": "题西林壁",
            "content": "横看成岭侧成峰，远近高低各不同。不识庐山真面目，只缘身在此山中。",
            "genre": "诗"
        }
    ]

    print(f"\n测试生成 {len(test_poetries)} 首诗词\n")

    async with httpx.AsyncClient() as client:
        results = {}

        for poetry in test_poetries:
            print(f"处理：{poetry['title']} (ID: {poetry['id']})")
            result = await generate_content(
                client,
                title=poetry["title"],
                content=poetry["content"],
                author="苏轼",
                dynasty="宋",
                genre=poetry["genre"],
                poetry_id=poetry["id"]
            )

            if result:
                results[str(poetry["id"])] = result

            # 避免限流，间隔 2 秒
            await asyncio.sleep(2)

    # 保存结果
    output_file = "ai_generated_test.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n{'=' * 60}")
    print(f"测试完成！共 {len(results)} 首")
    print(f"结果已保存到：{output_file}")

    # 预览结果
    if results:
        print("\n【结果预览】")
        for pid, data in results.items():
            print(f"\n诗词 ID {pid} ({test_poetries[int(pid)-1]['title']}):")
            print(f"  译文：{data.get('translations', 'N/A')[:60]}...")
            print(f"  赏析：{data.get('appreciation', 'N/A')[:60]}...")
            if 'ai_interpretation' in data:
                ai = data['ai_interpretation']
                print(f"  AI 主旨：{ai.get('summary', 'N/A')}")


if __name__ == "__main__":
    asyncio.run(main())
