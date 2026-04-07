#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
导入 AI 生成的译文、赏析和 AI 解读数据到数据库
"""

import json
import os
from sqlalchemy import text, create_engine
from sqlalchemy.orm import sessionmaker


def import_ai_data(json_file: str = "ai_generated_test.json"):
    """从 JSON 文件导入 AI 生成的数据"""

    print(f"开始导入 AI 生成数据：{json_file}\n")

    if not os.path.exists(json_file):
        print(f"✗ 文件不存在：{json_file}")
        return

    # 读取 JSON 文件
    with open(json_file, "r", encoding="utf-8") as f:
        ai_data = json.load(f)

    print(f"✓ 读取到 {len(ai_data)} 首诗词的 AI 生成数据\n")

    # 数据库路径
    db_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "data", "poetry.db"
    )

    # 创建同步引擎
    engine = create_engine(f"sqlite:///{db_path}")
    Session = sessionmaker(bind=engine)

    with Session() as session:
        success_count = 0
        fail_count = 0

        for poetry_id, data in ai_data.items():
            try:
                # 查询诗词是否存在
                result = session.execute(
                    text("SELECT id, title FROM poetries WHERE id = :id"),
                    {"id": int(poetry_id)}
                )
                poetry = result.fetchone()

                if not poetry:
                    print(f"⚠ 诗词 ID {poetry_id} 不存在，跳过")
                    fail_count += 1
                    continue

                # 提取数据
                translations = data.get("translations", "")
                appreciation = data.get("appreciation", "")
                ai_interpretation = data.get("ai_interpretation", {})

                # 更新数据库
                session.execute(
                    text("""
                        UPDATE poetries
                        SET translations = :translations,
                            annotations = :annotations,
                            ai_interpretation = :ai_interpretation
                        WHERE id = :id
                    """),
                    {
                        "id": int(poetry_id),
                        "translations": translations,
                        "annotations": appreciation,
                        "ai_interpretation": json.dumps(ai_interpretation, ensure_ascii=False)
                    }
                )
                success_count += 1
                print(f"✓ 已更新：{poetry[1]} (ID: {poetry_id})")

            except Exception as e:
                fail_count += 1
                print(f"✗ 更新失败：ID {poetry_id} - {e}")

        # 提交事务
        session.commit()

        print(f"\n导入完成！")
        print(f"  成功：{success_count} 首")
        print(f"  失败：{fail_count} 首")


if __name__ == "__main__":
    import_ai_data()
