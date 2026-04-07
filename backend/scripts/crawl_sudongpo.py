#!/usr/bin/env python3
# 爬取苏东坡网站内容
import requests
import json
from datetime import datetime

BASE_URL = "https://www.sudongpo.org/wp-json/wp/v2"

def fetch_posts(category=None, per_page=100):
    """获取文章列表"""
    params = {"per_page": per_page}
    if category:
        params["categories"] = category

    response = requests.get(f"{BASE_URL}/posts", params=params)
    return response.json()

def fetch_categories():
    """获取分类目录"""
    response = requests.get(f"{BASE_URL}/categories")
    return response.json()

def save_to_json(data, filename):
    """保存为 JSON 文件"""
    import os
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"已保存到 {filename}")

def clean_html(content):
    """简单的 HTML 清理"""
    import re
    # 移除 script 和 style 标签
    content = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.DOTALL)
    content = re.sub(r'<style[^>]*>.*?</style>', '', content, flags=re.DOTALL)
    # 移除 img 标签
    content = re.sub(r'<img[^>]*>', '', content)
    # 移除其他 HTML 标签
    content = re.sub(r'<[^>]+>', '', content)
    # 解码 HTML 实体
    content = content.replace('&nbsp;', ' ')
    content = content.replace('&quot;', '"')
    content = content.replace('&#8230;', '...')
    content = content.replace('&#8212;', '—')
    return content.strip()

def main():
    print("开始爬取苏东坡网站内容...")
    print(f"时间：{datetime.now()}")

    # 获取分类
    print("\n1. 获取分类目录...")
    categories = fetch_categories()
    save_to_json(categories, "backend/data/sudongpo_categories.json")

    for cat in categories:
        print(f"  - {cat['name']} ({cat['count']}篇文章)")

    # 获取所有文章
    print("\n2. 获取所有文章...")
    posts = fetch_posts(per_page=100)
    print(f"  共获取 {len(posts)} 篇文章")

    # 整理文章数据
    posts_data = []
    for post in posts:
        posts_data.append({
            "id": post["id"],
            "title": post["title"]["rendered"],
            "slug": post["slug"],
            "date": post["date"],
            "categories": post["categories"],
            "tags": post["tags"],
            "content": clean_html(post["content"]["rendered"]),
            "excerpt": clean_html(post["excerpt"]["rendered"]),
            "link": post["link"]
        })

    save_to_json(posts_data, "backend/data/sudongpo_posts.json")

    # 按分类获取
    print("\n3. 按分类获取文章...")
    for cat in categories:
        cat_posts = fetch_posts(category=cat["id"], per_page=50)
        if cat_posts:
            print(f"  - {cat['name']}: {len(cat_posts)} 篇")
            save_to_json(cat_posts, f"backend/data/sudongpo_cat_{cat['slug']}.json")

    print("\n✓ 爬取完成！")
    print("\n生成的文件:")
    print("  - backend/data/sudongpo_categories.json - 分类目录")
    print("  - backend/data/sudongpo_posts.json - 所有文章")
    print("  - backend/data/sudongpo_cat_*.json - 按分类的文章")

if __name__ == "__main__":
    main()
