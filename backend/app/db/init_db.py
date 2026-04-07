# 数据库初始化
import asyncio
from sqlalchemy import text
from app.db.session import engine, async_session_maker
from app.models.poetry import Poetry, PoetryLocation
from app.models.location import Location
from app.db.session import Base


async def init_db():
    """初始化数据库，创建所有表"""
    print("正在连接数据库...")

    async with engine.begin() as conn:
        # 创建所有表
        await conn.run_sync(Base.metadata.create_all)

    print("数据库表创建成功！")

    # 验证表已创建
    async with async_session_maker() as session:
        result = await session.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        tables = result.fetchall()
        print(f"已创建的表：{[t[0] for t in tables]}")


async def drop_all():
    """删除所有表（危险操作！）"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    print("所有表已删除")


if __name__ == "__main__":
    asyncio.run(init_db())
