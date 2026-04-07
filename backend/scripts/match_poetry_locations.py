# 诗词地点自动匹配脚本
# 将诗词与地点进行关联

import asyncio
import re
from typing import Dict, List, Optional, Set, Tuple

from app.db.session import async_session_maker
from app.models.poetry import Poetry, PoetryLocation
from app.models.location import Location
from sqlalchemy import select


# 苏轼去过的地方 - 古今地名映射
# 格式：{古代地名：(现代地名，纬度，经度，相关时期)}
ANCIENT_MODERN_PLACES = {
    # 四川地区（苏轼故乡）
    "眉州": ("眉山", 30.044, 103.836, "出生眉山"),
    "眉山": ("眉山", 30.044, 103.836, "出生眉山"),
    "嘉州": ("乐山", 29.582, 103.765, "出生眉山"),
    "峨眉山": ("峨眉山", 29.543, 103.335, "出生眉山"),

    # 河南地区
    "汴京": ("开封", 34.797, 114.307, "进士及第"),
    "开封": ("开封", 34.797, 114.307, "进士及第"),
    "汝州": ("汝州", 34.166, 112.846, "移汝州"),

    # 陕西地区
    "凤翔": ("凤翔", 34.505, 107.393, "凤翔签判"),
    "凤翔府": ("凤翔", 34.505, 107.393, "凤翔签判"),

    # 浙江地区
    "杭州": ("杭州", 30.274, 120.155, "通判杭州"),
    "钱塘": ("杭州", 30.274, 120.155, "通判杭州"),
    "西湖": ("杭州", 30.274, 120.155, "知杭州"),
    "临安": ("杭州", 30.274, 120.155, "知杭州"),

    # 山东地区
    "密州": ("诸城", 35.995, 119.423, "知密州"),
    "诸城": ("诸城", 35.995, 119.423, "知密州"),

    # 江苏地区
    "徐州": ("徐州", 34.205, 117.284, "知徐州"),
    "彭城": ("徐州", 34.205, 117.284, "知徐州"),
    "扬州": ("扬州", 32.391, 119.412, "知扬州"),
    "真州": ("仪征", 32.279, 119.159, "知扬州"),
    "常州": ("常州", 31.812, 119.973, "卒于常州"),
    "金陵": ("南京", 32.062, 118.777, "北归时期"),
    "江宁": ("南京", 32.062, 118.777, "北归时期"),
    "京口": ("镇江", 32.204, 119.452, "北归时期"),
    "润州": ("镇江", 32.204, 119.452, "北归时期"),
    "姑苏": ("苏州", 31.300, 120.595, "北归时期"),
    "平江": ("苏州", 31.300, 120.595, "北归时期"),

    # 湖北地区
    "黄州": ("黄冈", 30.450, 114.874, "黄州团练"),
    "黄冈": ("黄冈", 30.450, 114.874, "黄州团练"),
    "赤壁": ("黄冈", 30.450, 114.874, "黄州团练"),
    "武昌": ("鄂州", 30.389, 114.893, "黄州团练"),
    "鄂州": ("鄂州", 30.389, 114.893, "黄州团练"),
    "江夏": ("武汉", 30.593, 114.305, "黄州团练"),

    # 江西地区
    "江州": ("九江", 29.705, 116.001, "移汝州"),
    "九江": ("九江", 29.705, 116.001, "移汝州"),
    "庐山": ("庐山", 29.555, 115.983, "移汝州"),
    "洪州": ("南昌", 28.683, 115.857, "移汝州"),
    "南昌": ("南昌", 28.683, 115.857, "移汝州"),

    # 安徽地区
    "滁州": ("滁州", 32.317, 118.317, "移汝州"),
    "和州": ("和县", 31.718, 118.366, "移汝州"),

    # 湖南地区
    "潭州": ("长沙", 28.228, 112.938, "贬惠州"),
    "长沙": ("长沙", 28.228, 112.938, "贬惠州"),
    "岳阳": ("岳阳", 29.371, 113.094, "贬惠州"),
    "洞庭": ("岳阳", 29.371, 113.094, "贬惠州"),
    "衡山": ("衡阳", 26.897, 112.586, "贬惠州"),
    "衡阳": ("衡阳", 26.897, 112.586, "贬惠州"),

    # 广东地区
    "广州": ("广州", 23.130, 113.264, "贬惠州"),
    "惠州": ("惠州", 23.112, 114.415, "贬惠州"),
    "循州": ("惠州", 23.112, 114.415, "贬惠州"),
    "韶州": ("韶关", 24.812, 113.592, "贬惠州"),
    "英州": ("英德", 24.185, 113.413, "贬惠州"),
    "清远": ("清远", 23.702, 113.056, "贬惠州"),
    "罗浮山": ("博罗", 23.176, 114.287, "贬惠州"),

    # 海南地区
    "儋州": ("儋州", 19.526, 109.577, "贬儋州"),
    "琼州": ("海口", 20.044, 110.194, "贬儋州"),
    "海口": ("海口", 20.044, 110.194, "贬儋州"),
    "海南": ("海口", 20.044, 110.194, "贬儋州"),

    # 广西地区
    "梧州": ("梧州", 23.477, 111.316, "贬惠州"),
    "藤州": ("藤县", 23.379, 110.917, "贬惠州"),
    "容州": ("容县", 22.858, 110.561, "贬惠州"),
    "廉州": ("合浦", 21.666, 109.196, "贬惠州"),

    # 福建地区
    "福州": ("福州", 26.078, 119.293, "通判杭州"),
    "闽": ("福州", 26.078, 119.293, "通判杭州"),
    "建州": ("建瓯", 27.044, 118.316, "通判杭州"),

    # 其他地区
    "长安": ("西安", 34.341, 108.940, "北归时期"),
    "西安": ("西安", 34.341, 108.940, "北归时期"),
    "洛阳": ("洛阳", 34.619, 112.439, "北归时期"),
}

