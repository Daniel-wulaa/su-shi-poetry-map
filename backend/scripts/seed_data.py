# 数据种子脚本
# 用于初始化苏轼诗词和地点数据
import asyncio
import json
from typing import List, Dict, Any
from sqlalchemy import select

from app.models.poetry import Poetry, PoetryLocation
from app.models.location import Location
from app.db.session import async_session_maker, Base, engine
from app.spiders.gushiwen_spider import GushiwenSpider
from app.services.geocoding_service import (
    GeocodingService,
    geocode_ancient_location,
    ANCIENT_LOCATION_MAP,
)
from app.spiders.attraction_spider import seed_su_shi_attractions


async def create_sample_locations():
    """创建示例地点数据"""
    print("\n=== 创建示例地点 ===")

    # 苏轼重要足迹地点（手动校准的经纬度）
    locations_data = [
        # 四川
        {
            "name": "眉山市",
            "ancient_name": "眉州",
            "latitude": 30.0566,
            "longitude": 103.8397,
            "province": "四川省",
            "city": "眉山市",
            "description": "苏轼的故乡，三苏祠所在地",
        },
        {
            "name": "成都市",
            "ancient_name": "成都",
            "latitude": 30.5728,
            "longitude": 104.0668,
            "province": "四川省",
            "city": "成都市",
            "description": "苏轼出川赴京时途经成都",
        },
        # 陕西
        {
            "name": "西安市",
            "ancient_name": "长安",
            "latitude": 34.3416,
            "longitude": 108.9398,
            "province": "陕西省",
            "city": "西安市",
            "description": "苏轼出川赴京时经长安",
        },
        # 河南
        {
            "name": "开封市",
            "ancient_name": "汴京",
            "latitude": 34.7958,
            "longitude": 114.3075,
            "province": "河南省",
            "city": "开封市",
            "description": "北宋都城，苏轼进士及第之地",
        },
        {
            "name": "淮阳区",
            "ancient_name": "陈州",
            "latitude": 33.7989,
            "longitude": 114.9007,
            "province": "河南省",
            "city": "周口市",
            "description": "苏轼赴杭州通判任时途经陈州",
        },
        # 陕西
        {
            "name": "凤翔区",
            "ancient_name": "凤翔府",
            "latitude": 34.5158,
            "longitude": 107.4000,
            "province": "陕西省",
            "city": "宝鸡市",
            "description": "苏轼签书凤翔府判官之地",
        },
        # 浙江
        {
            "name": "杭州市",
            "ancient_name": "杭州",
            "latitude": 30.2741,
            "longitude": 120.1551,
            "province": "浙江省",
            "city": "杭州市",
            "description": "苏轼两度任职杭州，疏浚西湖筑苏堤",
        },
        # 山东
        {
            "name": "诸城市",
            "ancient_name": "密州",
            "latitude": 35.9958,
            "longitude": 119.4119,
            "province": "山东省",
            "city": "潍坊市",
            "description": "苏轼知密州之地，作《江城子·密州出猎》",
        },
        {
            "name": "徐州市",
            "ancient_name": "徐州",
            "latitude": 34.2056,
            "longitude": 117.2848,
            "province": "江苏省",
            "city": "徐州市",
            "description": "苏轼知徐州，曾率民抗洪",
        },
        {
            "name": "湖州市",
            "ancient_name": "湖州",
            "latitude": 30.8703,
            "longitude": 120.0972,
            "province": "浙江省",
            "city": "湖州市",
            "description": "苏轼知湖州，乌台诗案爆发地",
        },
        # 湖北
        {
            "name": "黄冈市",
            "ancient_name": "黄州",
            "latitude": 30.4518,
            "longitude": 114.8797,
            "province": "湖北省",
            "city": "黄冈市",
            "description": "苏轼被贬黄州四年，创作高峰时期",
        },
        # 江苏
        {
            "name": "常州市",
            "ancient_name": "常州",
            "latitude": 31.8122,
            "longitude": 119.9692,
            "province": "江苏省",
            "city": "常州市",
            "description": "苏轼卒于常州",
        },
        {
            "name": "扬州市",
            "ancient_name": "扬州",
            "latitude": 32.3912,
            "longitude": 119.4215,
            "province": "江苏省",
            "city": "扬州市",
            "description": "苏轼知扬州",
        },
        # 广东
        {
            "name": "惠州市",
            "ancient_name": "惠州",
            "latitude": 23.1115,
            "longitude": 114.4152,
            "province": "广东省",
            "city": "惠州市",
            "description": "苏轼晚年被贬惠州",
        },
        {
            "name": "英德市",
            "ancient_name": "英州",
            "latitude": 24.2820,
            "longitude": 113.4147,
            "province": "广东省",
            "city": "清远市",
            "description": "苏轼被贬英州",
        },
        # 海南
        {
            "name": "儋州市",
            "ancient_name": "儋州",
            "latitude": 19.5237,
            "longitude": 109.5771,
            "province": "海南省",
            "city": "儋州市",
            "description": "苏轼被贬儋州，海南文化的开拓者",
        },
        # 其他
        {
            "name": "武汉市",
            "ancient_name": "鄂州",
            "latitude": 30.5928,
            "longitude": 114.3055,
            "province": "湖北省",
            "city": "武汉市",
            "description": "苏轼游赤壁途经之地",
        },
        {
            "name": "汝州市",
            "ancient_name": "汝州",
            "latitude": 34.1636,
            "longitude": 112.8409,
            "province": "河南省",
            "city": "平顶山市",
            "description": "苏轼移汝州团练副使",
        },
        # 山东 - 登州
        {
            "name": "蓬莱区",
            "ancient_name": "登州",
            "latitude": 37.8155,
            "longitude": 120.7572,
            "province": "山东省",
            "city": "烟台市",
            "description": "苏轼知登州",
        },
        # 安徽
        {
            "name": "阜阳市",
            "ancient_name": "颍州",
            "latitude": 32.8979,
            "longitude": 115.8162,
            "province": "安徽省",
            "city": "阜阳市",
            "description": "苏轼知颍州",
        },
        # 广东 - 雷州
        {
            "name": "雷州市",
            "ancient_name": "雷州",
            "latitude": 20.9117,
            "longitude": 110.0858,
            "province": "广东省",
            "city": "湛江市",
            "description": "苏轼贬儋州途经雷州",
        },
        # 江西
        {
            "name": "赣州市",
            "ancient_name": "赣州",
            "latitude": 25.8452,
            "longitude": 114.9335,
            "province": "江西省",
            "city": "赣州市",
            "description": "苏轼北归途经赣州",
        },
    ]

    async with async_session_maker() as session:
        for loc_data in locations_data:
            # 检查是否已存在
            existing = await session.execute(
                select(Location).where(Location.ancient_name == loc_data["ancient_name"])
            )
            if existing.scalar_one_or_none():
                print(f"  已存在：{loc_data['ancient_name']}")
                continue

            location = Location(**loc_data)
            session.add(location)
            print(f"  已添加：{loc_data['ancient_name']} ({loc_data['name']})")

        await session.commit()

    print(f"地点创建完成，共 {len(locations_data)} 个")

    # 打印地点列表供前端参考
    print("\n=== 地点 ID 对照表（供前端 journeyRoutes.ts 使用）===")
    for i, loc in enumerate(locations_data, 1):
        print(f"ID:{i:2d} | {loc['ancient_name']:6s} | {loc['name']:8s} | {loc['latitude']:.4f}, {loc['longitude']:.4f}")


