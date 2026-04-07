# 诗词模型
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.session import Base


class Poetry(Base):
    """诗词表"""
    __tablename__ = "poetries"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)  # 标题
    content = Column(Text, nullable=False)  # 正文
    dynasty = Column(String(50), default="宋")  # 朝代
    author = Column(String(100), default="苏轼")  # 作者
    year = Column(Integer, nullable=True)  # 创作年份
    year_range = Column(String(100), nullable=True)  # 年份范围
    period = Column(String(100), nullable=True)  # 时期（如"黄州时期"）
    genre = Column(String(50), nullable=True)  # 题材（词/诗/赋）
    tags = Column(String(500), nullable=True)  # 标签（JSON 字符串）
    background = Column(Text, nullable=True)  # 创作背景
    annotations = Column(Text, nullable=True)  # 注释
    translations = Column(Text, nullable=True)  # 译文
    ai_interpretation = Column(JSON, nullable=True)  # AI 解读（JSON 格式）
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关联地点 - 通过 PoetryLocation 关联表
    locations = relationship("PoetryLocation", back_populates="poetry", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Poetry(title='{self.title}', author='{self.author}')>"


class PoetryLocation(Base):
    """诗词 - 地点关联表"""
    __tablename__ = "poetry_locations"

    id = Column(Integer, primary_key=True, index=True)
    poetry_id = Column(Integer, ForeignKey("poetries.id", ondelete="CASCADE"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=False)
    relation_type = Column(String(50), default="creation_place")  # 创作地/提及地/关联地
    confidence = Column(String(50), default="confirmed")  # 确定/推测/存疑
    notes = Column(String(500), nullable=True)  # 备注

    # 关系定义 - 与 Poetry 和 Location 关联
    poetry = relationship("Poetry", back_populates="locations")
    location = relationship("Location", back_populates="poetries")

    def __repr__(self):
        return f"<PoetryLocation(poetry_id={self.poetry_id}, location_id={self.location_id})>"