# 诗词标题中常见的地点前缀/后缀
LOCATION_PATTERNS = [
    r"^(?:[送别赠寄呈回复) (.+?)[（(]",  # 送 XX、赠 XX
    r"^(?:[游过题宿登望谒访) (.+?) []",  # 游 XX、题 XX
    r"[（(]?(?:[作于写于]) (.+?)[) ）]",  # 作于 XX
]

# 苏轼人生时期与地点的映射
PERIOD_LOCATIONS = {
    "出生眉山": ["眉州", "眉山", "嘉州"],
    "进士及第": ["汴京", "开封"],
    "凤翔签判": ["凤翔", "凤翔府"],
    "通判杭州": ["杭州", "西湖", "钱塘"],
    "知密州": ["密州", "诸城"],
    "黄州团练": ["黄州", "黄冈", "赤壁"],
    "移汝州": ["汝州"],
    "知杭州": ["杭州", "西湖"],
    "知徐州": ["徐州", "彭城"],
    "贬惠州": ["惠州", "广州", "韶州"],
    "贬儋州": ["儋州", "琼州", "海口"],
    "北归时期": ["常州", "金陵", "京口"],
    "未知时期": [],
}


def extract_locations_from_text(text: str) -> Set[str]:
    """从诗词文本中提取可能的地名"""
    found_locations = set()

    # 匹配古代地名
    for ancient_name in ANCIENT_MODERN_PLACES.keys():
        if ancient_name in text:
            found_locations.add(ancient_name)

    return found_locations


def match_location(place_name: str) -> Optional[Tuple[str, float, float, str]]:
    """匹配地点到现代坐标"""
    if place_name in ANCIENT_MODERN_PLACES:
        return ANCIENT_MODERN_PLACES[place_name]
    return None


async def create_location_if_not_exists(
    session, name: str, ancient_name: Optional[str], lat: float, lng: float,
    city: Optional[str] = None, province: Optional[str] = None
) -> int:
    """创建或获取地点，返回地点 ID（处理重复记录）"""
    # 先查找是否已存在
    result = await session.execute(
        select(Location).where(
            (Location.name == name) |
            (Location.ancient_name == ancient_name)
        ).limit(1)
    )
    location = result.scalar_one_or_none()

    if location:
        return location.id

    # 创建新地点
    location = Location(
        name=name,
        ancient_name=ancient_name,
        latitude=lat,
        longitude=lng,
        city=city,
        province=province,
    )
    session.add(location)
    await session.commit()
    await session.refresh(location)
    return location.id


async def match_poetry_by_title(poetry: Poetry, session) -> Optional[Tuple[int, str, str]]:
    """通过诗词标题匹配地点"""
    title = poetry.title

    # 从标题中提取地名
    found_locations = extract_locations_from_text(title)

    for place in found_locations:
        location_info = match_location(place)
        if location_info:
            modern_name, lat, lng, related_period = location_info
            return (
                await create_location_if_not_exists(
                    session, modern_name, place, lat, lng
                ),
                "creation_place",
                f"从标题'{title}'中提取"
            )

    return None


