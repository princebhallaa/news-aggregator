# Comprehensive Project Engineering Documentation
## NewsPulse: India-First Cross-Platform News Aggregator

---

### Executive Summary

**NewsPulse** is an asynchronous, multi-platform news aggregation engine designed to discover, ingest, classify, and present real-time keyword-based news from diverse digital media ecosystems—specifically **YouTube** and **Telegram**. 

Unlike conventional search tools that suffer from platform silos or globally skewed results, NewsPulse implements an **India-First Heuristic Classification Pipeline**. By analyzing Indic Unicode scripts, verified media source identities, and a domain vocabulary of geopolitical, economic, and cultural entities, the system segregates live content into prioritized **India** results and **Global/Other** results in real time. 

The application is architected with an asynchronous **FastAPI** backend leveraging non-blocking concurrency (`asyncio.gather`), a **15-minute Time-To-Live (TTL) relational cache** (SQLAlchemy / SQLite) to conserve third-party API quotas, and a reactive, zero-install **React 18** client styled with **Tailwind CSS**.

---

## 1. Problem Statement & Motivation

### 1.1 The Problem
In contemporary digital media consumption, breaking news and critical updates are highly fragmented:
1. **Platform Silos**: Video journalism thrives on **YouTube**, while real-time, censorship-resistant, immediate reporting thrives on **Telegram** channels. Users must switch contexts and search each platform manually.
2. **Lack of Regional Relevance Filtering**: Global search engines rank content based on worldwide volume. Searching for broad terms like *"elections"*, *"AI"*, or *"protest"* produces predominantly Western or global content, burying pertinent domestic Indian developments.
3. **Absence of Standardized Regional Metadata**: YouTube search APIs do not enforce a strict country tag on videos, and Telegram lacks any structured geographic metadata altogether. 
4. **Strict API Quotas & Latency**: Public APIs have tight daily quotas (e.g., YouTube Data API provides only 10,000 quota units per day on the free tier, with each search consuming 100 units). Sequential network requests create unacceptable delays for end users.

### 1.2 The Solution
NewsPulse addresses these challenges by:
* Unifying multi-platform discovery into a single coordinated search interface.
* Implementing a multi-signal **India-First Heuristic Classifier** that analyzes text, script, and source identity without requiring expensive machine-learning runtime overhead.
* Executing concurrent, non-blocking requests across platforms via Python's asynchronous event loop.
* Employing a 15-minute Time-To-Live (TTL) cache-aside pattern to reduce API expenditure by up to 90% for popular queries.

---

## 2. Requirement Specifications

### 2.1 Functional Requirements (FR)

| ID | Feature | Description |
| :--- | :--- | :--- |
| **FR-01** | **Keyword Search** | The system must accept user-defined string queries (alphanumeric and spaces) and execute cross-platform discovery. |
| **FR-02** | **YouTube Ingestion** | Ingest video results via YouTube Data API v3, tailored to the Indian region (`regionCode=IN`), capturing video ID, title, description, channel title, publication date, and thumbnail. |
| **FR-03** | **Telegram Ingestion** | Connect to Telegram via Telethon MTProto protocol and search messages across a curated registry of active public news channels. |
| **FR-04** | **India-First Classification** | Every retrieved post must be evaluated by the classification engine and tagged with boolean `is_india`. |
| **FR-05** | **Partitioned Presentation** | Results on both platforms must be bifurcated into two distinct view sections: `India First` and `Global & Other Posts`. |
| **FR-06** | **TTL Caching** | Queries and their categorized results must be cached in SQLite for 15 minutes. Duplicate queries within the TTL must be served directly from storage. |
| **FR-07** | **Search History Tracking** | Store timestamps and keywords in a dedicated audit table for analytics and query trending. |
| **FR-08** | **Interactive Client Filtering** | The frontend must allow client-side filtering by **All**, **India Only**, **YouTube Only**, and **Telegram Only** without re-querying the API. |
| **FR-09** | **Live Status Monitoring** | The frontend must poll or verify backend health status (`/health`) and present real-time connection status to the user. |

### 2.2 Non-Functional Requirements (NFR)

* **Performance & Latency**: 
  * Cache hits must respond in `< 10ms`.
  * Cache misses (live network ingestion) must execute within `< 2.5 seconds` by querying YouTube and Telegram concurrently via `asyncio.gather`.
* **Scalability**:
  * Decoupled architecture separating ASGI backend from static frontend.
  * Relational schema designed for zero-migration transition from SQLite to PostgreSQL.
* **Fault Tolerance & Resilience**:
  * Platform isolation: A failure or rate limit in Telegram must not disrupt YouTube results, and vice versa.
  * Silent error handling for unreachable or private Telegram channels.
