#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据库迁移脚本：添加 ai_interpretation 字段并导入生成的解读数据
"""

import asyncio
import json
import os
import sys

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text, create_engine
from sqlalchemy.orm import sessionmaker


async def add_ai_interpretation_column():
    """添加 ai_interpretation 字段到数据库"""

    print("开始数据库迁移：添加 ai_interpretation 字段...\n")

    # 数据库路径
    db_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "data", "poetry.db"
    )

    if not os.path.exists(db_path):
        print(f"✗ 数据库文件不存在：{db_path}")
        return

    # 创建同步引擎（SQLite 不需要异步）
    engine = create_engine(f"sqlite:///{db_path}")
    Session = sessionmaker(bind=engine)

    with Session() as session:
        # 检查字段是否已存在
        result = session.execute(text("""
            SELECT name FROM pragma_table_info('poetries')
            WHERE name='ai_interpretation'
        """))
        column_exists = result.fetchone()

        if column_exists:
            print("✓ ai_interpretation 字段已存在，跳过添加")
        else:
            # 添加 JSON 字段
            session.execute(text("""
                ALTER TABLE poetries ADD COLUMN ai_interpretation JSON
            """))
            session.commit()
            print("✓ ai_interpretation 字段添加成功")

    print("\n数据库迁移完成！\n")


async def import_ai_interpretations(json_file: str = "ai_interpretations.json"):
    """从 JSON 文件导入 AI 解读数据"""

    print(f"开始导入 AI 解读数据：{json_file}\n")

    if not os.path.exists(json_file):
        print(f"✗ 文件不存在：{json_file}")
        print("请先运行 generate_ai_interpretation.py 生成解读数据")
        return

    # 读取 JSON 文件
    with open(json_file, "r", encoding="utf-8") as f:
        interpretations = json.load(f)

    print(f"✓ 读取到 {len(interpretations)} 首诗词的解读\n")

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

        for poetry_id_str, interpretation in interpretations.items():
            poetry_id = int(poetry_id_str)

            try:
                # 查询诗词是否存在
                result = session.execute(
                    text("SELECT id FROM poetries WHERE id = :id"),
                    {"id": poetry_id}
                )
                poetry = result.fetchone()

                if not poetry:
                    print(f"⚠ 诗词 ID {poetry_id} 不存在，跳过")
                    fail_count += 1
                    continue

                # 更新 ai_interpretation 字段
                session.execute(
                    text("""
                        UPDATE poetries
                        SET ai_interpretation = :interpretation
                        WHERE id = :id
                    """),
                    {
                        "id": poetry_id,
                        "interpretation": json.dumps(interpretation, ensure_ascii=False)
                    }
                )
                success_count += 1
                print(f"✓ 已更新：诗词 ID {poetry_id}")

            except Exception as e:
                fail_count += 1
                print(f"✗ 更新失败：诗词 ID {poetry_id} - {e}")

        # 提交事务
        session.commit()

        print(f"\n导入完成！")
        print(f"  成功：{success_count} 首")
        print(f"  失败：{fail_count} 首")


async def main():
    """主函数"""

    # Step 1: 添加数据库字段
    await add_ai_interpretation_column()

    # Step 2: 导入 AI 解读数据
    json_file = "ai_interpretations.json"
    if os.path.exists(json_file):
        await import_ai_interpretations(json_file)
    else:
        print(f"\n⚠ 未找到 {json_file}，跳过导入步骤")
        print("运行以下命令生成 AI 解读：")
        print("  cd backend/scripts")
        print("  export ANTHROPIC_API_KEY='your-api-key'")
        print("  python generate_ai_interpretation.py")


if __name__ == "__main__":
    asyncio.run(main())
