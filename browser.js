/**
 * TOKYO OS - Cyber Browser
 * A tabbed browser built on <iframe>. Each tab keeps its own history stack
 * (we can't read a cross-origin iframe's history, so back/forward walk ours).
 * Sites that forbid framing (X-Frame-Options / CSP frame-ancestors) are shown
 * as a "blocked" page with an "open in new tab" button instead of a blank frame.
 */

const HOME_URL = "tokyo://home";

// hosts known to refuse being framed → skip the blank iframe, show the fallback page
const FRAME_BLOCKED_HOSTS = [
  "google.com", "google.ge", "github.com", "bing.com", "facebook.com", "instagram.com",
  "x.com", "twitter.com", "linkedin.com", "reddit.com", "amazon.com", "netflix.com",
  "chatgpt.com", "openai.com", "claude.ai", "stackoverflow.com", "youtube.com",
];

const BOOKMARKS = {
  projects: [
    { title: "LVLUP Gaming Store", url: "https://lvlup-fawn.vercel.app/", icon: "🎮" },
    { title: "Strata Vault", url: "https://strata-vault-otlus2s0t-cercvadzee.vercel.app/", icon: "📈" },
    { title: "NEONDEV Portfolio", url: "https://cercvadzee07.github.io/NEONDEV/", icon: "⚡" },
  ],
  explore: [
    { title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Tokyo", icon: "📚" },
    { title: "ვიკიპედია", url: "https://ka.wikipedia.org/wiki/თბილისი", icon: "🇬🇪" },
    { title: "Tbilisi Map", url: "https://www.openstreetmap.org/export/embed.html?bbox=44.70,41.66,44.88,41.77&layer=mapnik", icon: "🗺️" },
    { title: "Lofi Radio", url: "https://www.youtube.com/embed/jfKfPfyJRdk", icon: "🎧" },
    { title: "example.com", url: "https://example.com/", icon: "🌐" },
  ],
};

/** turns what the user typed into a URL: a domain gets https://, anything else is a Wikipedia search */
function normalizeInput(raw) {
  const text = raw.trim();
  if (!text) return HOME_URL;
  if (text === HOME_URL) return text;
  if (/^https?:\/\//i.test(text)) return text;
  if (/^[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/.test(text)) return `https://${text}`;
  const wiki = currentLang === "GEO" ? "ka" : "en";
  return `https://${wiki}.wikipedia.org/w/index.php?search=${encodeURIComponent(text)}`;
}

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isFrameBlocked(url) {
  const host = hostOf(url);
  return FRAME_BLOCKED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`)) &&
    // youtube /embed/ pages are allowed in frames
    !/youtube\.com\/embed\//.test(url);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

class BrowserApp {
  constructor() {
    this.tabs = [];
    this.activeId = null;
    this.nextId = 1;

    this.tabList = document.getElementById("browser-tab-list");
    this.viewport = document.getElementById("browser-viewport");
    this.urlInput = document.getElementById("browser-url");
    this.ssl = document.getElementById("browser-ssl");
    this.external = document.getElementById("browser-external");
    this.hint = document.getElementById("browser-hint");
    this.hintLink = document.getElementById("browser-hint-link");
    this.loading = document.getElementById("browser-loading");
    if (!this.viewport) return;

    document.getElementById("browser-toolbar").addEventListener("submit", (e) => {
      e.preventDefault();
      this.navigate(normalizeInput(this.urlInput.value));
      this.urlInput.blur();
    });
    document.getElementById("browser-back").addEventListener("click", () => this.go(-1));
    document.getElementById("browser-forward").addEventListener("click", () => this.go(1));
    document.getElementById("browser-reload").addEventListener("click", () => this.reload());
    document.getElementById("browser-home").addEventListener("click", () => this.navigate(HOME_URL));
    document.getElementById("browser-tab-new").addEventListener("click", () => this.newTab());
    this.urlInput.addEventListener("focus", () => this.urlInput.select());

    // keyboard shortcuts while the browser window is focused
    document.getElementById("win-browser").addEventListener("keydown", (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === "t") { e.preventDefault(); this.newTab(); }
      if (key === "w") { e.preventDefault(); this.closeTab(this.activeId); }
      if (key === "l") { e.preventDefault(); this.urlInput.focus(); }
    });

    document.addEventListener("tokyo:lang", () => {
      this.tabs.filter((tab) => tab.url === HOME_URL).forEach((tab) => this.renderPage(tab));
      this.renderTabs();
    });

    this.newTab();
  }

  get active() {
    return this.tabs.find((tab) => tab.id === this.activeId);
  }

  newTab(url = HOME_URL) {
    const page = document.createElement("div");
    page.className = "browser-page";
    const tab = { id: this.nextId++, url, history: [url], index: 0, page, loading: false };
    this.tabs.push(tab);
    this.viewport.appendChild(page);
    this.renderPage(tab);
    this.activate(tab.id);
    if (url === HOME_URL) setTimeout(() => page.querySelector(".home-search")?.focus(), 0);
  }

  closeTab(id) {
    const idx = this.tabs.findIndex((tab) => tab.id === id);
    if (idx === -1) return;
    this.tabs[idx].page.remove();
    this.tabs.splice(idx, 1);
    if (!this.tabs.length) return this.newTab();
    if (this.activeId === id) this.activate(this.tabs[Math.max(0, idx - 1)].id);
    else this.renderTabs();
  }

  activate(id) {
    this.activeId = id;
    this.tabs.forEach((tab) => tab.page.classList.toggle("active", tab.id === id));
    this.renderTabs();
    this.syncToolbar();
  }

  navigate(url, { push = true } = {}) {
    const tab = this.active;
    if (!tab) return;
    audio.playClick();
    if (push) {
      tab.history = tab.history.slice(0, tab.index + 1);
      tab.history.push(url);
      tab.index = tab.history.length - 1;
    }
    tab.url = url;
    this.renderPage(tab);
    this.renderTabs();
    this.syncToolbar();
  }

  go(step) {
    const tab = this.active;
    if (!tab) return;
    const target = tab.index + step;
    if (target < 0 || target >= tab.history.length) return;
    tab.index = target;
    this.navigate(tab.history[target], { push: false });
  }

  reload() {
    const tab = this.active;
    if (tab) this.renderPage(tab);
  }

  /** builds the tab's content: home page, blocked page or a live iframe */
  renderPage(tab) {
    tab.page.replaceChildren();
    tab.loading = false;

    if (tab.url === HOME_URL) {
      tab.page.appendChild(this.buildHome());
      return;
    }

    if (isFrameBlocked(tab.url)) {
      tab.page.appendChild(this.buildBlocked(tab.url));
      return;
    }

    const frame = document.createElement("iframe");
    frame.className = "browser-frame";
    frame.src = tab.url;
    frame.referrerPolicy = "no-referrer";
    frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    // pages may run scripts and open their own popups, but can't navigate Tokyo OS itself
    frame.setAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation",
    );
    tab.loading = true;
    frame.addEventListener("load", () => {
      tab.loading = false;
      if (tab.id === this.activeId) this.syncToolbar();
    });
    tab.page.appendChild(frame);
  }

  buildHome() {
    const home = document.createElement("div");
    home.className = "browser-home";
    const tile = (b) => `
      <button type="button" class="home-tile" data-url="${escapeHtml(b.url)}">
        <span class="home-tile-icon">${b.icon}</span>
        <span class="home-tile-title">${escapeHtml(b.title)}</span>
        <span class="home-tile-host">${escapeHtml(hostOf(b.url))}</span>
      </button>`;
    home.innerHTML = `
      <h1 class="home-logo">&lt;NEON<span>DEV</span>&gt;</h1>
      <form class="home-search-form">
        <input class="home-search" type="text" autocomplete="off" spellcheck="false"
          placeholder="${escapeHtml(t("browser_search_ph"))}" />
      </form>
      <h4 class="home-section">${escapeHtml(t("browser_my_projects"))}</h4>
      <div class="home-grid">${BOOKMARKS.projects.map(tile).join("")}</div>
      <h4 class="home-section">${escapeHtml(t("browser_explore"))}</h4>
      <div class="home-grid">${BOOKMARKS.explore.map(tile).join("")}</div>`;

    home.querySelector(".home-search-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.navigate(normalizeInput(home.querySelector(".home-search").value));
    });
    home.querySelectorAll(".home-tile").forEach((btn) =>
      btn.addEventListener("click", () => this.navigate(btn.dataset.url)),
    );
    return home;
  }

  buildBlocked(url) {
    const box = document.createElement("div");
    box.className = "browser-blocked";
    box.innerHTML = `
      <div class="blocked-icon">⛔</div>
      <h3>${escapeHtml(t("browser_blocked_title"))}</h3>
      <p>${escapeHtml(t("browser_blocked_desc"))}</p>
      <code>${escapeHtml(hostOf(url))}</code>
      <a class="cyber-btn" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("browser_open_external"))}</a>`;
    return box;
  }

  renderTabs() {
    this.tabList.replaceChildren();
    this.tabs.forEach((tab) => {
      const el = document.createElement("div");
      el.className = `browser-tab ${tab.id === this.activeId ? "active" : ""}`;
      const title = tab.url === HOME_URL ? t("browser_new_tab") : hostOf(tab.url) || tab.url;
      el.innerHTML = `<span class="browser-tab-title"></span><button type="button" class="browser-tab-close" title="Close">×</button>`;
      el.querySelector(".browser-tab-title").textContent = title;
      el.title = tab.url === HOME_URL ? title : tab.url;
      el.addEventListener("click", () => this.activate(tab.id));
      el.querySelector(".browser-tab-close").addEventListener("click", (e) => {
        e.stopPropagation();
        this.closeTab(tab.id);
      });
      this.tabList.appendChild(el);
    });
  }

  syncToolbar() {
    const tab = this.active;
    if (!tab) return;
    const isHome = tab.url === HOME_URL;
    this.urlInput.value = isHome ? "" : tab.url;
    this.ssl.textContent = isHome ? "⌂" : tab.url.startsWith("https://") ? "🔒" : "⚠";
    document.getElementById("browser-back").disabled = tab.index === 0;
    document.getElementById("browser-forward").disabled = tab.index >= tab.history.length - 1;

    const framed = !isHome && !isFrameBlocked(tab.url);
    this.external.href = isHome ? "#" : tab.url;
    this.external.classList.toggle("disabled", isHome);
    this.hint.classList.toggle("hidden", !framed);
    if (framed) this.hintLink.href = tab.url;
    this.loading.classList.toggle("active", tab.loading);
  }
}

window.browserApp = new BrowserApp();
