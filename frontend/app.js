const { useState, useEffect, useMemo, useCallback } = React;

const API_BASE_URL = "http://127.0.0.1:8000";

const QUICK_TOPICS = ["Cricket", "Elections", "ISRO", "Modi", "AI", "Startups", "Bollywood"];

// --- SVG Icons ---
function IconSearch({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function IconYouTube({ className = "w-5 h-5 text-red-500" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function IconTelegram({ className = "w-5 h-5 text-sky-400" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.922z" />
    </svg>
  );
}

function IconExternalLink({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function IconSparkles({ className = "w-4 h-4 text-saffron" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function IconFilter({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );
}

function IconClock({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// --- Skeleton Card Component ---
function SkeletonCard() {
  return (
    <div className="bg-brand-surface border border-brand-cardBorder rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-12 h-4 rounded-md shimmer" />
        <div className="w-24 h-4 rounded-md shimmer" />
      </div>
      <div className="w-full h-5 rounded-md shimmer" />
      <div className="w-3/4 h-5 rounded-md shimmer" />
      <div className="w-5/6 h-3.5 rounded-md shimmer pt-1" />
      <div className="flex justify-between items-center pt-2">
        <div className="w-20 h-3 rounded shimmer" />
        <div className="w-14 h-3 rounded shimmer" />
      </div>
    </div>
  );
}

// --- Post Card Component ---
function PostCard({ post, isIndia }) {
  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-brand-surface hover:bg-brand-surfaceHover border border-brand-cardBorder hover:border-brand-cardBorderHover rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 relative overflow-hidden"
    >
      {/* Accent Indicator Bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${isIndia ? "bg-gradient-to-r from-saffron via-white to-green-india" : "bg-brand-cardBorder"}`} />

      {/* Top Meta Line */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {isIndia && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-saffron/15 text-saffron border border-saffron/30 shadow-sm">
              <span>🇮🇳</span>
              <span>India</span>
            </span>
          )}
          <span className="text-xs font-medium text-brand-muted truncate max-w-[200px]">
            {post.author || "News update"}
          </span>
        </div>
        <span className="text-brand-muted/60 group-hover:text-brand-text group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
          <IconExternalLink className="w-4 h-4" />
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-brand-text group-hover:text-saffron transition-colors leading-snug mb-1.5 line-clamp-2">
        {post.title}
      </h3>

      {/* Snippet */}
      {post.snippet && (
        <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed mb-3">
          {post.snippet}
        </p>
      )}

      {/* Bottom Row */}
      <div className="flex items-center justify-between text-[11px] text-brand-muted/80 pt-2 border-t border-brand-cardBorder/60">
        <span className="flex items-center gap-1 font-mono text-[10px] text-brand-muted/60">
          ID: {post.post_id ? String(post.post_id).slice(-8) : "view"}
        </span>
        {post.published_at && (
          <span className="flex items-center gap-1">
            <IconClock className="w-3 h-3" />
            <span>{post.published_at.slice(0, 10)}</span>
          </span>
        )}
      </div>
    </a>
  );
}

// --- Platform Column Component ---
function PlatformColumn({ platformResult, activeFilter }) {
  const isYouTube = platformResult.platform.toLowerCase() === "youtube";
  const indiaPosts = platformResult.india_posts || [];
  const otherPosts = platformResult.other_posts || [];

  // Filter based on activeFilter
  const showIndiaOnly = activeFilter === "india";
  const visibleIndiaPosts = indiaPosts;
  const visibleOtherPosts = showIndiaOnly ? [] : otherPosts;
  const totalVisible = visibleIndiaPosts.length + visibleOtherPosts.length;

  return (
    <section className="bg-brand-surface/70 border border-brand-cardBorder rounded-2xl p-5 flex flex-col gap-4 backdrop-blur-sm">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-cardBorder">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${isYouTube ? "bg-red-500/10 text-red-500" : "bg-sky-500/10 text-sky-400"}`}>
            {isYouTube ? <IconYouTube className="w-5 h-5 text-red-500" /> : <IconTelegram className="w-5 h-5 text-sky-400" />}
          </div>
          <div>
            <h2 className="text-base font-bold capitalize text-brand-text flex items-center gap-2">
              {platformResult.platform}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-card border border-brand-cardBorder text-brand-muted">
                {totalVisible} {totalVisible === 1 ? "post" : "posts"}
              </span>
            </h2>
          </div>
        </div>

        {/* India vs Other Mini Indicator */}
        <div className="text-[11px] font-medium text-brand-muted flex items-center gap-2">
          {visibleIndiaPosts.length > 0 && (
            <span className="text-saffron">🇮🇳 {visibleIndiaPosts.length}</span>
          )}
          {visibleOtherPosts.length > 0 && (
            <span className="text-brand-muted/70">🌐 {visibleOtherPosts.length}</span>
          )}
        </div>
      </div>

      {/* Error state */}
      {platformResult.error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed">
          <strong>Error:</strong> {platformResult.error}
        </div>
      )}

      {/* Empty state */}
      {totalVisible === 0 && !platformResult.error && (
        <div className="py-12 text-center text-brand-muted text-xs flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-brand-card flex items-center justify-center text-brand-muted/50">
            <IconSearch className="w-5 h-5" />
          </div>
          <p>No matching posts found for this platform.</p>
        </div>
      )}

      {/* Posts List */}
      <div className="flex flex-col gap-3">
        {/* India First Section */}
        {visibleIndiaPosts.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-saffron pt-1">
              <span>🇮🇳 India First</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-saffron/20 border border-saffron/30">
                {visibleIndiaPosts.length}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-saffron/30 to-transparent ml-1" />
            </div>
            {visibleIndiaPosts.map((post) => (
              <PostCard key={post.post_id || post.url} post={post} isIndia={true} />
            ))}
          </div>
        )}

        {/* Other Posts Section */}
        {visibleOtherPosts.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-muted pt-2 border-t border-brand-cardBorder/60">
              <span>🌐 Global &amp; Other Posts</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-card border border-brand-cardBorder text-brand-muted/80">
                {visibleOtherPosts.length}
              </span>
              <div className="flex-1 h-px bg-brand-cardBorder/50 ml-1" />
            </div>
            {visibleOtherPosts.map((post) => (
              <PostCard key={post.post_id || post.url} post={post} isIndia={false} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// --- Main App Component ---
function App() {
  const [keyword, setKeyword] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [backendOnline, setBackendOnline] = useState(true);

  // Check backend health on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/health`)
      .then((res) => res.json())
      .then((d) => setBackendOnline(d.status === "ok"))
      .catch(() => setBackendOnline(false));
  }, []);

  const runSearch = useCallback(async (queryToSearch) => {
    const trimmed = queryToSearch.trim();
    if (!trimmed) return;

    setActiveQuery(trimmed);
    setKeyword(trimmed);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/search?keyword=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error(`Backend returned status ${res.status}`);
      const data = await res.json();
      setResults(data);
      setBackendOnline(true);
    } catch (err) {
      setError(err.message || "Failed to connect to backend server");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch(keyword);
  };

  // Stats calculation
  const stats = useMemo(() => {
    if (!results || !results.results) return { total: 0, india: 0, other: 0, yt: 0, tg: 0 };
    let total = 0, india = 0, other = 0, yt = 0, tg = 0;
    results.results.forEach((platformResult) => {
      const iCount = platformResult.india_posts ? platformResult.india_posts.length : 0;
      const oCount = platformResult.other_posts ? platformResult.other_posts.length : 0;
      const sum = iCount + oCount;
      total += sum;
      india += iCount;
      other += oCount;
      if (platformResult.platform.toLowerCase() === "youtube") yt = sum;
      if (platformResult.platform.toLowerCase() === "telegram") tg = sum;
    });
    return { total, india, other, yt, tg };
  }, [results]);

  // Filtered platforms to display
  const displayedPlatforms = useMemo(() => {
    if (!results || !results.results) return [];
    if (activeFilter === "youtube") {
      return results.results.filter((r) => r.platform.toLowerCase() === "youtube");
    }
    if (activeFilter === "telegram") {
      return results.results.filter((r) => r.platform.toLowerCase() === "telegram");
    }
    return results.results;
  }, [results, activeFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 flex flex-col gap-8">
      {/* Top Header */}
      <header className="flex flex-col items-center text-center gap-3">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-brand-cardBorder text-xs font-medium text-brand-muted">
          <span className={`w-2 h-2 rounded-full ${backendOnline ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
          <span>FastAPI Backend {backendOnline ? "Connected" : "Offline"}</span>
        </div>

        {/* Main Title with Tricolor Accent */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            <span>NewsPulse</span>
            <span className="text-saffron">.</span>
          </h1>
          <p className="text-sm sm:text-base text-brand-muted max-w-lg mx-auto">
            Real-time keyword news across <strong className="text-red-400 font-semibold">YouTube</strong> &amp; <strong className="text-sky-400 font-semibold">Telegram</strong> with India results prioritized.
          </p>
        </div>
      </header>

      {/* Search Section */}
      <div className="max-w-2xl w-full mx-auto flex flex-col gap-3">
        <form onSubmit={handleSubmit} className="relative flex items-center shadow-xl shadow-black/40 rounded-2xl">
          <div className="absolute left-4 pointer-events-none text-brand-muted">
            <IconSearch className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search any topic (e.g. Cricket, Elections, ISRO, AI, Budget)..."
            required
            className="w-full pl-12 pr-32 py-4 bg-brand-surface border border-brand-cardBorder rounded-2xl text-brand-text placeholder-brand-muted/70 text-sm sm:text-base focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !keyword.trim()}
            className="absolute right-2.5 px-5 py-2.5 bg-saffron hover:bg-saffron/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-saffron/20 flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Searching</span>
              </>
            ) : (
              <>
                <span>Search</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Topic Chips */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center text-xs text-brand-muted">
          <span className="flex items-center gap-1 text-brand-muted/70 mr-1">
            <IconSparkles className="w-3.5 h-3.5" />
            <span>Popular:</span>
          </span>
          {QUICK_TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => runSearch(topic)}
              className="px-2.5 py-1 rounded-lg bg-brand-surface hover:bg-brand-surfaceHover border border-brand-cardBorder hover:border-brand-cardBorderHover text-brand-muted hover:text-brand-text transition-all active:scale-95"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs & Stats Bar (when results exist) */}
      {results && !loading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-b border-brand-cardBorder/80 pb-4">
          {/* Filter Pills */}
          <div className="inline-flex p-1 rounded-xl bg-brand-surface border border-brand-cardBorder text-xs font-semibold gap-1">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === "all" ? "bg-brand-card text-brand-text shadow-sm border border-brand-cardBorderHover" : "text-brand-muted hover:text-brand-text"
              }`}
            >
              All Posts ({stats.total})
            </button>
            <button
              onClick={() => setActiveFilter("india")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                activeFilter === "india" ? "bg-saffron/20 text-saffron shadow-sm border border-saffron/30" : "text-brand-muted hover:text-brand-text"
              }`}
            >
              <span>🇮🇳</span>
              <span>India Only ({stats.india})</span>
            </button>
            <button
              onClick={() => setActiveFilter("youtube")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                activeFilter === "youtube" ? "bg-red-500/20 text-red-400 shadow-sm border border-red-500/30" : "text-brand-muted hover:text-brand-text"
              }`}
            >
              <IconYouTube className="w-3.5 h-3.5 text-red-500" />
              <span>YouTube ({stats.yt})</span>
            </button>
            <button
              onClick={() => setActiveFilter("telegram")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                activeFilter === "telegram" ? "bg-sky-500/20 text-sky-400 shadow-sm border border-sky-500/30" : "text-brand-muted hover:text-brand-text"
              }`}
            >
              <IconTelegram className="w-3.5 h-3.5 text-sky-400" />
              <span>Telegram ({stats.tg})</span>
            </button>
          </div>

          {/* Active Query Tag */}
          <div className="text-xs text-brand-muted flex items-center gap-2">
            <span>Query:</span>
            <span className="font-semibold text-brand-text px-2 py-0.5 rounded bg-brand-card border border-brand-cardBorder">
              "{activeQuery}"
            </span>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <div className="bg-brand-surface/40 border border-brand-cardBorder rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-brand-cardBorder">
              <div className="w-6 h-6 rounded-lg shimmer" />
              <div className="w-32 h-5 rounded shimmer" />
            </div>
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
          <div className="bg-brand-surface/40 border border-brand-cardBorder rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-brand-cardBorder">
              <div className="w-6 h-6 rounded-lg shimmer" />
              <div className="w-32 h-5 rounded shimmer" />
            </div>
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-2">
          <h3 className="text-sm font-bold text-red-400">Connection or Fetch Error</h3>
          <p className="text-xs text-brand-muted">{error}</p>
          <button
            onClick={() => runSearch(activeQuery || keyword)}
            className="mt-2 px-4 py-1.5 bg-brand-card hover:bg-brand-surfaceHover border border-brand-cardBorder rounded-lg text-xs font-semibold text-brand-text"
          >
            Retry Search
          </button>
        </div>
      )}

      {/* Results Columns */}
      {!loading && results && (
        <main className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {displayedPlatforms.map((platformResult) => (
            <PlatformColumn
              key={platformResult.platform}
              platformResult={platformResult}
              activeFilter={activeFilter}
            />
          ))}
        </main>
      )}

      {/* Initial Empty State (before any search) */}
      {!loading && !results && !error && (
        <div className="py-16 text-center text-brand-muted space-y-4 border border-dashed border-brand-cardBorder rounded-3xl p-8 bg-brand-surface/20">
          <div className="w-14 h-14 rounded-2xl bg-brand-surface border border-brand-cardBorder mx-auto flex items-center justify-center text-saffron shadow-md">
            <IconSparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-brand-text">Ready to aggregate</h3>
            <p className="text-xs sm:text-sm text-brand-muted max-w-sm mx-auto">
              Type a topic above or pick one of the popular suggestions to fetch live results from YouTube and Telegram.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Render the application into DOM
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