* **Security & Credential Isolation**:
  * Compliance with 12-Factor App methodology: All secrets (`YOUTUBE_API_KEY`, `TELEGRAM_API_ID`, `TELEGRAM_API_HASH`, `.session` credentials) must reside exclusively in environment variables and be strictly ignored by version control.
* **Usability & Accessibility**:
  * Zero-build frontend: Runs directly in modern browsers without requiring Node.js or build toolchains.
  * Shimmer skeleton loading state to minimize perceived user latency.
  * Responsive layout adapting seamlessly from 360px mobile viewports to ultra-wide displays.

---

## 3. Theoretical Foundations & Methodology

### 3.1 Heuristic Multi-Signal Classification vs. Machine Learning
When sorting real-time news into regional buckets, traditional approaches rely on heavy NLP models (e.g., BERT, spaCy NER). However, for an interactive search aggregator, machine learning introduces two major bottlenecks:
1. **Inference Latency**: Running transformer models on 30+ titles and descriptions adds 500ms–2000ms of CPU latency per request.
2. **Cold Start & Deployment Overhead**: Heavy model weights (500MB+) complicate lightweight deployments.

NewsPulse adopts a **Multi-Signal Heuristic Rule Engine** operating in $O(N)$ time complexity with virtually zero CPU overhead:

$$\text{is\_india} = S_{\text{metadata}} \lor S_{\text{script}} \lor S_{\text{vocabulary}}$$

#### Signal 1: Source & Metadata Verification ($S_{\text{metadata}}$)
* **Telegram**: Direct verification against a set of verified Indian media identifiers:
  $$\text{channel} \in \{\text{ndtv}, \text{aajtakofficial}, \text{indiatoday}, \text{zeenews}, \text{hindustantimes}, \dots\}$$
* **YouTube**: Evaluation of `channelTitle` against verified Indian broadcast networks.

#### Signal 2: Indic Script Regex Detection ($S_{\text{script}}$)
India possesses 22 official languages utilizing distinct phonetic writing scripts. The presence of these Unicode codepoint blocks in title or snippet text constitutes definitive evidence of Indian origin:
$$\text{Regex Pattern: } [\backslash u0900 - \backslash u0D7F]$$
Covering:
* **Devanagari** (`U+0900` to `U+097F`): Hindi, Marathi, Sanskrit.
* **Bengali / Assamese** (`U+0980` to `U+09FF`)
* **Gurmukhi** (`U+0A00` to `U+0A7F`): Punjabi
* **Gujarati** (`U+0A80` to `U+0AFF`)
* **Oriya** (`U+0B00` to `U+0B7F`)
* **Tamil** (`U+0B80` to `U+0BFF`)
* **Telugu** (`U+0C00` to `U+0C7F`)
* **Kannada** (`U+0C80` to `U+0CFF`)
* **Malayalam** (`U+0D00` to `U+0D7F`)

#### Signal 3: Domain Entity Vocabulary Matching ($S_{\text{vocabulary}}$)
A curated domain lexicon of 150+ categorized entity tokens representing:
* Geopolitical divisions (all 28 states, 8 Union territories, 40+ major tier-1/tier-2 metropolitan centers).
* Administrative & constitutional bodies (*Lok Sabha, Rajya Sabha, Vidhan Sabha, ECI, Supreme Court of India*).
* Economic & technological infrastructure (*UPI, Rupee, ₹, RBI, SEBI, ISRO, DRDO, Aadhaar*).
* National organizations, leaders, and conglomerates (*Tata, Reliance, Jio, Adani, Infosys, Wipro, BCCI, IPL*).

---

### 3.2 Asynchronous Concurrency Model
In Python, traditional web frameworks (like default Flask or Django WSGI) are synchronous. Under synchronous execution:

$$T_{\text{total}} = T_{\text{YouTube}} + T_{\text{Telegram}} \approx 1.2s + 1.1s = 2.3s$$

NewsPulse utilizes **FastAPI** on an ASGI event loop with `asyncio.gather()`:

$$T_{\text{total}} = \max(T_{\text{YouTube}}, T_{\text{Telegram}}) + \epsilon \approx 1.2s$$

While waiting on external network sockets, the single Python thread yields control back to the event loop to serve other incoming client requests concurrently without thread starvation.

---

### 3.3 Cache-Aside TTL Architecture
To prevent quota exhaustion, the backend implements the **Cache-Aside pattern**:

```
Client Request
      │
      ▼
┌──────────────┐      Hit (< 15 min)     ┌────────────────┐
│ Read Cache   │ ──────────────────────► │ Return Results │
└──────────────┘                         └────────────────┘
      │ Miss (> 15 min or absent)
      ▼
┌──────────────┐
│ Ingest APIs  │
└──────────────┘
      │
      ▼
┌──────────────┐
│ Write Cache  │
└──────────────┘
      │
      ▼
┌────────────────┐
│ Return Results │
└────────────────┘
```

