# 地理编码服务
from typing import Optional, Dict, Any, List
import httpx

from app.config import settings


class GeocodingService:
    """高德地图地理编码服务"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.amap_api_key
        self.base_url = "https://restapi.amap.com/v3/geocode/geo"
        self.reverse_url = "https://restapi.amap.com/v3/geocode/regeo"

    async def geocode(self, address: str) -> Optional[Dict[str, Any]]:
        """
        地址地理编码（地址 -> 经纬度）

        Args:
            address: 地址名称

        Returns:
            {'latitude': float, 'longitude': float, 'formatted_address': str} or None
        """
        if not self.api_key:
            print("警告：高德 API Key 未配置")
            return None

        params = {
            "address": address,
            "key": self.api_key,
            "output": "json",
        }

        async with httpx.AsyncClient(timeout=30) as client:
            try:
                response = await client.get(self.base_url, params=params)
                data = response.json()

                if data.get("status") == "1" and data.get("geocodes"):
                    geocode = data["geocodes"][0]
                    location = geocode.get("location", "").split(",")
                    return {
                        "latitude": float(location[1]) if len(location) > 1 else None,
                        "longitude": float(location[0]) if len(location) > 0 else None,
                        "formatted_address": geocode.get("formatted_address", ""),
                        "province": geocode.get("province", ""),
                        "city": geocode.get("city", ""),
                        "district": geocode.get("district", ""),
                    }
            except Exception as e:
                print(f"地理编码失败 {address}: {e}")

        return None

    async def reverse_geocode(
        self,
        latitude: float,
        longitude: float,
    ) -> Optional[Dict[str, Any]]:
        """
        逆地理编码（经纬度 -> 地址）

        Args:
            latitude: 纬度
            longitude: 经度

        Returns:
            {'formatted_address': str, 'province': str, 'city': str, ...} or None
        """
        if not self.api_key:
            return None

        params = {
            "key": self.api_key,
            "location": f"{longitude},{latitude}",
            "output": "json",
        }

        async with httpx.AsyncClient(timeout=30) as client:
            try:
                response = await client.get(self.reverse_url, params=params)
                data = response.json()

                if data.get("status") == "1" and data.get("regeocode"):
                    regeo = data["regeocode"]
                    return {
                        "formatted_address": regeo.get("formatted_address", ""),
                        "province": regeo.get("addressComponent", {}).get("province", ""),
                        "city": regeo.get("addressComponent", {}).get("city", ""),
                        "district": regeo.get("addressComponent", {}).get("district", ""),
                    }
            except Exception as e:
                print(f"逆地理编码失败：{e}")

        return None

    async def batch_geocode(
        self,
        addresses: List[str],
        delay: float = 0.5,
    ) -> Dict[str, Optional[Dict[str, Any]]]:
        """
        批量地理编码

        Args:
            addresses: 地址列表
            delay: 请求间隔

        Returns:
            {address: result} 字典
        """
        import asyncio

        results = {}
        for address in addresses:
            print(f"地理编码：{address}")
            result = await self.geocode(address)
            results[address] = result

            if delay > 0:
                await asyncio.sleep(delay)

        return results


# 苏轼诗词常见地点的古今对照
ANCIENT_LOCATION_MAP = {
    # 四川
    "眉州": "四川省眉山市",
    "眉山": "四川省眉山市",
    "嘉州": "四川省乐山市",
    # 河南
    "汴京": "河南省开封市",
    "开封": "河南省开封市",
    "汝州": "河南省汝州市",
    # 陕西
    "凤翔": "陕西省宝鸡市凤翔区",
    "凤翔府": "陕西省宝鸡市凤翔区",
    # 浙江
    "杭州": "浙江省杭州市",
    "钱塘": "浙江省杭州市",
    "临安": "浙江省杭州市临安区",
    "密州": "山东省潍坊市诸城市",
    "徐州": "江苏省徐州市",
    "湖州": "浙江省湖州市",
    # 湖北
    "黄州": "湖北省黄冈市",
    "黄冈": "湖北省黄冈市",
    "赤壁": "湖北省咸宁市赤壁市",
    # 广东
    "惠州": "广东省惠州市",
    "儋州": "海南省儋州市",
    "琼州": "海南省海口市",
    # 江苏
    "常州": "江苏省常州市",
    "苏州": "江苏省苏州市",
    "扬州": "江苏省扬州市",
    # 河北
    "定州": "河北省定州市",
    "真定": "河北省正定县",
}


async def geocode_ancient_location(
    ancient_name: str,
    service: Optional[GeocodingService] = None,
) -> Optional[Dict[str, Any]]:
    """
    地理编码古代地名

    Args:
        ancient_name: 古代地名
        service: 地理编码服务实例

    Returns:
        地理编码结果
    """
    if service is None:
        service = GeocodingService()

    # 先查表
    modern_address = ANCIENT_LOCATION_MAP.get(ancient_name)

    if modern_address:
        print(f"{ancient_name} -> {modern_address}")
        result = await service.geocode(modern_address)
        if result:
            result["ancient_name"] = ancient_name
            return result

    # 表中没有，直接查询古代地名
    print(f"直接查询：{ancient_name}")
    result = await service.geocode(ancient_name)
    if result:
        result["ancient_name"] = ancient_name
        return result

    return None