async def match_poetry_by_content(poetry: Poetry, session) -> List[Tuple[int, str, str]]:
    """通过诗词内容匹配地点"""
    results = []

    # 从内容中提取地名
    found_locations = extract_locations_from_text(poetry.content)

    for place in found_locations:
        location_info = match_location(place)
        if location_info:
            modern_name, lat, lng, related_period = location_info
            location_id = await create_location_if_not_exists(
                session,
                modern_name, place, lat, lng
            )
            # 判断是创作地还是提及地
            relation_type = "creation_place" if poetry.period == related_period else "mentioned"
            note = f"从内容中提取：{place}"
            results.append((location_id, relation_type, note))

    return results


async def match_poetry_by_period(poetry: Poetry, session) -> List[Tuple[int, str, str]]:
    """通过创作时期匹配地点"""
    results = []

    if not poetry.period:
        return results

    period_locations = PERIOD_LOCATIONS.get(poetry.period, [])

    for place_name in period_locations:
        location_info = match_location(place_name)
        if location_info:
            modern_name, lat, lng, _ = location_info
            location_id = await create_location_if_not_exists(
                session,
                modern_name, place_name, lat, lng
            )
            results.append((location_id, "creation_place", f"根据时期'{poetry.period}'推断"))

    return results


async def process_single_poetry(poetry: Poetry, session) -> int:
    """处理单首诗词的地点匹配"""
    matches = []
    seen_locations = set()

    # 1. 优先从标题匹配（最可靠）
    title_match = await match_poetry_by_title(poetry, session)
    if title_match:
        loc_id, rel_type, note = title_match
        if loc_id not in seen_locations:
            seen_locations.add(loc_id)
            matches.append((loc_id, rel_type, note))

    # 2. 从内容匹配
    content_matches = await match_poetry_by_content(poetry, session)
    for loc_id, rel_type, note in content_matches:
        if loc_id not in seen_locations:
            seen_locations.add(loc_id)
            matches.append((loc_id, rel_type, note))

    # 3. 根据时期推断（可靠性较低）
    if not matches:
        period_matches = await match_poetry_by_period(poetry, session)
        for loc_id, rel_type, note in period_matches:
            if loc_id not in seen_locations:
                seen_locations.add(loc_id)
                matches.append((loc_id, rel_type, note))

    # 保存匹配结果
    for loc_id, rel_type, note in matches[:3]:  # 最多保存 3 个地点
        poetry_loc = PoetryLocation(
            poetry_id=poetry.id,
            location_id=loc_id,
            relation_type=rel_type,
            confidence="confirmed" if rel_type == "creation_place" else "possible",
            notes=note
        )
        session.add(poetry_loc)

    return len(matches)


async def main():
    """主函数"""
    print("=" * 60)
    print("诗词地点自动匹配脚本")
    print("=" * 60)

    async with async_session_maker() as session:
        # 获取所有诗词
        result = await session.execute(select(Poetry))
        all_poetries = result.scalars().all()

        print(f"\n数据库共有 {len(all_poetries)} 首诗词")

        # 统计
        matched_count = 0
        total_relations = 0
        skip_count = 0

        for i, poetry in enumerate(all_poetries):
            try:
                # 检查是否已有地点关联
                existing = await session.execute(
                    select(PoetryLocation).where(PoetryLocation.poetry_id == poetry.id)
                )
                if existing.scalars().all():
                    print(f"  [跳过] {poetry.title} - 已有地点关联")
                    skip_count += 1
                    continue

                # 匹配地点
                match_count = await process_single_poetry(poetry, session)

                if match_count > 0:
                    matched_count += 1
                    total_relations += match_count
                    print(f"  [匹配] {poetry.title} - {match_count} 个地点")
                else:
                    print(f"  [无匹配] {poetry.title}")

            except Exception as e:
                print(f"  [错误] {poetry.title}: {e}")

        # 提交所有更改
        await session.commit()

        print("\n" + "=" * 60)
        print("匹配完成")
        print(f"  总诗词数：{len(all_poetries)}")
        print(f"  已匹配：{matched_count} 首")
        print(f"  跳过（已有）: {skip_count} 首")
        print(f"  无匹配：{len(all_poetries) - matched_count - skip_count} 首")
        print(f"  新增关联：{total_relations} 条")
        print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
