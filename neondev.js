/**
 * TOKYO OS — NEONDEV skin
 * Loaded after kernel.js / browser.js / linux.js. It doesn't change how the
 * apps work; it only re-skins the pieces those scripts draw themselves
 * (taskbar icons, charts, file icons, browser home tiles, xterm colours)
 * and adds the brand layer: code-texture background, clock widget, boot
 * splash and glitch-in window animation.
 */
(() => {
  const ND = {
    sky: "#7DD3FC",
    indigo: "#A5B4FC",
    lavender: "#C4B5FD",
    lime: "#A3E635",
    bg: "#080A12",
    panel: "#11131C",
    border: "#2A3045",
    body: "#C9D1E4",
    muted: "#8A93A8",
    dim: "#525A6E",
  };
  const icon = (name) => `<svg><use href="#i-${name}"/></svg>`;
  const isPhone = () => window.matchMedia("(max-width: 700px)").matches;

  /* ---------- 0. phones start on the home screen, not inside the terminal ---------- */
  if (isPhone() && window.windowManager) {
    const term = window.windowManager.windows.terminal;
    if (term && !term.element.classList.contains("hidden")) {
      term.element.classList.add("hidden");
      term.element.classList.remove("active-window");
    }
  }

  /* ---------- 1. boot splash ---------- */
  const splash = document.getElementById("nd-splash");
  if (splash) {
    let seen = false;
    try {
      seen = sessionStorage.getItem("nd_booted") === "1";
    } catch (_) {}
    const hide = () => {
      splash.classList.add("done");
      try {
        sessionStorage.setItem("nd_booted", "1");
      } catch (_) {}
    };
    if (seen) {
      splash.style.transition = "none";
      hide();
    } else {
      setTimeout(hide, 1700);
      splash.addEventListener("click", hide);
    }
  }

  /* ---------- 2. background: faint drifting code ---------- */
  const SNIPPETS = [
    "const app = createApp({ ship: true });",
    "export default function Page() {",
    "await deploy('vercel', { prod: true })",
    "git commit -m \"feat: build, ship, repeat\"",
    "useStore((s) => s.windows)",
    "<Window title=\"terminal\" />",
    "ctx.drawImage(frame, 0, 0);",
    "npm run build && npm run start",
    "type Props = { children: ReactNode }",
    "osc.frequency.setValueAtTime(440, t)",
    "if (!user) return redirect('/login')",
    "SELECT * FROM projects WHERE live = 1;",
    "transition: all .3s cubic-bezier(.16,1,.3,1)",
    "v86.serial0_send('uname -a\\n')",
    "// every pixel is code",
    "return <Hero cta=\"START\" />;",
    "fetch('/api/status').then(r => r.json())",
    "@apply rounded-2xl backdrop-blur",
  ];

  // Drawn once (and again after a resize), not animated: a moving canvas under
  // the windows forced the browser to repaint the whole screen every frame.
  class CodeTexture {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      let t;
      window.addEventListener("resize", () => {
        clearTimeout(t);
        t = setTimeout(() => this.draw(), 200);
      });
      this.draw();
      // redraw once web fonts are ready so the snippets use JetBrains Mono
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => this.draw());
    }

    draw() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      const { ctx } = this;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.textBaseline = "top";
      // deterministic layout so it doesn't jump around on resize
      let seed = 7;
      const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
      const count = Math.round((w * h) / 52000);
      for (let i = 0; i < count; i++) {
        const size = 11 + ((rnd() * 3) | 0);
        ctx.font = `${size}px "JetBrains Mono", "DejaVu Sans Mono", monospace`;
        ctx.fillStyle = `rgba(165, 180, 252, ${0.035 + rnd() * 0.05})`;
        ctx.fillText(SNIPPETS[(rnd() * SNIPPETS.length) | 0], rnd() * w * 0.85, rnd() * h);
      }
    }
  }
  const bgCanvas = document.getElementById("nd-canvas");
  if (bgCanvas) window.ndTexture = new CodeTexture(bgCanvas);

  /* ---------- 3. clock widget ---------- */
  const timeEl = document.getElementById("nd-time");
  const dateEl = document.getElementById("nd-date");
  const tickWidget = () => {
    const now = new Date();
    if (timeEl)
      timeEl.textContent = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    if (dateEl) {
      const loc = typeof currentLang !== "undefined" && currentLang === "GEO" ? "ka-GE" : "en-GB";
      dateEl.textContent = now.toLocaleDateString(loc, { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
    }
  };
  tickWidget();
  setInterval(tickWidget, 5000);

  /* ---------- 4. window manager: SVG taskbar icons + glitch-in ---------- */
  if (typeof WindowManager !== "undefined") {
    const origUpdate = WindowManager.prototype.updateTaskbar;
    WindowManager.prototype.updateTaskbar = function () {
      origUpdate.call(this);
      const open = Object.keys(this.windows).filter(
        (k) => !this.windows[k].element.classList.contains("hidden"),
      );
      document.querySelectorAll("#running-apps .task-item").forEach((el, i) => {
        const ic = el.querySelector(".task-icon");
        if (ic && open[i]) {
          ic.removeAttribute("style");
          ic.innerHTML = icon(open[i]);
        }
      });
    };
    if (window.windowManager) window.windowManager.updateTaskbar();
  }

  document.addEventListener("window:opened", (e) => {
    const win = document.getElementById(`win-${e.detail}`);
    if (!win) return;
    win.classList.remove("nd-open");
    void win.offsetWidth; // restart the animation
    win.classList.add("nd-open");
    setTimeout(() => win.classList.remove("nd-open"), 520);
  });

  /* ---------- 5. system monitor: gradient line + soft fill ---------- */
  if (typeof SystemMonitorApp !== "undefined") {
    SystemMonitorApp.prototype.drawChart = function (canvas, history) {
      const ctx = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // faint baseline grid
      ctx.strokeStyle = "rgba(42, 48, 69, 0.7)";
      ctx.lineWidth = 1;
      [0.33, 0.66].forEach((p) => {
        ctx.beginPath();
        ctx.moveTo(0, Math.round(h * p) + 0.5);
        ctx.lineTo(w, Math.round(h * p) + 0.5);
        ctx.stroke();
      });

      const step = w / (history.length - 1);
      const pts = history.map((v, i) => [i * step, h - 4 - (v / 100) * (h - 8)]);

      const path = new Path2D();
      pts.forEach(([x, y], i) => (i ? path.lineTo(x, y) : path.moveTo(x, y)));

      const fill = new Path2D(path);
      fill.lineTo(w, h);
      fill.lineTo(0, h);
      fill.closePath();
      const fg = ctx.createLinearGradient(0, 0, 0, h);
      fg.addColorStop(0, "rgba(165, 180, 252, 0.22)");
      fg.addColorStop(1, "rgba(165, 180, 252, 0)");
      ctx.fillStyle = fg;
      ctx.fill(fill);

      const lg = ctx.createLinearGradient(0, 0, w, 0);
      lg.addColorStop(0, ND.sky);
      lg.addColorStop(0.5, ND.indigo);
      lg.addColorStop(1, ND.lavender);
      ctx.strokeStyle = lg;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.stroke(path);

      const [lx, ly] = pts[pts.length - 1];
      ctx.fillStyle = ND.lavender;
      ctx.beginPath();
      ctx.arc(lx - 3, ly, 3, 0, Math.PI * 2);
      ctx.fill();
    };
  }

  /* ---------- 6. file explorer: SVG file icons ---------- */
  if (typeof FileExplorerApp !== "undefined") {
    const origInit = FileExplorerApp.prototype.init;
    FileExplorerApp.prototype.init = function () {
      origInit.call(this);
      if (!this.fileListEl) return;
      this.fileListEl.querySelectorAll(".file-item").forEach((el) => {
        const first = el.querySelector("span");
        if (first) first.outerHTML = icon("file");
        const name = el.querySelector("span");
        if (name) name.removeAttribute("style");
      });
    };
    if (window.fileExplorerApp) window.fileExplorerApp.init();
  }

  /* ---------- 7. sound button: SVG instead of emoji ---------- */
  if (typeof audio !== "undefined") {
    const sfxBtn = document.getElementById("sfx-btn");
    const paint = () => {
      if (sfxBtn) sfxBtn.innerHTML = icon(audio.muted ? "mute" : "sound");
    };
    const origToggle = audio.toggleMute.bind(audio);
    audio.toggleMute = () => {
      origToggle();
      paint();
    };
    paint();
  }

  /* ---------- 8. browser home: monogram tiles, clean wordmark ---------- */
  const decorateHome = (home) => {
    const logo = home.querySelector(".home-logo");
    if (logo) logo.innerHTML = "NEON<span>DEV</span>";
    home.querySelectorAll(".home-tile").forEach((tile) => {
      const ic = tile.querySelector(".home-tile-icon");
      const title = tile.querySelector(".home-tile-title");
      if (ic && title) ic.innerHTML = `<b>${(title.textContent.trim()[0] || "•").toUpperCase()}</b>`;
    });
    return home;
  };
  if (typeof BrowserApp !== "undefined") {
    const origHome = BrowserApp.prototype.buildHome;
    BrowserApp.prototype.buildHome = function () {
      return decorateHome(origHome.call(this));
    };
    document.querySelectorAll(".browser-home").forEach(decorateHome);
  }

  /* ---------- 9. Linux terminal: NEONDEV xterm palette ---------- */
  if (typeof LinuxTerminalApp !== "undefined") {
    // Opened straight from disk (file://), the browser refuses to read the
    // local Linux image, so the boot can never succeed — say so clearly.
    const origBoot = LinuxTerminalApp.prototype.boot;
    LinuxTerminalApp.prototype.boot = function () {
      if (location.protocol === "file:") {
        const geo = typeof currentLang !== "undefined" && currentLang === "GEO";
        this.setProgress(
          geo
            ? "Linux ფაილიდან ვერ ჩაირთვება — გახსენი GitHub Pages-ზე ან VS Code Live Server-ით."
            : "Linux can't boot from a local file — open it on GitHub Pages or with VS Code Live Server.",
          0,
        );
        return;
      }
      // phones: never auto-boot when the app opens — wait for the button
      if (isPhone() && !this._ndUserBoot) return;
      this._ndUserBoot = false;
      return origBoot.call(this);
    };
    document.addEventListener(
      "click",
      (e) => {
        if (e.target.closest && e.target.closest("#linux-boot-btn") && window.linuxTerminalApp)
          window.linuxTerminalApp._ndUserBoot = true;
      },
      true, // capture: runs before the button's own handler
    );

    const origCreate = LinuxTerminalApp.prototype.createTerminal;
    LinuxTerminalApp.prototype.createTerminal = function () {
      origCreate.call(this);
      if (!this.term) return;
      this.term.options.fontFamily = '"JetBrains Mono", "Cascadia Mono", Consolas, monospace';
      this.term.options.fontSize = 13;
      this.term.options.lineHeight = 1.2;
      this.term.options.cursorStyle = "bar";
      this.term.options.theme = {
        background: "#06080E",
        foreground: ND.body,
        cursor: ND.indigo,
        cursorAccent: ND.bg,
        selectionBackground: "rgba(165, 180, 252, 0.28)",
        black: ND.panel,
        brightBlack: ND.dim,
        red: "#E4A8C8",
        brightRed: "#F0C4DC",
        green: ND.lime,
        brightGreen: "#BEF264",
        yellow: "#E9E3B0",
        brightYellow: "#F4F0CF",
        blue: ND.sky,
        brightBlue: "#BAE6FD",
        magenta: ND.lavender,
        brightMagenta: "#DDD6FE",
        cyan: ND.indigo,
        brightCyan: "#C7D2FE",
        white: ND.body,
        brightWhite: "#FFFFFF",
      };
      if (this.fitTerminal) this.fitTerminal();
    };
  }
})();
