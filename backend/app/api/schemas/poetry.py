# Pydantic Schemas
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime


# AI 解读 Schema
class AIInterpretation(BaseModel):
    summary: Optional[str] = None  # 主旨概括
    key_imagery: Optional[List[str]] = None  # 核心意象
    artistic_features: Optional[str] = None  # 艺术特色
    historical_context: Optional[str] = None  # 创作背景
    modern_relevance: Optional[str] = None  # 现代启示


# 诗词 Schema
class PoetryBase(BaseModel):
    title: str
    content: str
    dynasty: Optional[str] = "宋"
    author: Optional[str] = "苏轼"
    year: Optional[int] = None
    year_range: Optional[str] = None
    period: Optional[str] = None
    genre: Optional[str] = None
    tags: Optional[str] = None
    background: Optional[str] = None
    annotations: Optional[str] = None
    translations: Optional[str] = None
    ai_interpretation: Optional[AIInterpretation] = None


class PoetryCreate(PoetryBase):
    pass


class PoetryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    year: Optional[int] = None
    period: Optional[str] = None


class PoetryResponse(PoetryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# 地点 Schema
class LocationBase(BaseModel):
    name: str
    ancient_name: Optional[str] = None
    latitude: float
    longitude: float
    address: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    description: Optional[str] = None
    attraction_info: Optional[str] = None
    images: Optional[str] = None


class LocationCreate(LocationBase):
    pass


class LocationUpdate(BaseModel):
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None
    attraction_info: Optional[str] = None


class LocationResponse(LocationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# 诗词 - 地点关联 Schema
class PoetryLocationBase(BaseModel):
    poetry_id: int
    location_id: int
    relation_type: Optional[str] = "creation_place"
    confidence: Optional[str] = "confirmed"
    notes: Optional[str] = None


class PoetryLocationResponse(PoetryLocationBase):
    id: int

    class Config:
        from_attributes = True


# 列表响应
class PoetryListResponse(BaseModel):
    items: List[PoetryResponse]
    total: int
    page: int
    page_size: int


class LocationListResponse(BaseModel):
    items: List[LocationResponse]
    total: int


# 搜索响应
class SearchResult(BaseModel):
    type: str  # "poetry" or "location"
    data: dict


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total: int


# 统计响应
class StatsResponse(BaseModel):
    total_poetries: int
    total_locations: int
    total_periods: int
    poetries_by_period: List[dict]
    locations_by_province: List[dict]