1. Query execution checks `cached_posts` table where `keyword = :kw` and `fetched_at >= now() - 15 minutes`.
2. On cache miss:
   * Perform live external fetch.
   * Clear any stale rows for `(:platform, :keyword)`.
   * Insert fresh records with serialized metadata.
   * Commit transaction.

---

## 4. Tech Stack Justification

| Layer | Technology | Primary Rationale |
| :--- | :--- | :--- |
| **Backend Framework** | **FastAPI 0.115** | Native `async`/`await`, automatic Pydantic request/response validation, automatic interactive OpenAPI/Swagger docs (`/docs`). |
| **ASGI Web Server** | **Uvicorn 0.30** | High-performance, production-grade asynchronous server implementation based on `uvloop` and `httptools`. |
| **Telegram Protocol** | **Telethon 1.36** | Directly connects to Telegram's native MTProto binary protocol using an authenticated user session, enabling channel search that the standard Bot API forbids. |
| **Async HTTP Client** | **aiohttp 3.10** | Asynchronous, non-blocking HTTP client supporting connection pooling for YouTube API requests. |
| **ORM & Data Layer** | **SQLAlchemy 2.0** | Industry standard Python ORM providing clean abstraction over SQLite with seamless migration path to PostgreSQL/MySQL. |
| **Data Validation** | **Pydantic 2.9** | Ultra-fast C-compiled schema validation (`pydantic-core`) ensuring strict API contracts. |
| **Frontend Framework** | **React 18** | Component-driven declarative UI, reactive state management (`useState`, `useEffect`, `useMemo`), clean event-driven updates. |
| **Compiler / Engine** | **Babel Standalone** | Transpiles JSX directly in the client browser, eliminating the requirement for Node.js or `npm` build steps. |
| **CSS Utility Engine** | **Tailwind CSS CDN** | Utility-first CSS providing responsive grids, custom dark-mode palettes, and modern aesthetic styling without bloated CSS stylesheets. |
| **Database** | **SQLite 3** | Zero-configuration, serverless, self-contained ACID-compliant transactional relational engine. |

---

## 5. Architectural Structure & Repository Layout

```
news-aggregator/
├── backend/
│   ├── main.py                  # API routes, CORS configuration, lifecycle management
│   ├── config.py                # Environment schema validation (pydantic-settings)
│   ├── database.py              # SQLAlchemy engine initialization and session generator
│   ├── models.py                # Relational DB models (CachedPost, SearchHistory)
│   ├── schemas.py               # Pydantic data transfer schemas (SearchResponse, Post)
│   ├── generate_session.py      # One-time interactive Telegram login script
│   ├── requirements.txt         # Pinned backend dependencies
│   ├── .env                     # Local secrets (API keys, session names) - [GIT-IGNORED]
│   ├── .env.example             # Safe template for environment configuration
│   ├── news_aggregator.db       # Local SQLite database file - [GIT-IGNORED]
│   └── services/
│       ├── __init__.py
│       ├── ranking.py           # India-first heuristic classifier & Indic regex
│       ├── youtube_service.py   # YouTube Data API v3 search client
│       └── telegram_service.py  # Telethon channel search client
├── frontend/
│   ├── index.html               # React & Tailwind shell, font & meta configurations
│   ├── style.css                # Shimmer animations, custom scrollbars, utility classes
│   └── app.js                   # React 18 component tree (App, Search, Columns, Cards)
├── DOCUMENTATION.md             # Comprehensive Architecture & System Design Document
├── .gitignore                   # Comprehensive rule set protecting credentials & storage
└── README.md                    # Quick-start documentation
```

---

## 6. Database Schema Design

### 6.1 `cached_posts` Table
Stores normalized posts fetched across platforms to serve subsequent searches within the cache window.

```sql
CREATE TABLE cached_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform VARCHAR NOT NULL,          -- 'youtube' | 'telegram'
    keyword VARCHAR NOT NULL,           -- lowercase query term
    post_id VARCHAR NOT NULL,           -- platform-specific unique ID
    title VARCHAR NOT NULL,             -- post/video title
    url VARCHAR NOT NULL,               -- direct destination URL
    snippet TEXT,                       -- description or message body
    author VARCHAR,                     -- channel title or username
    thumbnail VARCHAR,                  -- image preview URL
    published_at VARCHAR,               -- ISO 8601 publication string
    is_india BOOLEAN NOT NULL,          -- heuristic classification flag
    fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_cached_posts_platform ON cached_posts(platform);
CREATE INDEX ix_cached_posts_keyword ON cached_posts(keyword);
CREATE INDEX ix_cached_posts_fetched_at ON cached_posts(fetched_at);
```