async def create_sample_poetries():
    """创建示例诗词数据"""
    print("\n=== 创建示例诗词 ===")

    # 苏轼代表诗词（手动整理）
    poetries_data = [
        {
            "title": "念奴娇·赤壁怀古",
            "content": """大江东去，浪淘尽，千古风流人物。
故垒西边，人道是，三国周郎赤壁。
乱石穿空，惊涛拍岸，卷起千堆雪。
江山如画，一时多少豪杰。

遥想公瑾当年，小乔初嫁了，雄姿英发。
羽扇纶巾，谈笑间，樯橹灰飞烟灭。
故国神游，多情应笑我，早生华发。
人生如梦，一尊还酹江月。""",
            "year": 1082,
            "period": "黄州团练",
            "genre": "词",
            "tags": "赤壁，怀古，豪放",
            "background": "元丰五年（1082 年）七月，苏轼被贬黄州期间，游赤壁所作。",
        },
        {
            "title": "前赤壁赋",
            "content": """壬戌之秋，七月既望，苏子与客泛舟游于赤壁之下。
清风徐来，水波不兴。举酒属客，诵明月之诗，歌窈窕之章。
少焉，月出于东山之上，徘徊于斗牛之间。
白露横江，水光接天。纵一苇之所如，凌万顷之茫然。
浩浩乎如冯虚御风，而不知其所止；飘飘乎如遗世独立，羽化而登仙。""",
            "year": 1082,
            "period": "黄州团练",
            "genre": "赋",
            "tags": "赤壁，游记，哲理",
            "background": "元丰五年（1082 年）秋，苏轼与友人夜游赤壁所作。",
        },
        {
            "title": "水调歌头·明月几时有",
            "content": """明月几时有？把酒问青天。
不知天上宫阙，今夕是何年。
我欲乘风归去，又恐琼楼玉宇，高处不胜寒。
起舞弄清影，何似在人间。

转朱阁，低绮户，照无眠。
不应有恨，何事长向别时圆？
人有悲欢离合，月有阴晴圆缺，此事古难全。
但愿人长久，千里共婵娟。""",
            "year": 1076,
            "period": "知密州",
            "genre": "词",
            "tags": "中秋，月亮，思念",
            "background": "丙辰中秋（1076 年），苏轼在密州所作，怀念弟弟苏辙。",
        },
        {
            "title": "江城子·密州出猎",
            "content": """老夫聊发少年狂，左牵黄，右擎苍，
锦帽貂裘，千骑卷平冈。
为报倾城随太守，亲射虎，看孙郎。

酒酣胸胆尚开张，鬓微霜，又何妨？
持节云中，何日遣冯唐？
会挽雕弓如满月，西北望，射天狼。""",
            "year": 1075,
            "period": "知密州",
            "genre": "词",
            "tags": "出猎，豪放，爱国",
            "background": "熙宁八年（1075 年），苏轼知密州时所作。",
        },
        {
            "title": "饮湖上初晴后雨",
            "content": """水光潋滟晴方好，山色空蒙雨亦奇。
欲把西湖比西子，淡妆浓抹总相宜。""",
            "year": 1073,
            "period": "通判杭州",
            "genre": "诗",
            "tags": "西湖，杭州，写景",
            "background": "熙宁六年（1073 年），苏轼通判杭州时游西湖所作。",
        },
        {
            "title": "题西林壁",
            "content": """横看成岭侧成峰，远近高低各不同。
不识庐山真面目，只缘身在此山中。""",
            "year": 1084,
            "period": "移汝州",
            "genre": "诗",
            "tags": "庐山，哲理",
            "background": "元丰七年（1084 年），苏轼游庐山时所作。",
        },
        {
            "title": "惠崇春江晚景",
            "content": """竹外桃花三两枝，春江水暖鸭先知。
蒌蒿满地芦芽短，正是河豚欲上时。""",
            "year": 1085,
            "period": "移汝州",
            "genre": "诗",
            "tags": "春天，题画",
            "background": "元丰八年（1085 年），苏轼为惠崇画作题诗。",
        },
        {
            "title": "定风波·莫听穿林打叶声",
            "content": """莫听穿林打叶声，何妨吟啸且徐行。
竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。

料峭春风吹酒醒，微冷，山头斜照却相迎。
回首向来萧瑟处，归去，也无风雨也无晴。""",
            "year": 1082,
            "period": "黄州团练",
            "genre": "词",
            "tags": "人生，豁达，哲理",
            "background": "元丰五年（1082 年）春，苏轼在黄州所作。",
        },
        {
            "title": "卜算子·黄州定慧院寓居作",
            "content": """缺月挂疏桐，漏断人初静。
谁见幽人独往来，缥缈孤鸿影。

惊起却回头，有恨无人省。
拣尽寒枝不肯栖，寂寞沙洲冷。""",
            "year": 1082,
            "period": "黄州团练",
            "genre": "词",
            "tags": "孤独，高洁",
            "background": "元丰五年（1082 年），苏轼贬居黄州定慧院时所作。",
        },
        {
            "title": "临江仙·送钱穆父",
            "content": """一别都门三改火，天涯踏尽红尘。
依然一笑作春温。
无波真古井，有节是秋筠。

惆怅孤帆连夜发，送行淡月微云。
尊前不用翠眉颦。
人生如逆旅，我亦是行人。""",
            "year": 1091,
            "period": "知杭州",
            "genre": "词",
            "tags": "送别，人生",
            "background": "元祐六年（1091 年），苏轼在杭州送别友人钱穆父时所作。",
        },
        {
            "title": "蝶恋花·春景",
            "content": """花褪残红青杏小。燕子飞时，绿水人家绕。
枝上柳绵吹又少，天涯何处无芳草。

墙里秋千墙外道。墙外行人，墙里佳人笑。
笑渐不闻声渐悄，多情却被无情恼。""",
            "year": 1073,
            "period": "通判杭州",
            "genre": "词",
            "tags": "春天，爱情",
            "background": "熙宁六年（1073 年）春，苏轼在杭州所作。",
        },
        {
            "title": "浣溪沙·游蕲水清泉寺",
            "content": """山下兰芽短浸溪，松间沙路净无泥，
萧萧暮雨子规啼。

谁道人生无再少？门前流水尚能西！
休将白发唱黄鸡。""",
            "year": 1082,
            "period": "黄州团练",
            "genre": "词",
            "tags": "励志，人生",
            "background": "元丰五年（1082 年），苏轼游蕲水清泉寺时所作。",
        },
    ]

    async with async_session_maker() as session:
        for poetry_data in poetries_data:
            # 检查是否已存在
            existing = await session.execute(
                select(Poetry).where(Poetry.title == poetry_data["title"])
            )
            if existing.scalar_one_or_none():
                print(f"  已存在：{poetry_data['title']}")
                continue

            poetry = Poetry(
                **poetry_data,
                dynasty="宋",
                author="苏轼",
            )
            session.add(poetry)
            print(f"  已添加：{poetry_data['title']}")

        await session.commit()

    print(f"诗词创建完成，共 {len(poetries_data)} 首")


