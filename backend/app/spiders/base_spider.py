# 爬虫基类
import asyncio
import random
from typing import Optional, Dict, Any
from abc import ABC, abstractmethod

import httpx
from bs4 import BeautifulSoup


class BaseSpider(ABC):
    """爬虫基类"""

    def __init__(
        self,
        base_url: str,
        delay: float = 1.0,
        timeout: int = 30,
        max_retries: int = 3,
    ):
        self.base_url = base_url
        self.delay = delay  # 请求间隔
        self.timeout = timeout
        self.max_retries = max_retries

        # 请求头
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        }

    async def fetch(
        self,
        url: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> Optional[str]:
        """获取页面内容"""
        async with httpx.AsyncClient(
            headers=self.headers,
            timeout=httpx.Timeout(self.timeout),
            follow_redirects=True,
        ) as client:
            for attempt in range(self.max_retries):
                try:
                    response = await client.get(url, params=params)
                    response.raise_for_status()
                    return response.text
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 404:
                        return None
                    print(f"HTTP 错误：{e}，重试 {attempt + 1}/{self.max_retries}")
                except httpx.RequestError as e:
                    print(f"请求错误：{e}，重试 {attempt + 1}/{self.max_retries}")

                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.delay * (attempt + 1))

            return None

    async def sleep(self):
        """随机延迟，避免被封"""
        delay = self.delay + random.uniform(0, 0.5)
        await asyncio.sleep(delay)

    @abstractmethod
    async def crawl(self):
        """爬取主方法，由子类实现"""
        pass

    def parse(self, html: str):
        """解析 HTML"""
        return BeautifulSoup(html, "lxml")
