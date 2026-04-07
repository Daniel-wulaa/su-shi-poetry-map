# 诗词 API 路由
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import List, Optional

from app.db.session import get_db
from app.models.poetry import Poetry, PoetryLocation
from app.models.location import Location
from app.api.schemas.poetry import (
    PoetryResponse,
    PoetryCreate,
    PoetryUpdate,
    PoetryListResponse,
    LocationResponse,
)

router = APIRouter(prefix="/poetries", tags=["诗词"])


@router.get("", response_model=PoetryListResponse)
async def get_poetries(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    period: Optional[str] = None,
    genre: Optional[str] = None,
    year_start: Optional[int] = None,
    year_end: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    """获取诗词列表（支持分页和筛选）"""
    # 构建查询
    filters = []
    if period:
        filters.append(Poetry.period == period)
    if genre:
        filters.append(Poetry.genre == genre)
    if year_start:
        filters.append(Poetry.year >= year_start)
    if year_end:
        filters.append(Poetry.year <= year_end)

    # 查询总数
    total_query = select(func.count()).select_from(Poetry)
    if filters:
        total_query = total_query.where(*filters)
    total_result = await db.execute(total_query)
    total = total_result.scalar()

    # 查询数据
    query = select(Poetry)
    if filters:
        query = query.where(*filters)
    query = query.offset((page - 1) * page_size).limit(page_size).order_by(Poetry.year)

    result = await db.execute(query)
    poetries = result.scalars().all()

    return PoetryListResponse(
        items=[PoetryResponse.model_validate(p) for p in poetries],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{poetry_id}", response_model=PoetryResponse)
async def get_poetry(
    poetry_id: int,
    db: AsyncSession = Depends(get_db),
):
    """获取诗词详情"""
    result = await db.execute(select(Poetry).where(Poetry.id == poetry_id))
    poetry = result.scalar_one_or_none()

    if not poetry:
        raise HTTPException(status_code=404, detail="诗词不存在")

    return PoetryResponse.model_validate(poetry)


@router.post("", response_model=PoetryResponse)
async def create_poetry(
    poetry: PoetryCreate,
    db: AsyncSession = Depends(get_db),
):
    """创建诗词"""
    new_poetry = Poetry(**poetry.model_dump())
    db.add(new_poetry)
    await db.commit()
    await db.refresh(new_poetry)

    return PoetryResponse.model_validate(new_poetry)


@router.put("/{poetry_id}", response_model=PoetryResponse)
async def update_poetry(
    poetry_id: int,
    poetry_update: PoetryUpdate,
    db: AsyncSession = Depends(get_db),
):
    """更新诗词"""
    result = await db.execute(select(Poetry).where(Poetry.id == poetry_id))
    poetry = result.scalar_one_or_none()

    if not poetry:
        raise HTTPException(status_code=404, detail="诗词不存在")

    # 更新字段
    update_data = poetry_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(poetry, field, value)

    await db.commit()
    await db.refresh(poetry)

    return PoetryResponse.model_validate(poetry)


@router.delete("/{poetry_id}")
async def delete_poetry(
    poetry_id: int,
    db: AsyncSession = Depends(get_db),
):
    """删除诗词"""
    result = await db.execute(select(Poetry).where(Poetry.id == poetry_id))
    poetry = result.scalar_one_or_none()

    if not poetry:
        raise HTTPException(status_code=404, detail="诗词不存在")

    await db.delete(poetry)
    await db.commit()

    return {"message": "删除成功"}


@router.get("/{poetry_id}/locations", response_model=List[LocationResponse])
async def get_poetry_locations(
    poetry_id: int,
    db: AsyncSession = Depends(get_db),
):
    """获取诗词关联的地点"""
    result = await db.execute(
        select(Location)
        .join(PoetryLocation, Location.id == PoetryLocation.location_id)
        .where(PoetryLocation.poetry_id == poetry_id)
    )
    locations = result.scalars().all()

    return [LocationResponse.model_validate(loc) for loc in locations]
