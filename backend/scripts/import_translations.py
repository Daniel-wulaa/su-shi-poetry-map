#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
导入译文和赏析数据到数据库
"""

import asyncio
import json
import os
from sqlalchemy import text, create_engine
from sqlalchemy.orm import sessionmaker


def import_translations(json_file: str = "gushiwen_translations_sample.json"):
    """从 JSON 文件导入译文和赏析数据"""

    print(f"开始导入译文和赏析数据：{json_file}\n")

    if not os.path.exists(json_file):
        print(f"✗ 文件不存在：{json_file}")
        return

    # 读取 JSON 文件（按标题匹配）
    with open(json_file, "r", encoding="utf-8") as f:
        translations_data = json.load(f)

    print(f"✓ 读取到 {len(translations_data)} 首诗词的译文和赏析\n")

    # 数据库路径
    db_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "data", "poetry.db"
    )

    # 创建同步引擎
    engine = create_engine(f"sqlite:///{db_path}")
    Session = sessionmaker(bind=engine)

    # 标题到 ID 的映射（根据实际数据库）
    title_to_id = {
        "念奴娇·赤壁怀古": 1,
        "前赤壁赋": 2,
        "水调歌头·明月几时有": 3,
        "江城子·密州出猎": 4,
        "饮湖上初晴后雨": 5,
        "题西林壁": 6,
        "惠崇春江晚景": 7,
        "定风波·莫听穿林打叶声": 8,
        "卜算子·黄州定慧院寓居作": 9,
        "临江仙·送钱穆父": 10,
        "蝶恋花·春景": 11,
        "浣溪沙·游蕲水清泉寺": 12,
        "赤壁赋": 13,
        "江城子·乙卯正月二十日夜记梦": 14,
        "望江南·超然台作": 15,
        "西江月·中秋和子由": 16,
        "临江仙·夜归临皋": 17,
        "记承天寺夜游": 18,
        "和子由渑池怀旧": 19,
        "定风波·南海归赠王定国侍人寓娘": 20,
    }

    with Session() as session:
        success_count = 0
        fail_count = 0

        for title, data in translations_data.items():
            poetry_id = title_to_id.get(title)

            if not poetry_id:
                print(f"⚠ 未找到诗词 ID：{title}")
                fail_count += 1
                continue

            try:
                # 查询诗词是否存在
                result = session.execute(
                    text("SELECT id, title FROM poetries WHERE id = :id"),
                    {"id": poetry_id}
                )
                poetry = result.fetchone()

                if not poetry:
                    print(f"⚠ 诗词 ID {poetry_id} ({title}) 不存在，跳过")
                    fail_count += 1
                    continue

                # 更新译文和赏析字段
                session.execute(
                    text("""
                        UPDATE poetries
                        SET translations = :translations,
                            annotations = :annotations
                        WHERE id = :id
                    """),
                    {
                        "id": poetry_id,
                        "translations": data.get("translations", ""),
                        "annotations": data.get("appreciation", "")
                    }
                )
                success_count += 1
                print(f"✓ 已更新：{title} (ID: {poetry_id})")

            except Exception as e:
                fail_count += 1
                print(f"✗ 更新失败：{title} - {e}")

        # 提交事务
        session.commit()

        print(f"\n导入完成！")
        print(f"  成功：{success_count} 首")
        print(f"  失败：{fail_count} 首")


if __name__ == "__main__":
    import_translations()
