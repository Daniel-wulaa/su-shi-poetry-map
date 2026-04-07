# 景点信息爬虫
import asyncio
from typing import Optional, Dict, Any, List

from app.spiders.base_spider import BaseSpider
from app.models.location import Location
from app.db.session import async_session_maker
from sqlalchemy import select


class AttractionSpider(BaseSpider):
    """景点信息爬虫"""

    def __init__(self, delay: float = 1.0, timeout: int = 30):
        super().__init__(
            base_url="https://www.mafengwo.cn",
            delay=delay,
            timeout=timeout,
        )

    async def search_attraction(self, keyword: str) -> Optional[Dict[str, Any]]:
        """
        搜索景点信息

        Args:
            keyword: 景点关键词

        Returns:
            景点信息字典
        """
        # 马蜂窝搜索
        search_url = "https://www.mafengwo.cn/w/c-0-0-0-0-0-0.html"
        # 由于马蜂窝需要登录，这里使用维基百科作为备选

        # 尝试维基百科
        return await self._fetch_wikipedia(keyword)

    async def _fetch_wikipedia(self, keyword: str) -> Optional[Dict[str, Any]]:
        """从维基百科获取景点信息"""
        url = f"https://zh.wikipedia.org/w/api.php"
        params = {
            "action": "query",
            "format": "json",
            "prop": "extracts|pageimages",
            "piprop": "original",
            "exintro": True,
            "explaintext": True,
            "titles": keyword,
        }

        html = await self.fetch(url, params=params)
        if not html:
            return None

        try:
            import json
            data = json.loads(html)
            pages = data.get("query", {}).get("pages", {})

            for page_id, page_data in pages.items():
                if int(page_id) < 0:  # 页面不存在
                    continue

                return {
                    "title": page_data.get("title", ""),
                    "extract": page_data.get("extract", ""),
                    "image": page_data.get("original", {}).get("source", ""),
                    "source": "wikipedia",
                }
        except Exception as e:
            print(f"解析维基百科失败：{e}")

        return None

    async def crawl_locations(
        self,
        locations: List[Location],
        save_to_db: bool = True,
    ) -> List[Dict[str, Any]]:
        """
        爬取地点景点信息

        Args:
            locations: 地点列表
            save_to_db: 是否保存到数据库

        Returns:
            景点信息列表
        """
        print(f"开始爬取 {len(locations)} 个地点的景点信息...")

        results = []

        for location in locations:
            print(f"\n爬取：{location.name} ({location.ancient_name or ''})")

            # 构建搜索关键词
            keywords = []
            if location.ancient_name:
                keywords.append(f"{location.ancient_name} 景点")
                keywords.append(f"{location.ancient_name} 苏轼")
            keywords.append(f"{location.name} 景点")
            keywords.append(f"{location.name} 旅游")

            attraction_info = None
            for keyword in keywords:
                info = await self.search_attraction(keyword)
                if info and info.get("extract"):
                    attraction_info = info
                    print(f"  找到：{keyword}")
                    break
                await self.sleep()

            if attraction_info:
                results.append({
                    "location_id": location.id,
                    "location_name": location.name,
                    "attraction_info": attraction_info.get("extract", ""),
                    "image": attraction_info.get("image", ""),
                })

        if save_to_db and results:
            await self._update_locations(results)

        return results

    async def _update_locations(self, results: List[Dict[str, Any]]):
        """更新地点表"""
        print(f"正在更新 {len(results)} 个地点...")

        async with async_session_maker() as session:
            for result in results:
                location = await session.get(Location, result["location_id"])
                if location:
                    location.attraction_info = result["attraction_info"]
                    if result.get("image"):
                        # 如果已有图片，追加；否则直接设置
                        import json
                        try:
                            images = json.loads(location.images or "[]")
                            images.append(result["image"])
                            location.images = json.dumps(images)
                        except:
                            location.images = json.dumps([result["image"]])
                    print(f"  已更新：{location.name}")

            await session.commit()

        print("地点信息更新完成")


# 苏轼相关景点预设数据
SU_SHI_ATTRACTIONS = {
    "眉山市": {
        "name": "三苏祠",
        "description": "三苏祠是苏洵、苏轼、苏辙三父子的故居，位于四川省眉山市。",
    },
    "黄冈市": {
        "name": "东坡赤壁",
        "description": "东坡赤壁位于湖北省黄冈市，是苏轼被贬黄州时常游之地，写下《念奴娇·赤壁怀古》等名篇。",
    },
    "杭州市": {
        "name": "苏堤",
        "description": "苏堤是苏轼任杭州知州时疏浚西湖所筑，今为西湖十景之一'苏堤春晓'。",
    },
    "惠州市": {
        "name": "东坡祠",
        "description": "惠州东坡祠是纪念苏轼的祠庙，位于广东省惠州市。",
    },
    "儋州市": {
        "name": "东坡书院",
        "description": "东坡书院位于海南省儋州市，是苏轼贬谪儋州时讲学的地方。",
    },
    "常州市": {
        "name": "东坡公园",
        "description": "常州东坡公园是纪念苏轼的公园，位于江苏省常州市。",
    },
}


async def seed_su_shi_attractions():
    """预设苏轼景点数据"""
    async with async_session_maker() as session:
        for city_name, attraction in SU_SHI_ATTRACTIONS.items():
            location = await session.execute(
                select(Location).where(Location.city == city_name)
            )
            location = location.scalar_one_or_none()

            if location:
                location.attraction_info = attraction["description"]
                print(f"已更新：{city_name} - {attraction['name']}")

        await session.commit()

    print("预设景点数据更新完成")
