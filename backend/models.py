from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, UniqueConstraint

from database import Base


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String(255), index=True, nullable=False)
    searched_at = Column(DateTime, default=datetime.utcnow)


class CachedPost(Base):
    """
    Stores fetched posts per (platform, keyword, post_id) so repeated
    searches for the same keyword within CACHE_TTL_MINUTES don't
    re-hit YouTube/Telegram rate limits.
    """
    __tablename__ = "cached_posts"
    __table_args__ = (UniqueConstraint("platform", "post_id", "keyword", name="uq_platform_post_keyword"),)

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(20), index=True, nullable=False)   # youtube | telegram
    keyword = Column(String(255), index=True, nullable=False)
    post_id = Column(String(255), nullable=False)                # native id on that platform
    title = Column(Text, nullable=False)
    url = Column(Text, nullable=False)
    snippet = Column(Text, default="")
    author = Column(String(255), default="")
    thumbnail = Column(Text, default="")
    published_at = Column(String(64), default="")
    is_india = Column(Boolean, default=False)
    fetched_at = Column(DateTime, default=datetime.utcnow)