async def create_poetry_location_relations():
    """创建诗词 - 地点关联"""
    print("\n=== 创建诗词 - 地点关联 ===")

    # 诗词与地点的关联关系
    relations = [
        # 念奴娇·赤壁怀古 - 黄州赤壁
        ("念奴娇·赤壁怀古", "黄州"),
        ("前赤壁赋", "黄州"),
        # 水调歌头 - 密州
        ("水调歌头·明月几时有", "密州"),
        ("江城子·密州出猎", "密州"),
        # 饮湖上初晴后雨 - 杭州
        ("饮湖上初晴后雨", "杭州"),
        ("蝶恋花·春景", "杭州"),
        ("临江仙·送钱穆父", "杭州"),
        # 题西林壁 - 路过
        ("题西林壁", "汝州"),
        # 定风波等 - 黄州
        ("定风波·莫听穿林打叶声", "黄州"),
        ("卜算子·黄州定慧院寓居作", "黄州"),
        ("浣溪沙·游蕲水清泉寺", "黄州"),
        # 惠崇春江晚景
        ("惠崇春江晚景", "汝州"),
    ]

    async with async_session_maker() as session:
        for poetry_title, location_ancient in relations:
            # 查找诗词
            poetry_result = await session.execute(
                select(Poetry).where(Poetry.title == poetry_title)
            )
            poetry = poetry_result.scalar_one_or_none()
            if not poetry:
                print(f"  未找到诗词：{poetry_title}")
                continue
            poetry_id = poetry.id

            # 查找地点
            location_result = await session.execute(
                select(Location).where(Location.ancient_name == location_ancient)
            )
            location = location_result.scalar_one_or_none()
            if not location:
                print(f"  未找到地点：{location_ancient}")
                continue
            location_id = location.id

            # 检查关联是否已存在
            existing = await session.execute(
                select(PoetryLocation).where(
                    PoetryLocation.poetry_id == poetry_id,
                    PoetryLocation.location_id == location_id,
                )
            )
            if existing.scalar_one_or_none():
                continue

            # 创建关联
            relation = PoetryLocation(
                poetry_id=poetry_id,
                location_id=location_id,
                relation_type="creation_place",
                confidence="confirmed",
            )
            session.add(relation)
            print(f"  已关联：{poetry_title} <-> {location_ancient}")

        await session.commit()

    print("关联创建完成")


async def main():
    """数据种子主函数"""
    print("=" * 60)
    print("苏轼人生诗词地图 - 数据初始化")
    print("=" * 60)

    # 创建数据库表
    print("\n正在检查数据库表...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("数据库表检查完成")

    # 创建示例数据
    await create_sample_locations()
    await create_sample_poetries()
    await create_poetry_location_relations()

    # 更新景点信息
    print("\n=== 更新景点信息 ===")
    await seed_su_shi_attractions()

    print("\n" + "=" * 60)
    print("数据初始化完成！")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
