# 数据库配置
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
import os

from app.config import settings


# 创建异步引擎
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    future=True,
)

# 会话工厂
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# Base 类
class Base(DeclarativeBase):
    pass


# 获取数据库会话
async def get_db() -> AsyncSession:
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# 用于迁移脚本的同步会话
def get_sync_database_url(async_url: str) -> str:
    """将异步数据库 URL 转换为同步 URL"""
    return async_url.replace("sqlite+aiosqlite", "sqlite")