### 6.2 `search_history` Table
Audit table recording all user queries for analytical tracking.

```sql
CREATE TABLE search_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword VARCHAR NOT NULL,
    searched_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_search_history_keyword ON search_history(keyword);
```

---

## 7. API Specification & Contracts

### 7.1 Health Check Endpoint
* **Path**: `GET /health`
* **Purpose**: Liveness probe and frontend connection verification.
* **Response**:
```json
{
  "status": "ok"
}
```

### 7.2 Search Aggregation Endpoint
* **Path**: `GET /api/search`
* **Query Parameters**:
  * `keyword` (string, required): The search topic (e.g., `cricket`, `elections`, `AI`).
* **Response Schema (`200 OK`)**:
```json
{
  "keyword": "cricket",
  "results": [
    {
      "platform": "youtube",
      "india_posts": [
        {
          "platform": "youtube",
          "post_id": "abc123xyz",
          "title": "India vs England Match Highlights",
          "url": "https://www.youtube.com/watch?v=abc123xyz",
          "snippet": "Watch all the boundaries from team India...",
          "author": "BCCI Official",
          "thumbnail": "https://i.ytimg.com/vi/abc123xyz/mqdefault.jpg",
          "published_at": "2026-09-03T18:00:00Z",
          "is_india": true
        }
      ],
      "other_posts": [],
      "error": null
    },
    {
      "platform": "telegram",
      "india_posts": [
        {
          "platform": "telegram",
          "post_id": "ndtv_10928",
          "title": "Breaking: Team announcement for the upcoming tournament...",
          "url": "https://t.me/ndtv/10928",
          "snippet": "Full squad details released by the selection committee...",
          "author": "@ndtv",
          "thumbnail": "",
          "published_at": "2026-09-03T18:05:00Z",
          "is_india": true
        }
      ],
      "other_posts": [],
      "error": null
    }
  ]
}
```

---

## 8. Setup, Installation & Execution

### 8.1 Prerequisites
* Python 3.10 or higher.
* A Google Cloud project with **YouTube Data API v3** enabled.
* A Telegram user account with API credentials from **my.telegram.org**.

### 8.2 Environment Configuration
Create a `.env` file in the `backend/` directory:
```ini
YOUTUBE_API_KEY=your_google_youtube_api_key
TELEGRAM_API_ID=your_telegram_api_id
TELEGRAM_API_HASH=your_telegram_api_hash
TELEGRAM_SESSION_NAME=news_aggregator_session

DATABASE_URL=sqlite:///./news_aggregator.db
CACHE_TTL_MINUTES=15
MAX_RESULTS_PER_PLATFORM=15
FRONTEND_ORIGIN=http://127.0.0.1:5500
```

### 8.3 Telegram Session Generation (One-Time)
```bash
cd backend
python generate_session.py
```
*Enter your phone number and the Telegram verification code. This generates `news_aggregator_session.session` for automatic future authorization.*

### 8.4 Starting the Services
1. **Backend Server**:
   ```bash
   cd backend
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
2. **Frontend Server**:
   ```bash
   cd frontend
   python -m http.server 5500
   ```
3. **Access**: Open **`http://127.0.0.1:5500`** in your browser.

---

## 9. Security & Production Hardening

1. **Credential Isolation**:
   The `.gitignore` strictly prevents `.env`, `*.session`, and `news_aggregator.db` from being tracked. Even if the project is pushed to a public repository, zero credentials or session tokens are leaked.
2. **CORS Restrictions**:
   `CORSMiddleware` explicitly permits only designated origins (`http://127.0.0.1:5500` and `http://localhost:5500`), mitigating cross-site scripting (XSS) request injection.
3. **Telegram Rate Protection**:
   Telethon calls are capped per channel and wrapped in defensive exception blocks (`ChannelPrivateError`, `UsernameNotOccupiedError`), ensuring the service never crashes from third-party channel state changes.

---

## 10. Future Scope & Scalability Roadmap

* **Distributed In-Memory Caching**: Replace SQLite caching with **Redis** for distributed sub-millisecond cache hits across clustered API replicas.
* **Additional Platforms**: Implement modular adapters for **Reddit** (`asyncpraw`), **X / Twitter** (v2 API), and **RSS feeds** of leading media houses.
* **Background Worker Polling**: Implement **Celery** or **Temporal** background workers to proactively ingest news for trending topics into cache before users query them.
* **Semantic Vector Classification**: Augment the heuristic classifier with lightweight vector embeddings (e.g., `all-MiniLM-L6-v2`) to capture contextually nuanced regional stories that do not contain explicit keyword tokens.
