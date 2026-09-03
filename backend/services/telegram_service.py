"""
Telegram search via Telethon (user-account API, not the Bot API).

IMPORTANT LIMITATION — read this before you rely on it:
Telegram has NO public "search the whole platform for a keyword" API.
The Bot API can't search at all, and even the user API (MTProto, which
Telethon wraps) can only search:
  (a) inside chats/channels your account is already a member of, or
  (b) Telegram's global public-chat search, which finds CHANNEL NAMES
      matching a query — not a full-text search of every message ever
      posted.

So this service searches for the keyword inside messages of a curated
list of public channels (CHANNELS_TO_SEARCH below) that your account
has joined. Add/remove channels there to control coverage. This is the
same approach real Telegram-monitoring tools use.

One-time setup: run generate_session.py (see README) once, interactively,
to log in and create a .session file. After that, this service reuses
that session with no further login prompts.
"""
from telethon import TelegramClient
from telethon.errors import ChannelPrivateError, UsernameNotOccupiedError

from config import settings
from services.ranking import is_india_related

# Public channel usernames (without @) to search within.
# Mix of Indian and international news/topic channels.
CHANNELS_TO_SEARCH = [
    "ndtv", "aajtakofficial", "indiatoday", "zeenews", "zeenewshindi",
    "hindustantimes", "theprintindia", "timesofindia", "livemint",
    "moneycontrolcom", "cricbuzz", "espncricinfo", "bbcworld", "bloomberg",
]

_client = None


async def _get_client():
    global _client
    if _client is None:
        if not settings.TELEGRAM_API_ID or not settings.TELEGRAM_API_HASH:
            raise RuntimeError("TELEGRAM_API_ID / TELEGRAM_API_HASH not set in .env")
        _client = TelegramClient(
            settings.TELEGRAM_SESSION_NAME,
            int(settings.TELEGRAM_API_ID),
            settings.TELEGRAM_API_HASH,
        )
    if not _client.is_connected():
        await _client.connect()
        if not await _client.is_user_authorized():
            raise RuntimeError(
                "Telegram session not authorized. Run generate_session.py once to log in."
            )
    return _client


async def search_telegram(keyword: str, max_results: int = None) -> list[dict]:
    max_results = max_results or settings.MAX_RESULTS_PER_PLATFORM
    client = await _get_client()

    posts = []
    # Allow up to 5 posts per channel so active channels can fulfill max_results
    per_channel_limit = 5

    for channel_username in CHANNELS_TO_SEARCH:
        if len(posts) >= max_results:
            break
        try:
            async for message in client.iter_messages(
                channel_username, search=keyword, limit=per_channel_limit
            ):
                text = (message.raw_text or message.message or "").strip()
                if not text or "couldn't be displayed" in text.lower():
                    continue
                title = text[:120].replace("\n", " ")
                posts.append({
                    "platform": "telegram",
                    "post_id": f"{channel_username}_{message.id}",
                    "title": title,
                    "url": f"https://t.me/{channel_username}/{message.id}",
                    "snippet": text[:300].replace("\n", " "),
                    "author": f"@{channel_username}",
                    "thumbnail": "",
                    "published_at": message.date.isoformat() if message.date else "",
                    "is_india": is_india_related(
                        text, channel_username=channel_username
                    ),
                })
                if len(posts) >= max_results:
                    break
        except (ChannelPrivateError, UsernameNotOccupiedError):
            continue
        except Exception:
            # Don't let one bad channel kill the whole search
            continue

    return posts[:max_results]
