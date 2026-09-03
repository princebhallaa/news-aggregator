"""
Run this ONCE, interactively, before starting the server, to log into
Telegram and create a local .session file. You'll be prompted for your
phone number and the login code Telegram sends you.

    python generate_session.py

After this succeeds you'll see a file like news_aggregator_session.session
in this folder — the backend reuses it silently from then on.
"""
from telethon import TelegramClient
from config import settings

if not settings.TELEGRAM_API_ID or not settings.TELEGRAM_API_HASH:
    raise SystemExit("Set TELEGRAM_API_ID and TELEGRAM_API_HASH in your .env first.")

client = TelegramClient(
    settings.TELEGRAM_SESSION_NAME,
    int(settings.TELEGRAM_API_ID),
    settings.TELEGRAM_API_HASH,
)

with client:
    print("Logged in successfully. Session file created.")
