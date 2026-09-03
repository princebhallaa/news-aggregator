"""
YouTube Data API v3 — search.list endpoint.
Docs: https://developers.google.com/youtube/v3/docs/search/list
Quota note: search.list costs 100 units per call out of a default
10,000 units/day quota, so ~100 searches/day on the free tier.
"""
import aiohttp

from config import settings
from services.ranking import is_india_related

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"


async def search_youtube(keyword: str, max_results: int = None) -> list[dict]:
    if not settings.YOUTUBE_API_KEY:
        raise RuntimeError("YOUTUBE_API_KEY is not set in .env")

    max_results = max_results or settings.MAX_RESULTS_PER_PLATFORM
    params = {
        "part": "snippet",
        "q": keyword,
        "type": "video",
        "order": "relevance",
        "regionCode": "IN",
        "maxResults": max_results,
        "key": settings.YOUTUBE_API_KEY,
    }

    async with aiohttp.ClientSession() as session:
        async with session.get(YOUTUBE_SEARCH_URL, params=params, timeout=15) as resp:
            data = await resp.json()
            if resp.status != 200:
                msg = data.get("error", {}).get("message", "Unknown YouTube API error")
                raise RuntimeError(f"YouTube API error: {msg}")

    posts = []
    for item in data.get("items", []):
        snippet = item.get("snippet", {})
        video_id = item.get("id", {}).get("videoId")
        if not video_id:
            continue
        title = snippet.get("title", "")
        description = snippet.get("description", "")
        channel_title = snippet.get("channelTitle", "")
        posts.append({
            "platform": "youtube",
            "post_id": video_id,
            "title": title,
            "url": f"https://www.youtube.com/watch?v={video_id}",
            "snippet": description,
            "author": channel_title,
            "thumbnail": snippet.get("thumbnails", {}).get("medium", {}).get("url", ""),
            "published_at": snippet.get("publishedAt", ""),
            "is_india": is_india_related(
                title=title,
                snippet=description,
                channel_username=channel_title,
            ),
        })
    return posts
