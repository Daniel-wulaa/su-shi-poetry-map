#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量爬取古诗文网 - 获取所有苏轼诗词的译文和赏析
使用移动端 API 获取数据（内容更完整）
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
CRAWLER_DELAY = 1.0  # 请求间隔（秒）
CRAWLER_TIMEOUT = 30  # 超时时间（秒）

# 古诗文网移动端 API（返回 JSON 数据）
MOBILE_API = "https://api.gushiwen.cn/api/poetry"
BASE_URL = "https://www.gushiwen.cn"

# 已知的 URL 映射（从之前的爬虫）
KNOWN_URLS = {
    "念奴娇·赤壁怀古": "https://www.gushiwen.cn/shiwenv_5fb51378286c.aspx",
    "水调歌头·明月几时有": "https://www.gushiwen.cn/shiwenv_13bc537556.aspx",
    "江城子·乙卯正月二十日夜记梦": "https://www.gushiwen.cn/shiwenv_381e5f2f19.aspx",
    "定风波·莫听穿林打叶声": "https://www.gushiwen.cn/shiwenv_9070f5b32c25.aspx",
    "饮湖上初晴后雨": "https://www.gushiwen.cn/shiwenv_181bfb628915.aspx",
    "题西林壁": "https://www.gushiwen.cn/shiwenv_5fb51378286d.aspx",
}


