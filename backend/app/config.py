# 后端应用配置
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # 高德地图 API
    amap_api_key: str = ""

    # 阿里百炼 API (DashScope)
    dashscope_api_key: str = ""

    # 数据库
    database_url: str = "sqlite+aiosqlite:///./data/poetry.db"

    # 服务配置
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True

    # 爬虫配置
    crawler_delay: float = 1.0  # 请求间隔（秒）
    crawler_timeout: int = 30   # 超时时间（秒）

    # CORS 配置
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "http://18.181.27.167:3000",
        "http://18.181.27.167:80",
        "https://su-shi-poetry-map.vercel.app",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
