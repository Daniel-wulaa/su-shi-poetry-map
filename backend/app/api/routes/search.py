# 搜索和时间线 API 路由
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from typing import List

from app.db.session import get_db
from app.models.poetry import Poetry, PoetryLocation
from app.models.location import Location
from app.api.schemas.poetry import SearchResponse, SearchResult, StatsResponse

router = APIRouter(tags=["搜索和时间线"])


@router.get("/search", response_model=SearchResponse)
async def search(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """搜索诗词和地点"""
    results = []

    # 搜索诗词（标题、内容）
    poetry_query = select(Poetry).where(
        or_(
            Poetry.title.ilike(f"%{q}%"),
            Poetry.content.ilike(f"%{q}%"),
        )
    ).limit(limit)

    poetry_result = await db.execute(poetry_query)
    poetries = poetry_result.scalars().all()

    for poetry in poetries:
        results.append(SearchResult(
            type="poetry",
            data={
                "id": poetry.id,
                "title": poetry.title,
                "content": poetry.content[:100] + "..." if len(poetry.content) > 100 else poetry.content,
                "year": poetry.year,
                "period": poetry.period,
            }
        ))

    # 搜索地点（名称、古代名称）
    location_query = select(Location).where(
        or_(
            Location.name.ilike(f"%{q}%"),
            Location.ancient_name.ilike(f"%{q}%") if Location.ancient_name else False,
        )
    ).limit(limit)

    location_result = await db.execute(location_query)
    locations = location_result.scalars().all()

    for location in locations:
        results.append(SearchResult(
            type="location",
            data={
                "id": location.id,
                "name": location.name,
                "ancient_name": location.ancient_name,
                "latitude": location.latitude,
                "longitude": location.longitude,
                "province": location.province,
            }
        ))

    return SearchResponse(
        query=q,
        results=results,
        total=len(results),
    )


@router.get("/timeline", response_model=List[dict])
async def get_timeline(
    db: AsyncSession = Depends(get_db),
):
    """获取时间线数据（包含关联地点）"""
    # 查询诗词及关联的地点 - 使用 join 和 options 预加载
    from sqlalchemy.orm import selectinload

    result = await db.execute(
        select(Poetry)
        .where(Poetry.year.isnot(None))
        .options(selectinload(Poetry.locations))
        .order_by(Poetry.year)
    )
    poetries = result.scalars().all()

    # 按年份分组
    timeline_data = {}
    for poetry in poetries:
        year = poetry.year
        if year not in timeline_data:
            timeline_data[year] = {
                "year": year,
                "poetries": [],
                "period": poetry.period,
                "location_ids": set(),
            }
        timeline_data[year]["poetries"].append({
            "id": poetry.id,
            "title": poetry.title,
            "genre": poetry.genre,
        })
        # 添加关联的地点 ID
        for pl in poetry.locations:
            timeline_data[year]["location_ids"].add(pl.location_id)

    # 转换为列表并排序，将 set 转为 list
    timeline_list = []
    for item in sorted(timeline_data.values(), key=lambda x: x["year"]):
        timeline_list.append({
            "year": item["year"],
            "period": item["period"],
            "poetries": item["poetries"],
            "location_ids": list(item["location_ids"]),
        })

    return timeline_list


@router.get("/stats", response_model=StatsResponse)
async def get_stats(
    db: AsyncSession = Depends(get_db),
):
    """获取统计数据"""
    # 诗词总数
    poetry_count = await db.execute(select(func.count()).select_from(Poetry))
    total_poetries = poetry_count.scalar()

    # 地点总数
    location_count = await db.execute(select(func.count()).select_from(Location))
    total_locations = location_count.scalar()

    # 时期数量
    periods = await db.execute(select(Poetry.period).distinct())
    total_periods = len([p for p in periods.scalars().all() if p])

    # 按时期统计诗词
    period_stats = await db.execute(
        select(Poetry.period, func.count(Poetry.id))
        .group_by(Poetry.period)
    )
    poetries_by_period = [
        {"period": row[0] or "未知", "count": row[1]}
        for row in period_stats.all()
    ]

    # 按省份统计地点
    province_stats = await db.execute(
        select(Location.province, func.count(Location.id))
        .group_by(Location.province)
    )
    locations_by_province = [
        {"province": row[0] or "未知", "count": row[1]}
        for row in province_stats.all()
    ]

    return StatsResponse(
        total_poetries=total_poetries or 0,
        total_locations=total_locations or 0,
        total_periods=total_periods,
        poetries_by_period=poetries_by_period,
        locations_by_province=locations_by_province,
    )
