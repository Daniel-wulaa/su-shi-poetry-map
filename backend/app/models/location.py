# 地点模型
from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.session import Base


class Location(Base):
    """地点表"""
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)  # 现代名称
    ancient_name = Column(String(255), nullable=True)  # 古代名称
    latitude = Column(Float, nullable=False)  # 纬度
    longitude = Column(Float, nullable=False)  # 经度
    address = Column(String(500), nullable=True)  # 详细地址
    city = Column(String(100), nullable=True)  # 城市
    province = Column(String(100), nullable=True)  # 省份
    description = Column(Text, nullable=True)  # 地点介绍
    attraction_info = Column(Text, nullable=True)  # 景点信息
    images = Column(String(1000), nullable=True)  # 图片 URL（JSON 字符串）
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关联 - 使用 back_populates 与 PoetryLocation 模型关联
    # 延迟导入避免循环依赖
    poetries = relationship("PoetryLocation", back_populates="location", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Location(name='{self.name}', lat={self.latitude}, lng={self.longitude})>"
