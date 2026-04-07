# 地点 API 路由
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional

from app.db.session import get_db
from app.models.location import Location
from app.models.poetry import PoetryLocation
from app.api.schemas.poetry import (
    LocationResponse,
    LocationCreate,
    LocationUpdate,
    LocationListResponse,
    PoetryResponse,
)

router = APIRouter(prefix="/locations", tags=["地点"])


@router.get("", response_model=LocationListResponse)
async def get_locations(
    province: Optional[str] = None,
    city: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """获取地点列表"""
    filters = []
    if province:
        filters.append(Location.province == province)
    if city:
        filters.append(Location.city == city)

    query = select(Location)
    if filters:
        query = query.where(*filters)

    result = await db.execute(query)
    locations = result.scalars().all()

    return LocationListResponse(
        items=[LocationResponse.model_validate(loc) for loc in locations],
        total=len(locations),
    )


@router.get("/all", response_model=list[LocationResponse])
async def get_all_locations(db: AsyncSession = Depends(get_db)):
    """获取所有地点（用于地图展示）"""
    result = await db.execute(select(Location))
    locations = result.scalars().all()
    return [LocationResponse.model_validate(loc) for loc in locations]


@router.get("/{location_id}", response_model=LocationResponse)
async def get_location(
    location_id: int,
    db: AsyncSession = Depends(get_db),
):
    """获取地点详情"""
    result = await db.execute(select(Location).where(Location.id == location_id))
    location = result.scalar_one_or_none()

    if not location:
        raise HTTPException(status_code=404, detail="地点不存在")

    return LocationResponse.model_validate(location)


@router.post("", response_model=LocationResponse)
async def create_location(
    location: LocationCreate,
    db: AsyncSession = Depends(get_db),
):
    """创建地点"""
    new_location = Location(**location.model_dump())
    db.add(new_location)
    await db.commit()
    await db.refresh(new_location)

    return LocationResponse.model_validate(new_location)


@router.put("/{location_id}", response_model=LocationResponse)
async def update_location(
    location_id: int,
    location_update: LocationUpdate,
    db: AsyncSession = Depends(get_db),
):
    """更新地点"""
    result = await db.execute(select(Location).where(Location.id == location_id))
    location = result.scalar_one_or_none()

    if not location:
        raise HTTPException(status_code=404, detail="地点不存在")

    update_data = location_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(location, field, value)

    await db.commit()
    await db.refresh(location)

    return LocationResponse.model_validate(location)


@router.delete("/{location_id}")
async def delete_location(
    location_id: int,
    db: AsyncSession = Depends(get_db),
):
    """删除地点"""
    result = await db.execute(select(Location).where(Location.id == location_id))
    location = result.scalar_one_or_none()

    if not location:
        raise HTTPException(status_code=404, detail="地点不存在")

    await db.delete(location)
    await db.commit()

    return {"message": "删除成功"}


@router.get("/{location_id}/poetries", response_model=list[PoetryResponse])
async def get_location_poetries(
    location_id: int,
    db: AsyncSession = Depends(get_db),
):
    """获取地点关联的诗词"""
    result = await db.execute(
        select(PoetryLocation)
        .where(PoetryLocation.location_id == location_id)
    )
    relations = result.scalars().all()

    poetry_ids = [rel.poetry_id for rel in relations]
    if not poetry_ids:
        return []

    poetry_result = await db.execute(
        select(PoetryResponse)
        .where(Poetry.id.in_(poetry_ids))
    )
    return poetry_result.scalars().all()
