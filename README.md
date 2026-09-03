# 📰 NewsPulse: India-First Keyword News Aggregator

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat&logo=sqlite&logoColor=white)](https://sqlite.org)

Search any topic or keyword and get matching real-time news from **YouTube** and **Telegram** simultaneously, with an intelligent **India-First Heuristic Classification Engine** that prioritizes domestic Indian news while categorizing international/global posts into a dedicated section.

> 📖 **Full Engineering Documentation**: For in-depth system architecture, theoretical foundations, functional/non-functional requirements, and API contracts, see [**`DOCUMENTATION.md`**](DOCUMENTATION.md).

---

## 🌟 Key Features

* **🇮🇳 India-First Heuristic Classifier**:
  * **Indic Script Unicode Detection**: Evaluates text against all 9 major Indic scripts (*Devanagari, Bengali, Tamil, Telugu, Gujarati, Gurmukhi, Kannada, Malayalam, Oriya*).
  * **150+ Domain Entity Tokens**: Matches states, union territories, major cities, governance bodies (*Lok Sabha, ECI*), economy (*UPI, Rupee, ₹*), and institutions (*ISRO, DRDO, BCCI*).
  * **Channel Identity Verification**: Recognizes verified Indian broadcast publishers (*NDTV, Aaj Tak, India Today, Zee News, Hindustan Times, ThePrint, Mint, Cricbuzz*).
* **⚡ Concurrent Non-Blocking Ingestion**:
  * Parallel platform querying using `asyncio.gather()`, cutting API latency by nearly 50%.
  * Native non-blocking HTTP via `aiohttp` for YouTube and MTProto binary protocol via `Telethon` for Telegram.
* **⚛️ Reactive Modern Frontend (React 18 + Tailwind CSS)**:
  * **Zero-Install Architecture**: Runs directly in the browser via React 18, Babel Standalone, and Tailwind CDN without requiring Node.js or `npm`.
  * **Shimmer Skeleton Loading**: Fluid placeholder cards shown while fetching instead of blank screens.
  * **Interactive Filter Tabs**: Filter instantly between **All Posts**, **🇮🇳 India Only**, **YouTube**, and **Telegram** with live count badges.
  * **Quick Topic Pills**: One-click searches for popular trends (*Cricket, Elections, ISRO, Modi, AI, Startups*).
* **🛡️ Smart TTL Caching & Quota Protection**:
  * 15-minute Time-To-Live (TTL) cache-aside pattern in SQLite via SQLAlchemy 2.0.
  * Absorbs repeat queries with `< 10ms` response times, preserving YouTube daily quotas.

---

## 📂 Project Structure

```
news-aggregator/
├── backend/
│   ├── main.py                  # FastAPI application entrypoint & CORS config
│   ├── config.py                # Environment configuration (pydantic-settings)
│   ├── database.py              # SQLAlchemy engine & DB session generator
│   ├── models.py                # Database models (CachedPost, SearchHistory)
│   ├── schemas.py               # Pydantic response schemas (SearchResponse, Post)
│   ├── generate_session.py      # One-time Telegram interactive login script
│   ├── requirements.txt         # Pinned backend dependencies
│   ├── .env.example             # Template for API credentials
│   └── services/
│       ├── ranking.py           # India-first heuristic classifier & Indic regex
│       ├── youtube_service.py   # YouTube Data API v3 client (regionCode=IN)
│       └── telegram_service.py  # Telethon MTProto client for news channels
├── frontend/
│   ├── index.html               # React 18 shell with Tailwind CSS & Google Fonts
│   ├── style.css                # Shimmer keyframes, custom scrollbars, styling
│   └── app.js                   # React component tree (App, Search, Tabs, Cards)
├── DOCUMENTATION.md             # Comprehensive Architecture & Design Document
├── .gitignore                   # Credential & database protection
└── README.md                    # Project overview & quick start
```

---

## 🚀 Getting Started

### 1. Prerequisites
* Python 3.10+ installed.
* A YouTube Data API v3 key from **[Google Cloud Console](https://console.cloud.google.com)**.
* Telegram API credentials (`api_id` and `api_hash`) from **[my.telegram.org](https://my.telegram.org)**.

### 2. Backend Setup
From the `news-aggregator/` root directory:

```bash
cd backend
python -m venv venv

# Activate venv:
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:

```bash
# Windows:
copy .env.example .env
# macOS / Linux:
cp .env.example .env
```

Open `backend/.env` and paste in your API credentials:
```ini
YOUTUBE_API_KEY=your_youtube_api_key_here
TELEGRAM_API_ID=your_telegram_api_id_here
TELEGRAM_API_HASH=your_telegram_api_hash_here
TELEGRAM_SESSION_NAME=news_aggregator_session

DATABASE_URL=sqlite:///./news_aggregator.db
CACHE_TTL_MINUTES=15
MAX_RESULTS_PER_PLATFORM=15
FRONTEND_ORIGIN=http://127.0.0.1:5500
```

### 4. One-Time Telegram Authorization
```bash
python generate_session.py
```
*Enter your phone number and the SMS login code. This generates a secure `news_aggregator_session.session` file so future searches connect automatically.*

---

## 💻 Running the Application

### 1. Start the FastAPI Backend
With your `backend/venv` activated:
```bash
cd backend
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
* API Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
* Interactive Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Start the React Frontend
In a separate terminal:
```bash
cd frontend
python -m http.server 5500
```
*(Or in VS Code, right-click `frontend/index.html` → "Open with Live Server").*

Open your browser at **[http://127.0.0.1:5500](http://127.0.0.1:5500)**.

---

## 🔒 Security & Privacy

* **Credential Isolation**: `.env` and `*.session` files are strictly excluded via `.gitignore` to prevent leaking API keys or Telegram sessions to GitHub.
* **CORS Whitelist**: Access is strictly limited to authorized origins (`http://127.0.0.1:5500` and `http://localhost:5500`).

---

## 📄 License
MIT License. Created for portfolio and production-ready news aggregation.
