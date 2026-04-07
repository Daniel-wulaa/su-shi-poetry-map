# API 路由注册
from fastapi import APIRouter

from app.api.routes import poetry, locations, search

api_router = APIRouter()

api_router.include_router(poetry.router)
api_router.include_router(locations.router)
api_router.include_router(search.router)