async def search_poetry(client: httpx.AsyncClient, title: str) -> Optional[str]:
    """通过搜索获取诗词详情页 URL"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Referer": "https://www.gushiwen.cn/",
        }

        # 搜索请求
        params = {"value": title}
        response = await client.get("https://www.gushiwen.cn/search.aspx", params=params, headers=headers, timeout=CRAWLER_TIMEOUT)

        if response.status_code == 200:
            html = response.text
            # 从搜索结果中提取第一个匹配的 URL
            match = re.search(r'<a[^>]*href="(/shiwenv_[a-zA-Z0-9]+\.aspx)"', html)
            if match:
                url = match.group(1)
                if not url.startswith("http"):
                    url = BASE_URL + url
                return url
        return None
    except Exception as e:
        print(f"    搜索错误：{e}")
        return None


async def fetch_page(client: httpx.AsyncClient, url: str) -> Optional[str]:
    """获取页面内容 - 使用移动端 UA 获取完整内容"""
    try:
        # 使用移动端 UA 可能返回更完整的内容
        headers = {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        }
        response = await client.get(url, headers=headers, timeout=CRAWLER_TIMEOUT)
        if response.status_code == 200:
            return response.text
        print(f"    ✗ 获取失败：{response.status_code}")
        return None
    except Exception as e:
        print(f"    ✗ 请求错误：{e}")
        return None


def extract_content(html: str, title: str = "") -> Dict:
    """从 HTML 中提取译文和赏析 - 针对古诗文网新结构"""
    result = {
        "translations": "",
        "appreciation": ""
    }

    if not html:
        return result

    # 尝试从 data 属性中提取（新结构）
    # 古诗文网有时会将内容放在 data-yiwen 或 data-shangxi 属性中
    yiwen_match = re.search(r'data-yiwen="([^"]+)"', html)
    if yiwen_match:
        result["translations"] = yiwen_match.group(1).replace("\\n", "\n")

    shangxi_match = re.search(r'data-shangxi="([^"]+)"', html)
    if shangxi_match:
        result["appreciation"] = shangxi_match.group(1).replace("\\n", "\n")

    # 尝试从<script>标签中的 JSON 数据提取
    json_match = re.search(r'var\s+poetryData\s*=\s*(\{[^}]+\})', html)
    if json_match:
        try:
            data = json.loads(json_match.group(1))
            if "yiwen" in data:
                result["translations"] = data["yiwen"]
            if "shangxi" in data:
                result["appreciation"] = data["shangxi"]
        except:
            pass

    # 备用方案：从特定 div 结构中提取
    if not result["translations"]:
        # 查找包含"译文"关键字的段落
        translation_pattern = r'译文 [：:\s]*<[^>]*>([^<]+(?:<(?!h2|div|p>)[^<]*[^<]+)*)'
        translation_match = re.search(translation_pattern, html, re.DOTALL)
        if translation_match:
            text = translation_match.group(1)
            text = re.sub(r'<[^>]+>', '', text).strip()
            if text:
                result["translations"] = text

    if not result["appreciation"]:
        appreciation_pattern = r'赏析 [：:\s]*<[^>]*>([^<]+(?:<(?!h2|div|p>)[^<]*[^<]+)*)'
        appreciation_match = re.search(appreciation_pattern, html, re.DOTALL)
        if appreciation_match:
            text = appreciation_match.group(1)
            text = re.sub(r'<[^>]+>', '', text).strip()
            if text:
                result["appreciation"] = text

    return result


async def get_poetry_detail(client: httpx.AsyncClient, title: str, known_url: Optional[str] = None) -> Dict:
    """获取诗词的译文和赏析"""
    content = {"translations": "", "appreciation": "", "url": ""}

    # 优先使用已知 URL
    if known_url:
        html = await fetch_page(client, known_url)
        if html:
            extracted = extract_content(html, title)
            if extracted["translations"] or extracted["appreciation"]:
                content = {**extracted, "url": known_url}
                return content

    # 没有已知 URL 或已知 URL 失败，尝试搜索
    url = await search_poetry(client, title)
    if url:
        content["url"] = url
        html = await fetch_page(client, url)
        if html:
            extracted = extract_content(html, title)
            if extracted["translations"] or extracted["appreciation"]:
                content = {**extracted, "url": url}

    return content


async def main():
    """主函数"""
    print("=" * 60)
    print("古诗文网批量爬虫 - 获取苏轼诗词译文和赏析")
    print("=" * 60)

    # 从数据库获取所有诗词标题
    import sqlite3
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "poetry.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, title FROM poetries ORDER BY id")
    poetries = cursor.fetchall()
    conn.close()

    print(f"\n数据库中共有 {len(poetries)} 首诗词")
    print(f"已知 URL 映射：{len(KNOWN_URLS)} 首\n")

    async with httpx.AsyncClient() as client:
        results = {}
        url_mapping = {}
        success_count = 0
        no_translation_count = 0
        fail_count = 0

        for i, (poetry_id, title) in enumerate(poetries):
            print(f"[{i+1}/{len(poetries)}] 处理：{title} (ID: {poetry_id})")

            # 优先使用已知 URL
            known_url = KNOWN_URLS.get(title)
            if known_url:
                print(f"  使用已知 URL")

            content = await get_poetry_detail(client, title, known_url)

            if content.get("translations") or content.get("appreciation"):
                results[str(poetry_id)] = {
                    "title": title,
                    "translations": content.get("translations", ""),
                    "appreciation": content.get("appreciation", "")
                }
                url_mapping[title] = content.get("url", "")
                success_count += 1

                trans_len = len(content.get("translations", ""))
                appr_len = len(content.get("appreciation", ""))
                print(f"  ✓ 成功：译文{trans_len}字，赏析{appr_len}字")
            else:
                no_content = "无译文" if not content.get("translations") else ""
                no_appr = "无赏析" if not content.get("appreciation") else ""
                if not content.get("translations"):
                    no_translation_count += 1
                else:
                    fail_count += 1
                print(f"  ⚠ {no_content} {no_appr}")

            # 避免限流，间隔请求
            await asyncio.sleep(CRAWLER_DELAY)

    # 保存结果
    output_file = "gushiwen_translations_all.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    # 保存 URL 映射（供后续使用）
    url_mapping_file = "gushiwen_url_mapping.json"
    with open(url_mapping_file, "w", encoding="utf-8") as f:
        json.dump(url_mapping, f, ensure_ascii=False, indent=2)

    print(f"\n{'=' * 60}")
    print(f"爬取完成！")
    print(f"  成功：{success_count} 首")
    print(f"  无译文：{no_translation_count} 首")
    print(f"  完全失败：{fail_count} 首")
    print(f"\n结果已保存到：{output_file}")
    print(f"URL 映射已保存到：{url_mapping_file}")


if __name__ == "__main__":
    asyncio.run(main())
