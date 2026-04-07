#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
古诗文网爬虫 - 爬取苏轼诗词的译文和赏析
"""

import asyncio
import json
import os
import re
from typing import Optional, Dict, List

try:
    import httpx
except ImportError:
    print("请安装 httpx: pip install httpx")
    exit(1)

# 爬虫配置
CRAWLER_DELAY = 2.0  # 请求间隔（秒）
CRAWLER_TIMEOUT = 30  # 超时时间（秒）

# 古诗文网 URL
BASE_URL = "https://www.gushiwen.cn"

# 苏轼诗词的 URL 列表（从搜索结果获取）
POETRY_URLS = {
    "念奴娇·赤壁怀古": "https://www.gushiwen.cn/shiwenv_5fb51378286c.aspx",
    "水调歌头·明月几时有": "https://www.gushiwen.cn/shiwenv_13bc537556.aspx",
    "江城子·乙卯正月二十日夜记梦": "https://www.gushiwen.cn/shiwenv_381e5f2f19.aspx",
    "定风波·莫听穿林打叶声": "https://www.gushiwen.cn/shiwenv_9070f5b32c25.aspx",
    "饮湖上初晴后雨": "https://www.gushiwen.cn/shiwenv_181bfb628915.aspx",
    "题西林壁": "https://www.gushiwen.cn/shiwenv_5fb51378286d.aspx",
}


async def fetch_page(client: httpx.AsyncClient, url: str) -> Optional[str]:
    """获取页面内容"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        }
        response = await client.get(url, headers=headers, timeout=CRAWLER_TIMEOUT)
        if response.status_code == 200:
            return response.text
        print(f"  ✗ 获取失败：{response.status_code}")
        return None
    except Exception as e:
        print(f"  ✗ 请求错误：{e}")
        return None


def extract_content(html: str) -> Dict:
    """从 HTML 中提取译文和赏析"""
    result = {
        "translations": "",
        "appreciation": ""
    }

    if not html:
        return result

    # 提取译文
    # 古诗文网的译文在 <div class="contson"> 标签后的译文段落
    translation_match = re.search(r'<h2>译文</h2>.*?<div class="contson">(.*?)</div>', html, re.DOTALL)
    if translation_match:
        translation = translation_match.group(1)
        # 清理 HTML 标签
        translation = re.sub(r'<br\s*/?>', '\n', translation)
        translation = re.sub(r'<[^>]+>', '', translation)
        translation = translation.strip()
        if translation:
            result["translations"] = translation

    # 提取赏析
    appreciation_match = re.search(r'<h2>赏析</h2>.*?<div class="contson">(.*?)</div>', html, re.DOTALL)
    if appreciation_match:
        appreciation = appreciation_match.group(1)
        # 清理 HTML 标签
        appreciation = re.sub(r'<br\s*/?>', '\n', appreciation)
        appreciation = re.sub(r'<[^>]+>', '', appreciation)
        appreciation = appreciation.strip()
        if appreciation:
            result["appreciation"] = appreciation

    # 备用：尝试从其他位置提取
    if not result["translations"]:
        # 有些页面的结构不同
        translation_match = re.search(r'译文.*?<div class="contson">(.*?)</div>', html, re.DOTALL)
        if translation_match:
            translation = translation_match.group(1)
            translation = re.sub(r'<br\s*/?>', '\n', translation)
            translation = re.sub(r'<[^>]+>', '', translation)
            result["translations"] = translation.strip()

    if not result["appreciation"]:
        appreciation_match = re.search(r'赏析.*?<div class="contson">(.*?)</div>', html, re.DOTALL)
        if appreciation_match:
            appreciation = appreciation_match.group(1)
            appreciation = re.sub(r'<br\s*/?>', '\n', appreciation)
            appreciation = re.sub(r'<[^>]+>', '', appreciation)
            result["appreciation"] = appreciation.strip()

    return result


async def get_poetry_detail(client: httpx.AsyncClient, title: str, url: str) -> Dict:
    """获取诗词的译文和赏析"""
    print(f"  爬取：{title}...")

    html = await fetch_page(client, url)
    if html:
        content = extract_content(html)
        if content["translations"] or content["appreciation"]:
            return content

    print(f"  ✗ 未找到：{title}")
    return {"translations": "", "appreciation": ""}


async def main():
    """主函数"""
    print("=" * 50)
    print("古诗文网爬虫 - 获取译文和赏析")
    print("=" * 50)

    async with httpx.AsyncClient() as client:
        results = {}

        for title, url in POETRY_URLS.items():
            content = await get_poetry_detail(client, title, url)
            if content["translations"] or content["appreciation"]:
                results[title] = content
                print(f"  ✓ {title}: 译文{len(content.get('translations', ''))}字，赏析{len(content.get('appreciation', ''))}字")
            await asyncio.sleep(CRAWLER_DELAY)

    # 保存结果
    output_file = "gushiwen_translations.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n✓ 爬取完成！共 {len(results)} 首")
    print(f"结果已保存到：{output_file}")


if __name__ == "__main__":
    asyncio.run(main())
