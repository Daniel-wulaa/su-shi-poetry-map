# 古诗文网爬虫
import asyncio
import re
from typing import List, Dict, Optional, Any
from datetime import datetime

from app.spiders.base_spider import BaseSpider
from app.models.poetry import Poetry
from app.db.session import async_session_maker
from sqlalchemy import select


class GushiwenSpider(BaseSpider):
    """古诗文网爬虫 - 爬取苏轼诗词"""

    def __init__(self, delay: float = 1.5, timeout: int = 30):
        super().__init__(
            base_url="https://www.guwendao.net",
            delay=delay,
            timeout=timeout,
        )

        # 苏轼诗词搜索 URL - 使用新域名
        self.search_url = "https://www.guwendao.net/shiwens/default.aspx"
        self.author = "苏轼"

        # 苏轼人生时期
        self.periods = {
            1037: "出生眉山",
            1057: "进士及第",
            1061: "凤翔签判",
            1071: "通判杭州",
            1075: "知密州",
            1079: "乌台诗案",
            1080: "黄州团练",
            1084: "移汝州",
            1089: "知杭州",
            1094: "贬惠州",
            1097: "贬儋州",
            1101: "卒于常州",
        }

    async def search_poetries(self, page: int = 1) -> List[Dict[str, Any]]:
        """搜索苏轼诗词列表"""
        # 使用 astr 参数搜索作者
        params = {
            "astr": self.author,
            "page": page,
        }

        html = await self.fetch(self.search_url, params=params)
        if not html:
            return []

        soup = self.parse(html)
        poetries = []

        # 查找诗词列表项 - 使用 .sons 选择器
        for item in soup.select(".sons"):
            poetry_data = self._parse_poetry_item(item)
            if poetry_data:
                poetries.append(poetry_data)

        return poetries

    def _parse_poetry_item(self, item) -> Optional[Dict[str, Any]]:
        """解析单个诗词条目"""
        try:
            # 标题
            title_elem = item.select_one(".cont a[target='_blank']")
            if not title_elem:
                return None
            title = title_elem.get_text(strip=True)
            content_link = title_elem.get("href", "")

            # 作者和朝代 - 从 .author 元素获取
            author_elem = item.select_one(".author a")
            dynasty_text = ""
            author = self.author
            dynasty = "宋"

            if author_elem:
                author_text = author_elem.get_text(strip=True)
                # 解析 "宋代：苏轼" 格式
                if "：" in author_text or ":" in author_text:
                    parts = re.split(r"[:：]", author_text, 1)
                    if len(parts) == 2:
                        dynasty = parts[0].strip()
                        author = parts[1].strip()
                else:
                    author = author_text

            return {
                "title": title,
                "author": author,
                "dynasty": dynasty,
                "content_url": content_link,
            }
        except Exception as e:
            print(f"解析诗词条目失败：{e}")
            return None

    async def fetch_poetry_detail(self, content_url: str) -> Optional[Dict[str, Any]]:
        """获取诗词详情"""
        if not content_url:
            return None

        # 补全 URL - 使用新域名
        if content_url.startswith("/"):
            content_url = f"https://www.guwendao.net{content_url}"

        html = await self.fetch(content_url)
        if not html:
            return None

        soup = self.parse(html)
        return self._parse_poetry_detail(soup, content_url)

    def _parse_poetry_detail(self, soup, url: str) -> Optional[Dict[str, Any]]:
        """解析诗词详情页"""
        try:
            data = {
                "title": "",
                "author": self.author,
                "dynasty": "宋",
                "content": "",
                "background": "",
                "annotations": "",
                "translations": "",
                "tags": "",
                "url": url,
            }

            # 主内容区 - 使用 left 类，选择第二个（诗词内容区）
            lefts = soup.select(".left")
            main = lefts[1] if len(lefts) > 1 else (lefts[0] if lefts else soup.body)

            # 标题 - 查找 h1
            title_elem = main.select_one("h1")
            if title_elem:
                data["title"] = title_elem.get_text(strip=True)

            # 朝代和作者 - 查找 source 类元素
            source_elem = main.select_one(".source")
            if source_elem:
                text = source_elem.get_text(strip=True)
                # 解析 "苏轼〔宋代〕" 格式
                if "〔" in text and "〕" in text:
                    author_part = text.split("〔")[0].strip()
                    dynasty_part = text.split("〔")[1].split("〕")[0].strip()
                    if author_part:
                        data["author"] = author_part
                    if dynasty_part:
                        data["dynasty"] = dynasty_part

            # 诗词正文 - 查找 contson 类的所有段落
            content_parts = []
            content_elems = main.select(".contson")
            for elem in content_elems:
                text = elem.get_text(strip=True)
                if text and len(text) > 5:  # 过滤太短的内容
                    content_parts.append(text)

            data["content"] = "\n".join(content_parts)

            # 如果正文没找到，尝试其他方式
            if not data["content"]:
                # 尝试查找带有特定 class 的内容
                for elem in main.select(".swen, .content, p"):
                    text = elem.get_text(strip=True)
                    if text and len(text) > 10 and not text.startswith("http"):
                        content_parts.append(text)
                data["content"] = "\n".join(content_parts[:10])

            # 注释和赏析 - 查找特定 class
            sections = main.select(".appreciate, .translation, .notes, .zhushi, .yishang")
            for section in sections:
                section_class = section.get("class", [])
                if "appreciate" in section_class or "yishang" in section_class:
                    data["background"] = section.get_text(strip=True)
                elif "translation" in section_class:
                    data["translations"] = section.get_text(strip=True)
                elif "notes" in section_class or "zhushi" in section_class:
                    data["annotations"] = section.get_text(strip=True)

            # 标签 - 查找 tag 类
            tag_elems = main.select(".tag .tags a, .tag a")
            tags = [tag.get_text(strip=True) for tag in tag_elems]
            data["tags"] = ",".join(tags) if tags else ""

            return data
        except Exception as e:
            print(f"解析诗词详情失败：{e}")
            return None

    async def crawl(
        self,
        max_pages: int = 10,
        save_to_db: bool = True,
    ) -> List[Dict[str, Any]]:
        """
        爬取苏轼诗词

        Args:
            max_pages: 最多爬取多少页
            save_to_db: 是否保存到数据库

        Returns:
            爬取的诗词列表
        """
        print(f"开始爬取古诗文网 - 苏轼诗词")
        print(f"延迟：{self.delay}s, 超时：{self.timeout}s")

        all_poetries = []
        seen_titles = set()

        for page in range(1, max_pages + 1):
            print(f"\n爬取第 {page} 页...")

            # 获取诗词列表
            poetries = await self.search_poetries(page)
            if not poetries:
                print(f"第 {page} 页无数据，可能已到达末页")
                break

            print(f"找到 {len(poetries)} 首诗词")

            # 获取每首诗词的详情
            for poetry in poetries:
                # 去重
                if poetry["title"] in seen_titles:
                    print(f"  跳过重复：{poetry['title']}")
                    continue
                seen_titles.add(poetry["title"])

                # 获取详情
                print(f"  获取详情：{poetry['title']}")
                detail = await self.fetch_poetry_detail(poetry["content_url"])

                if detail:
                    # 合并数据
                    poetry.update(detail)
                    all_poetries.append(poetry)

                # 随机延迟
                await self.sleep()

        print(f"\n爬取完成，共获取 {len(all_poetries)} 首诗词")

        if save_to_db and all_poetries:
            await self._save_to_db(all_poetries)

        return all_poetries

    async def _save_to_db(self, poetries: List[Dict[str, Any]]):
        """保存到数据库"""
        print(f"正在保存 {len(poetries)} 首诗词到数据库...")

        async with async_session_maker() as session:
            for poetry_data in poetries:
                # 检查是否已存在
                existing = await session.execute(
                    select(Poetry).where(Poetry.title == poetry_data["title"])
                )
                if existing.scalar_one_or_none():
                    print(f"  已存在：{poetry_data['title']}")
                    continue

                # 推断时期
                year = self._infer_year(poetry_data.get("tags", ""))
                period = self._get_period(year)

                # 创建诗词
                poetry = Poetry(
                    title=poetry_data["title"],
                    content=poetry_data["content"],
                    dynasty=poetry_data.get("dynasty", "宋"),
                    author=poetry_data.get("author", "苏轼"),
                    year=year,
                    period=period,
                    genre=self._infer_genre(poetry_data["title"]),
                    tags=poetry_data.get("tags", ""),
                    background=poetry_data.get("background", ""),
                    annotations=poetry_data.get("annotations", ""),
                    translations=poetry_data.get("translations", ""),
                )

                session.add(poetry)
                print(f"  已添加：{poetry.title}")

            await session.commit()

        print("数据库保存完成")

    def _infer_year(self, tags: str) -> Optional[int]:
        """从标签推断年份"""
        if not tags:
            return None

        # 尝试从标签中提取年份
        year_match = re.search(r"(10\d{2}|1101)", tags)
        if year_match:
            return int(year_match.group())

        return None

    def _get_period(self, year: Optional[int]) -> str:
        """根据年份获取时期"""
        if year is None:
            return "未知时期"

        # 找到最接近的时期
        closest_period = "未知时期"
        min_diff = 1000

        for period_year, period_name in self.periods.items():
            diff = abs(year - period_year)
            if diff < min_diff:
                min_diff = diff
                closest_period = period_name

        return closest_period

    def _infer_genre(self, title: str) -> str:
        """从标题推断题材"""
        if not title:
            return "诗"

        # 词牌名特征
        ci_patterns = [
            "念奴娇", "水调歌头", "定风波", "临江仙", "江城子",
            "浣溪沙", "卜算子", "西江月", "如梦令", "菩萨蛮",
            "蝶恋花", "渔家傲", "满江红", "沁园春", "忆江南",
        ]

        for pattern in ci_patterns:
            if pattern in title:
                return "词"

        # 赋
        if "赋" in title:
            return "赋"

        # 默认是诗
        return "诗"


async def main():
    """爬取入口"""
    spider = GushiwenSpider(delay=1.0, timeout=30)
    # 每页约 20 首，爬取 20 页可获得约 400 首
    poetries = await spider.crawl(max_pages=20, save_to_db=True)
    print(f"\n总计：{len(poetries)} 首")


if __name__ == "__main__":
    asyncio.run(main())
