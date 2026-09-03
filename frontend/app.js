// Point this at your running FastAPI backend.
const API_BASE_URL = "http://127.0.0.1:8000";

const form = document.getElementById("search-form");
const input = document.getElementById("keyword-input");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const submitBtn = form.querySelector("button[type='submit']");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const keyword = input.value.trim();
  if (!keyword) return;
  await runSearch(keyword);
});

async function runSearch(keyword) {
  resultsEl.innerHTML = "";
  showLoader(keyword);
  setLoadingState(true);

  try {
    const res = await fetch(`${API_BASE_URL}/api/search?keyword=${encodeURIComponent(keyword)}`);
    if (!res.ok) throw new Error(`Server responded with ${res.status}`);
    const data = await res.json();
    clearStatus();
    renderResults(data);
  } catch (err) {
    showError(`Something went wrong: ${err.message}`);
  } finally {
    setLoadingState(false);
  }
}

function showLoader(keyword) {
  statusEl.innerHTML = `
    <div class="loader-wrapper" role="status" aria-live="polite">
      <div class="spinner"></div>
      <p class="loader-text">Searching for "<strong>${escapeHtml(keyword)}</strong>" across YouTube &amp; Telegram...</p>
    </div>
  `;
}

function clearStatus() {
  statusEl.innerHTML = "";
}

function showError(message) {
  statusEl.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
}

function setLoadingState(isLoading) {
  if (submitBtn) {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "Searching..." : "Search";
  }
  if (input) {
    input.disabled = isLoading;
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderResults(data) {
  resultsEl.innerHTML = "";
  if (!data || !data.results || data.results.length === 0) {
    statusEl.innerHTML = `<div class="empty">No results found.</div>`;
    return;
  }

  data.results.forEach((platformResult, colIndex) => {
    resultsEl.appendChild(renderPlatformColumn(platformResult, colIndex));
  });
}

function renderPlatformColumn(platformResult, colIndex = 0) {
  const col = document.createElement("section");
  col.className = "platform-col";
  col.style.animationDelay = `${colIndex * 0.1}s`;

  const heading = document.createElement("h2");
  heading.textContent = platformResult.platform;
  col.appendChild(heading);

  if (platformResult.error) {
    const err = document.createElement("div");
    err.className = "error";
    err.textContent = `Error: ${platformResult.error}`;
    col.appendChild(err);
    return col;
  }

  const totalPosts = platformResult.india_posts.length + platformResult.other_posts.length;
  if (totalPosts === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No posts found.";
    col.appendChild(empty);
    return col;
  }

  let postIndex = 0;

  if (platformResult.india_posts.length > 0) {
    col.appendChild(makeLabel("🇮🇳 India"));
    platformResult.india_posts.forEach((p) => {
      col.appendChild(makePostCard(p, true, postIndex++));
    });
  }

  if (platformResult.other_posts.length > 0) {
    col.appendChild(makeLabel("Other posts"));
    platformResult.other_posts.forEach((p) => {
      col.appendChild(makePostCard(p, false, postIndex++));
    });
  }

  return col;
}

function makeLabel(text) {
  const el = document.createElement("div");
  el.className = "section-label";
  el.textContent = text;
  return el;
}

function makePostCard(post, isIndia, postIndex = 0) {
  const a = document.createElement("a");
  a.className = "post";
  a.href = post.url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.style.animationDelay = `${Math.min(postIndex * 0.04, 0.4)}s`;

  const title = document.createElement("div");
  title.className = "post-title";
  if (isIndia) {
    const badge = document.createElement("span");
    badge.className = "badge-india";
    badge.textContent = "IN";
    title.appendChild(badge);
  }
  title.appendChild(document.createTextNode(post.title));

  const meta = document.createElement("div");
  meta.className = "post-meta";
  meta.textContent = post.author || "";

  a.appendChild(title);
  a.appendChild(meta);
  return a;
}
