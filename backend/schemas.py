from typing import List, Optional
from pydantic import BaseModel


class Post(BaseModel):
    platform: str
    post_id: str
    title: str
    url: str
    snippet: str = ""
    author: str = ""
    thumbnail: str = ""
    published_at: str = ""
    is_india: bool = False


class PlatformResult(BaseModel):
    platform: str
    india_posts: List[Post]
    other_posts: List[Post]
    error: Optional[str] = None


class SearchResponse(BaseModel):
    keyword: str
    results: List[PlatformResult]
