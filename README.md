# Keyword News Aggregator

Search a keyword and get matching posts from **YouTube** and **Telegram**,
with India-related posts shown first on each platform, followed by everything else.

```
news-aggregator/
├── backend/                 FastAPI app
│   ├── main.py               API entrypoint (/api/search)
│   ├── config.py             loads .env
│   ├── database.py           SQLAlchemy engine/session
│   ├── models.py             DB tables (cache + search history)
│   ├── schemas.py            API response shapes
│   ├── generate_session.py   one-time Telegram login script
│   ├── requirements.txt
│   ├── .env.example
│   └── services/
│       ├── youtube_service.py
│       ├── telegram_service.py
│       └── ranking.py         "is this India-related?" heuristics
└── frontend/                 Plain HTML/CSS/JS (no build step)
    ├── index.html
    ├── style.css
    └── app.js
```

## 1. Database layer — yes, it's included

SQLite by default (a single `news_aggregator.db` file, created automatically
on first run — nothing to install). It's used for:
- **Caching** fetched posts per keyword for `CACHE_TTL_MINUTES` (default 15),
  so repeated searches don't burn your API quota.
- **Search history** logging.

To switch to Postgres/MySQL later, just change `DATABASE_URL` in `.env` —
no code changes needed, since it's all through SQLAlchemy.

## 2. Getting the API keys

**YouTube Data API v3**
1. Go to console.cloud.google.com → create/select a project.
2. APIs & Services → Library → enable "YouTube Data API v3".
3. APIs & Services → Credentials → Create Credentials → API key.
4. Free quota: 10,000 units/day (~100 searches/day, since each search costs 100 units).

**Telegram**
1. Go to my.telegram.org → log in → "API development tools".
2. Create an app → you'll get `api_id` and `api_hash`.
3. This uses your personal Telegram account (via Telethon), not a bot —
   see the big comment in `telegram_service.py` for why: Telegram has no
   public "search everything" API, so this searches inside a curated list
   of public channels your account has joined (edit `CHANNELS_TO_SEARCH`
   in that file to add/remove channels).

## 3. Setup in VS Code

**Prerequisites:** Python 3.10+, VS Code with the Python extension.

1. Open the `news-aggregator` folder in VS Code (`File → Open Folder`).
2. Open a terminal in VS Code (`` Ctrl+` ``) and set up the backend:

```bash
cd backend
python -m venv venv

# activate it:
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

3. Create your `.env` file:

```bash
cp .env.example .env        # macOS/Linux
copy .env.example .env      # Windows
```

Open `.env` in VS Code and paste in the API keys you collected above.

4. One-time Telegram login (skip if you're not using Telegram yet):

```bash
python generate_session.py
```
It'll ask for your phone number and the login code Telegram texts you.
This creates a `.session` file so future runs don't ask again.

5. In VS Code, select the venv as your Python interpreter: `Ctrl+Shift+P`
   → "Python: Select Interpreter" → pick the one inside `backend/venv`.

## 4. Running it

**Backend** (from the `backend/` folder, venv activated):
```bash
uvicorn main:app --reload
```
This starts the API at `http://127.0.0.1:8000`. Check `http://127.0.0.1:8000/docs`
for interactive Swagger docs, and try `http://127.0.0.1:8000/api/search?keyword=cricket`.

**Frontend** — it's static HTML/JS, so just serve the folder. Easiest options:
- VS Code: install the **"Live Server"** extension → right-click `frontend/index.html`
  → "Open with Live Server". It'll open at something like `http://127.0.0.1:5500`.
- Or from a terminal: `cd frontend && python -m http.server 5500`, then open
  `http://127.0.0.1:5500` in your browser.

If your frontend runs on a different port than `http://127.0.0.1:5500`, update
`FRONTEND_ORIGIN` in `.env` to match (for CORS), and update `API_BASE_URL` at
the top of `frontend/app.js` if your backend URL ever changes.

## 5. Notes / things to tune

- **India-detection is heuristic**, not perfect — it checks region codes,
  known Indian Telegram channels, keyword lists, and Devanagari script.
  Tune the lists in `backend/services/ranking.py` for your topics.
- **Rate limits**: YouTube ~100 searches/day free; Telegram is limited by
  how many channels you search and Telegram's own flood limits — the
  built-in cache absorbs repeat searches.
- To add more platforms later, drop a new file in `backend/services/`
  following the same `search_x(keyword) -> list[dict]` pattern used by
  the existing two, and wire it into `main.py`.
