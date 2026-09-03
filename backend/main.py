import asyncio
from datetime import datetime, timedelta

from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from config import settings
from database import Base, engine, get_db
import models
from schemas import SearchResponse, PlatformResult, Post
from services.ranking import split_india_first
from services.youtube_service import search_youtube
from services.telegram_service import search_telegram

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Keyword News Aggregator", version="1.0.0")

origins = list({
    settings.FRONTEND_ORIGIN.rstrip("/"),
    "http://127.0.0.1:5500",
    "http://localhost:5500",
})

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


def _get_cached(db: Session, platform: str, keyword: str):
    cutoff = datetime.utcnow() - timedelta(minutes=settings.CACHE_TTL_MINUTES)
    rows = (
        db.query(models.CachedPost)
        .filter(
            models.CachedPost.platform == platform,
            models.CachedPost.keyword == keyword.lower(),
            models.CachedPost.fetched_at >= cutoff,
        )
        .all()
    )
    if not rows:
        return None
    return [
        {
            "platform": r.platform,
            "post_id": r.post_id,
            "title": r.title,
            "url": r.url,
            "snippet": r.snippet,
            "author": r.author,
            "thumbnail": r.thumbnail,
            "published_at": r.published_at,
            "is_india": r.is_india,
        }
        for r in rows
    ]


def _store_cache(db: Session, platform: str, keyword: str, posts: list[dict]):
    # Clear stale rows for this platform+keyword, then insert fresh ones
    db.query(models.CachedPost).filter(
        models.CachedPost.platform == platform,
        models.CachedPost.keyword == keyword.lower(),
    ).delete()
    for p in posts:
        db.add(models.CachedPost(
            platform=platform,
            keyword=keyword.lower(),
            post_id=p["post_id"],
            title=p["title"],
            url=p["url"],
            snippet=p.get("snippet", ""),
            author=p.get("author", ""),
            thumbnail=p.get("thumbnail", ""),
            published_at=p.get("published_at", ""),
            is_india=p.get("is_india", False),
        ))
    db.commit()


async def _fetch_platform(db: Session, platform: str, keyword: str) -> PlatformResult:
    cached = _get_cached(db, platform, keyword)
    if cached is not None:
        india, others = split_india_first(cached)
        return PlatformResult(
            platform=platform,
            india_posts=[Post(**p) for p in india],
            other_posts=[Post(**p) for p in others],
        )

    fetch_fn = {"youtube": search_youtube, "telegram": search_telegram}[platform]
    try:
        posts = await fetch_fn(keyword)
        _store_cache(db, platform, keyword, posts)
        india, others = split_india_first(posts)
        return PlatformResult(
            platform=platform,
            india_posts=[Post(**p) for p in india],
            other_posts=[Post(**p) for p in others],
        )
    except Exception as e:
        return PlatformResult(platform=platform, india_posts=[], other_posts=[], error=str(e))


@app.get("/api/search", response_model=SearchResponse)
async def search(
    keyword: str = Query(..., min_length=1, description="Topic to search, e.g. 'cricket'"),
    db: Session = Depends(get_db),
):
    db.add(models.SearchHistory(keyword=keyword))
    db.commit()

    results = await asyncio.gather(
        _fetch_platform(db, "youtube", keyword),
        _fetch_platform(db, "telegram", keyword),
    )
    return SearchResponse(keyword=keyword, results=list(results))
