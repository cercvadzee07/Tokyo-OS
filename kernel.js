/**
 * TOKYO OS - Web Operating System
 * Architecture:
 * 1. Localization Dictionary & Engine (i18n)
 * 2. Procedural Web Audio API Engine
 * 3. Matrix Digital Rain Canvas Engine
 * 4. Window Manager Engine (With Taskbar App Logos)
 * 5. Interactive Native Applications
 * 6. System Core & Event Listeners
 */

/* ==========================================================================
   1. LOCALIZATION DICTIONARY & ENGINE (GEO / ENG)
   ========================================================================== */
const I18N = {
  GEO: {
    app_terminal: "ტერმინალი",
    app_browser: "კიბერ ბრაუზერი",
    app_monitor: "მონიტორი",
    app_explorer: "ფაილები",
    app_synth: "ლო-ფაი სინთი",
    browser_hero_sub: "Senior Creative Frontend Engineer // Cyber Architect",
    card_1_title: "ტოკიო OS",
    card_1_desc:
      "Vanilla JS, CSS3, Web Audio API-ზე აგებული კიბერ ოპერაციული სისტემა.",
    card_2_title: "აუდიო სინთი",
    card_2_desc:
      "ტალღოვანი სიხშირეების გენერატორი რეალურ დროში, გარე ფაილების გარეშე.",
    card_3_title: "ლოკალიზაცია",
    card_3_desc:
      "სრული ორენოვანი გარემო (ქართული და ინგლისური) დინამიკური გადართვით.",
    metric_cpu: "პროცესორის დატვირთვა (CPU)",
    metric_ram: "ოპერატიული მეხსიერება (RAM)",
    metric_net: "ქსელური ტელემეტრია (NET)",
    synth_play: "▶ ჩართვა",
    synth_stop: "⏹ გაჩერება",
    synth_desc:
      "პროცედურული ატმოსფერული აკორდები (Cmaj7 • Am7 • Dm7 • G7) Web Audio ოსცილატორებით.",
    welcome_term:
      "მოგესალმებათ Tokyo OS [ვერსია 2.0.4]\nბრძანებების სანახავად აკრიფეთ 'help' ან 'დახმარება'.\n",
    help_text: `ხელმისაწვდომი ბრძანებები:
  help / დახმარება    - ბრძანებების სია
  neofetch            - სისტემის ინფორმაცია
  matrix              - მატრიცის ეფექტის გადართვა
  theme [tokyo|cyberpunk|matrix] - თემის შეცვლა
  lang [geo|eng]      - ენის შეცვლა
  clear               - ეკრანის გასუფთავება
  date                - მიმდინარე დრო
  reboot              - სისტემის გადატვირთვა`,
  },
  ENG: {
    app_terminal: "Terminal",
    app_browser: "Cyber Browser",
    app_monitor: "Monitor",
    app_explorer: "File Explorer",
    app_synth: "Lo-Fi Synth",
    browser_hero_sub: "Senior Creative Frontend Engineer // Cyber Architect",
    card_1_title: "Tokyo OS",
    card_1_desc: "Cyber OS built with Vanilla JS, modern CSS3 & Web Audio API.",
    card_2_title: "Audio Synth",
    card_2_desc:
      "Real-time polyphonic ambient frequency generator with zero audio files.",
    card_3_title: "Localization",
    card_3_desc:
      "Full bilingual engine (Georgian & English) with dynamic instant toggling.",
    metric_cpu: "Processor Load (CPU)",
    metric_ram: "Memory Usage (RAM)",
    metric_net: "Network Telemetry (NET)",
    synth_play: "▶ Play",
    synth_stop: "⏹ Stop",
    synth_desc:
      "Procedural ambient chord progressions (Cmaj7 • Am7 • Dm7 • G7) via Web Audio oscillators.",
    welcome_term:
      "Welcome to Tokyo OS [Version 2.0.4]\nType 'help' or 'დახმარება' to view available commands.\n",
    help_text: `Available system commands:
  help / დახმარება    - Display this command list
  neofetch            - Show system specifications & badge
  matrix              - Toggle matrix digital rain speed
  theme [tokyo|cyberpunk|matrix] - Switch color theme
  lang [geo|eng]      - Change system language
  clear               - Clear terminal output
  date                - Display current timestamp
  reboot              - Soft reboot the system`,
  },
};

let currentLang = localStorage.getItem("tokyo_lang") || "GEO";

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("tokyo_lang", lang);
  const langLabel = document.getElementById("lang-label");
  if (langLabel) langLabel.textContent = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (I18N[lang] && I18N[lang][key]) {
      el.textContent = I18N[lang][key];
    }
  });

  if (window.windowManager) {
    window.windowManager.updateTaskbar();
  }
}

/* ==========================================================================
   2. PROCEDURAL WEB AUDIO ENGINE
   ========================================================================== */
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playHover() {
    if (this.muted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        1800,
        this.ctx.currentTime + 0.04,
      );
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + 0.04,
      );
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (_) {}
  }

  playClick() {
    if (this.muted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        60,
        this.ctx.currentTime + 0.06,
      );
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + 0.06,
      );
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (_) {}
  }

  playWindowOpen() {
    if (this.muted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        440,
        this.ctx.currentTime + 0.12,
      );
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + 0.12,
      );
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (_) {}
  }

  playKeypress(charCode) {
    if (this.muted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const freq = 200 + ((charCode || 65) % 40) * 16;
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + 0.03,
      );
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch (_) {}
  }

  toggleMute() {
    this.muted = !this.muted;
    const sfxBtn = document.getElementById("sfx-btn");
    if (sfxBtn) sfxBtn.textContent = this.muted ? "🔇" : "🔊";
  }
}

const audio = new AudioEngine();

/* ==========================================================================
   3. MATRIX DIGITAL RAIN CANVAS ENGINE
   ========================================================================== */
class MatrixEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.characters =
      "01010101アイウエオカキクケコサシスセソタチツテトNEONDEV{}[]<>$#@";
    this.fontSize = 14;
    this.drops = [];
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.render = this.render.bind(this);
    requestAnimationFrame(this.render);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    const columns = Math.floor(this.canvas.width / this.fontSize);
    this.drops = [];
    for (let i = 0; i < columns; i++) {
      this.drops[i] = Math.floor(Math.random() * -50);
    }
  }

  render() {
    this.ctx.fillStyle = "rgba(15, 17, 26, 0.15)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const theme =
      document.documentElement.getAttribute("data-theme") || "tokyo";
    let textColor = "#7dcfff";
    if (theme === "cyberpunk") textColor = "#00f0ff";
    if (theme === "matrix") textColor = "#00ff66";

    this.ctx.fillStyle = textColor;
    this.ctx.font = `${this.fontSize}px monospace`;

    for (let i = 0; i < this.drops.length; i++) {
      const text = this.characters.charAt(
        Math.floor(Math.random() * this.characters.length),
      );
      const x = i * this.fontSize;
      const y = this.drops[i] * this.fontSize;

      this.ctx.fillText(text, x, y);

      if (y > this.canvas.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }
      this.drops[i]++;
    }
    requestAnimationFrame(this.render);
  }
}

/* ==========================================================================
   4. WINDOW MANAGEMENT ENGINE (WITH EMBEDDED LOGOS)
   ========================================================================== */
class WindowManager {
  constructor() {
    this.windows = {};
    this.topZ = 100;
    this.initWindows();
  }

  initWindows() {
    document.querySelectorAll(".cyber-window").forEach((win) => {
      const id = win.id.replace("win-", "");
      this.windows[id] = {
        element: win,
        isMaximized: false,
        prevBounds: null,
      };

      const header = win.querySelector(".window-header");
      this.makeDraggable(win, header);

      const resizer = win.querySelector(".win-resizer");
      if (resizer) this.makeResizable(win, resizer);

      const closeBtn = win.querySelector(".win-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.closeWindow(id);
        });
      }

      const minBtn = win.querySelector(".win-min");
      if (minBtn) {
        minBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.minimizeWindow(id);
        });
      }

      const maxBtn = win.querySelector(".win-max");
      if (maxBtn) {
        maxBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggleMaximize(id);
        });
      }

      win.addEventListener("mousedown", () => this.bringToFront(id));
    });
  }

  bringToFront(id) {
    const winObj = this.windows[id];
    if (!winObj) return;
    this.topZ += 2;
    winObj.element.style.zIndex = this.topZ;
    document
      .querySelectorAll(".cyber-window")
      .forEach((w) => w.classList.remove("active-window"));
    winObj.element.classList.add("active-window");
    this.updateTaskbar();
  }

  openWindow(id) {
    const winObj = this.windows[id];
    if (!winObj) return;
    audio.playWindowOpen();
    winObj.element.classList.remove("hidden");
    this.bringToFront(id);
  }

  closeWindow(id) {
    const winObj = this.windows[id];
    if (!winObj) return;
    audio.playClick();
    winObj.element.classList.add("hidden");
    this.updateTaskbar();
  }

  minimizeWindow(id) {
    const winObj = this.windows[id];
    if (!winObj) return;
    audio.playClick();
    winObj.element.classList.add("hidden");
    this.updateTaskbar();
  }

  toggleMaximize(id) {
    const winObj = this.windows[id];
    if (!winObj) return;
    audio.playClick();
    if (winObj.isMaximized) {
      winObj.element.classList.remove("maximized");
      if (winObj.prevBounds) {
        winObj.element.style.top = winObj.prevBounds.top;
        winObj.element.style.left = winObj.prevBounds.left;
        winObj.element.style.width = winObj.prevBounds.width;
        winObj.element.style.height = winObj.prevBounds.height;
      }
      winObj.isMaximized = false;
    } else {
      winObj.prevBounds = {
        top: winObj.element.style.top,
        left: winObj.element.style.left,
        width: winObj.element.style.width,
        height: winObj.element.style.height,
      };
      winObj.element.classList.add("maximized");
      winObj.isMaximized = true;
    }
  }

  makeDraggable(win, header) {
    let isDragging = false;
    let startX, startY, initX, initY;

    header.addEventListener("mousedown", (e) => {
      if (win.classList.contains("maximized")) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initX = win.offsetLeft;
      initY = win.offsetTop;
      this.bringToFront(win.id.replace("win-", ""));

      const onMouseMove = (moveEvent) => {
        if (!isDragging) return;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        const boundedX = Math.max(
          0,
          Math.min(window.innerWidth - 60, initX + dx),
        );
        const boundedY = Math.max(
          0,
          Math.min(window.innerHeight - 80, initY + dy),
        );
        win.style.left = `${boundedX}px`;
        win.style.top = `${boundedY}px`;
      };

      const onMouseUp = () => {
        isDragging = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  }

  makeResizable(win, resizer) {
    let isResizing = false;
    let startX, startY, initW, initH;

    resizer.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      initW = win.offsetWidth;
      initH = win.offsetHeight;
      this.bringToFront(win.id.replace("win-", ""));

      const onMouseMove = (moveEvent) => {
        if (!isResizing) return;
        const w = Math.max(320, initW + (moveEvent.clientX - startX));
        const h = Math.max(200, initH + (moveEvent.clientY - startY));
        win.style.width = `${w}px`;
        win.style.height = `${h}px`;
      };

      const onMouseUp = () => {
        isResizing = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  }

  updateTaskbar() {
    const runningContainer = document.getElementById("running-apps");
    if (!runningContainer) return;
    runningContainer.innerHTML = "";

    const appIcons = {
      terminal: { icon: ">_", color: "var(--neon-green)" },
      browser: { icon: "🌐", color: "var(--neon-cyan)" },
      monitor: { icon: "📊", color: "var(--neon-violet)" },
      explorer: { icon: "📁", color: "#e0af68" },
      synth: { icon: "🎛️", color: "var(--neon-magenta)" },
    };

    Object.keys(this.windows).forEach((appKey) => {
      const win = this.windows[appKey].element;
      const isVisible = !win.classList.contains("hidden");
      const isActive = win.classList.contains("active-window");

      if (isVisible) {
        const task = document.createElement("button");
        task.className = `task-item ${isActive ? "active" : ""}`;

        const appData = appIcons[appKey] || { icon: "⚙️", color: "#fff" };
        const label =
          (I18N[currentLang] && I18N[currentLang][`app_${appKey}`]) || appKey;

        task.innerHTML = `
          <span class="task-icon" style="color: ${appData.color}; font-weight: bold; font-family: var(--font-mono); margin-right: 6px;">${appData.icon}</span>
          <span class="task-label">${label}</span>
        `;

        task.addEventListener("click", () => {
          audio.playClick();
          if (isActive) {
            this.minimizeWindow(appKey);
          } else {
            this.bringToFront(appKey);
          }
        });

        task.addEventListener("mouseenter", () => {
          const ring = document.getElementById("cursor-ring");
          if (ring) ring.classList.add("cursor-hover");
          audio.playHover();
        });
        task.addEventListener("mouseleave", () => {
          const ring = document.getElementById("cursor-ring");
          if (ring) ring.classList.remove("cursor-hover");
        });

        runningContainer.appendChild(task);
      }
    });
  }
}

/* ==========================================================================
   5. NATIVE CYBER APPS
   ========================================================================== */
class TerminalApp {
  constructor() {
    this.output = document.getElementById("terminal-output");
    this.input = document.getElementById("terminal-input");
    this.init();
  }

  init() {
    if (!this.input || !this.output) return;
    this.print(I18N[currentLang].welcome_term, "output-sys");

    this.input.addEventListener("keydown", (e) => {
      audio.playKeypress(e.key.charCodeAt(0));
      if (e.key === "Enter") {
        const val = this.input.value.trim();
        this.input.value = "";
        this.execute(val);
      }
    });
  }

  print(text, className = "output-info") {
    const line = document.createElement("div");
    line.className = `terminal-line ${className}`;
    line.textContent = text;
    this.output.appendChild(line);
    this.output.scrollTop = this.output.scrollHeight;
  }

  execute(raw) {
    if (!raw) return;
    this.print(`guest@tokyo-night:~$ ${raw}`, "output-info");
    const args = raw.split(" ");
    const cmd = args[0].toLowerCase();

    switch (cmd) {
      case "help":
      case "დახმარება":
        this.print(I18N[currentLang].help_text, "output-sys");
        break;
      case "clear":
        this.output.innerHTML = "";
        break;
      case "date":
        this.print(new Date().toString(), "output-sys");
        break;
      case "neofetch":
        this.print(
          `
    ███╗   ██╗███████╗ ██████╗ ███╗   ██╗
    ████╗  ██║██╔════╝██╔═══██╗████╗  ██║
    ██╔██╗ ██║█████╗  ██║   ██║██╔██╗ ██║
    ██║╚██╗██║██╔══╝  ██║   ██║██║╚██╗██║
    ██║ ╚████║███████╗╚██████╔╝██║ ╚████║
    OS: Tokyo OS v2.0.4 x86_64
    Host: NEONDEV Station
    Kernel: 5.19.0-cyber
        `,
          "output-ascii",
        );
        break;
      case "theme":
        if (["tokyo", "cyberpunk", "matrix"].includes(args[1])) {
          setTheme(args[1]);
          this.print(`Theme switched to ${args[1]}`, "output-sys");
        } else {
          this.print("Usage: theme [tokyo | cyberpunk | matrix]", "output-err");
        }
        break;
      case "lang":
        if (["geo", "eng"].includes(args[1])) {
          applyLanguage(args[1].toUpperCase());
          this.print(
            `Language switched to ${args[1].toUpperCase()}`,
            "output-sys",
          );
        } else {
          this.print("Usage: lang [geo | eng]", "output-err");
        }
        break;
      case "reboot":
        this.print("Rebooting Tokyo OS...", "output-err");
        setTimeout(() => location.reload(), 800);
        break;
      default:
        this.print(
          `Unknown command: '${cmd}'. Type 'help' for commands.`,
          "output-err",
        );
    }
  }
}

class SystemMonitorApp {
  constructor() {
    this.cpuCanvas = document.getElementById("cpu-chart");
    this.ramCanvas = document.getElementById("ram-chart");
    this.netCanvas = document.getElementById("net-chart");

    this.cpuHistory = new Array(25).fill(25);
    this.ramHistory = new Array(25).fill(35);
    this.netHistory = new Array(25).fill(15);

    setInterval(() => this.tick(), 1000);
  }

  tick() {
    if (!this.cpuCanvas) return;
    const cpu = Math.floor(15 + Math.random() * 65);
    const ram = Math.floor(40 + Math.random() * 20);
    const net = Math.floor(20 + Math.random() * 80);

    const cpuEl = document.getElementById("cpu-val");
    const ramEl = document.getElementById("ram-val");
    const netEl = document.getElementById("net-val");

    if (cpuEl) cpuEl.textContent = `${cpu}%`;
    if (ramEl) ramEl.textContent = `${(ram / 10).toFixed(1)} / 16 GB`;
    if (netEl) netEl.textContent = `${net * 5} KB/s`;

    this.cpuHistory.shift();
    this.cpuHistory.push(cpu);
    this.ramHistory.shift();
    this.ramHistory.push(ram);
    this.netHistory.shift();
    this.netHistory.push(net);

    this.drawChart(this.cpuCanvas, this.cpuHistory, "#7dcfff");
    this.drawChart(this.ramCanvas, this.ramHistory, "#bb9af7");
    this.drawChart(this.netCanvas, this.netHistory, "#9ece6a");
  }

  drawChart(canvas, history, color) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const step = w / (history.length - 1);
    history.forEach((val, i) => {
      const y = h - (val / 100) * h;
      if (i === 0) ctx.moveTo(0, y);
      else ctx.lineTo(i * step, y);
    });

    ctx.stroke();
  }
}

class FileExplorerApp {
  constructor() {
    this.files = {
      "readme.txt": {
        GEO: "Tokyo OS - შექმნილია NEONDEV-ის მიერ.\n\nეს არის მაღალტექნოლოგიური ვებ-ოპერაციული სისტემა,\nრომელიც აგებულია სუფთა ტექნოლოგიებზე (Vanilla JS & Modern CSS).\nსისტემა აღჭურვილია რეალური აუდიო სინთეზითა და სრული ლოკალიზაციით.",
        ENG: "Tokyo OS - Built by NEONDEV.\n\nA high-performance cyber desktop environment created\nusing pure web primitives (Vanilla JS & Modern CSS).\nEquipped with procedural Web Audio synthesis and complete localization.",
      },
      "projects.json": {
        GEO: '[\n  {\n    "title": "Tokyo OS",\n    "type": "Web OS",\n    "stack": ["HTML5", "CSS3", "Vanilla JS"]\n  }\n]',
        ENG: '[\n  {\n    "title": "Tokyo OS",\n    "type": "Web OS",\n    "stack": ["HTML5", "CSS3", "Vanilla JS"]\n  }\n]',
      },
      "sys_kernel.log": {
        GEO: "[0.001] ბირთვი წარმატებით ჩაიტვირთა\n[0.024] აუდიო კონტექსტი მზადყოფნაშია\n[STATUS] სისტემა სტაბილურია (60 FPS)",
        ENG: "[0.001] Kernel booted successfully\n[0.024] Web Audio context initialized\n[STATUS] System running at optimal 60 FPS",
      },
    };

    this.fileListEl = document.getElementById("file-list");
    this.previewFilename = document.getElementById("preview-filename");
    this.previewText = document.getElementById("preview-text");
    this.init();
  }

  init() {
    if (!this.fileListEl) return;
    this.fileListEl.innerHTML = "";
    Object.keys(this.files).forEach((filename, idx) => {
      const item = document.createElement("div");
      item.className = `file-item ${idx === 0 ? "selected" : ""}`;
      item.innerHTML = `<span style="font-size:20px;">📄</span><span style="font-size:11px;">${filename}</span>`;
      item.addEventListener("click", () => {
        audio.playClick();
        document
          .querySelectorAll(".file-item")
          .forEach((f) => f.classList.remove("selected"));
        item.classList.add("selected");
        this.preview(filename);
      });
      this.fileListEl.appendChild(item);
    });

    this.preview("readme.txt");
  }

  preview(filename) {
    if (!this.previewFilename || !this.previewText) return;
    this.previewFilename.textContent = filename;
    this.previewText.textContent =
      this.files[filename][currentLang] || this.files[filename]["ENG"];
  }
}

class SynthApp {
  constructor() {
    this.isPlaying = false;
    this.timer = null;
    this.currentChord = 0;
    this.chords = [
      { name: "Cmaj7", freqs: [261.63, 329.63, 392.0, 493.88] },
      { name: "Am7", freqs: [220.0, 261.63, 329.63, 392.0] },
      { name: "Dm7", freqs: [293.66, 349.23, 440.0, 523.25] },
      { name: "G7", freqs: [196.0, 246.94, 293.66, 349.23] },
    ];

    this.btn = document.getElementById("synth-toggle");
    this.chordDisplay = document.getElementById("chord-display");
    this.bars = [
      document.getElementById("bar-1"),
      document.getElementById("bar-2"),
      document.getElementById("bar-3"),
      document.getElementById("bar-4"),
    ];

    if (this.btn) {
      this.btn.addEventListener("click", () => this.toggle());
    }
  }

  toggle() {
    audio.playClick();
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    audio.init();
    this.isPlaying = true;
    if (this.btn) this.btn.textContent = I18N[currentLang].synth_stop;
    this.playStep();
    this.timer = setInterval(() => this.playStep(), 2500);
  }

  stop() {
    this.isPlaying = false;
    if (this.btn) this.btn.textContent = I18N[currentLang].synth_play;
    if (this.chordDisplay) this.chordDisplay.textContent = "CHORD: OFF";
    clearInterval(this.timer);
    this.bars.forEach((bar) => {
      if (bar) bar.style.height = "10px";
    });
  }

  playStep() {
    if (!this.isPlaying) return;
    const chord = this.chords[this.currentChord];
    if (this.chordDisplay)
      this.chordDisplay.textContent = `CHORD: ${chord.name}`;
    this.triggerChord(chord.freqs);

    this.bars.forEach((bar) => {
      if (bar) {
        const h = Math.floor(20 + Math.random() * 55);
        bar.style.height = `${h}px`;
      }
    });

    this.currentChord = (this.currentChord + 1) % this.chords.length;
  }

  triggerChord(frequencies) {
    if (audio.muted) return;
    frequencies.forEach((f) => {
      try {
        const osc = audio.ctx.createOscillator();
        const gain = audio.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, audio.ctx.currentTime);
        gain.gain.setValueAtTime(0.015, audio.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          audio.ctx.currentTime + 2.2,
        );
        osc.connect(gain);
        gain.connect(audio.ctx.destination);
        osc.start();
        osc.stop(audio.ctx.currentTime + 2.3);
      } catch (_) {}
    });
  }
}

/* ==========================================================================
   6. GLOBAL INITIALIZATION & EVENT DISPATCHERS
   ========================================================================== */
const themes = ["tokyo", "cyberpunk", "matrix"];
let currentThemeIdx = 0;

function setTheme(themeName) {
  document.documentElement.setAttribute("data-theme", themeName);
  const themeLabel = document.getElementById("theme-name");
  if (themeLabel) themeLabel.textContent = themeName.toUpperCase();
  currentThemeIdx = themes.indexOf(themeName);
}

const themeBtn = document.getElementById("theme-btn");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    audio.playClick();
    currentThemeIdx = (currentThemeIdx + 1) % themes.length;
    setTheme(themes[currentThemeIdx]);
  });
}

const langBtn = document.getElementById("lang-btn");
if (langBtn) {
  langBtn.addEventListener("click", () => {
    audio.playClick();
    const nextLang = currentLang === "GEO" ? "ENG" : "GEO";
    applyLanguage(nextLang);
    if (window.fileExplorerApp) window.fileExplorerApp.init();
  });
}

const sfxBtn = document.getElementById("sfx-btn");
if (sfxBtn) {
  sfxBtn.addEventListener("click", () => audio.toggleMute());
}

function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  const clock = document.getElementById("hud-clock");
  if (clock) clock.textContent = `${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();

// Cyber Cursor
const cursorDot = document.getElementById("cursor-dot");
const cursorRing = document.getElementById("cursor-ring");
let mouseX = -100,
  mouseY = -100;
let ringX = -100,
  ringY = -100;

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursorDot) {
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  }
});

function animateCursorRing() {
  ringX += (mouseX - ringX) * 0.18;
  ringY += (mouseY - ringY) * 0.18;
  if (cursorRing) {
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
  }
  requestAnimationFrame(animateCursorRing);
}
requestAnimationFrame(animateCursorRing);

function attachHoverListeners() {
  const interactives = document.querySelectorAll(
    "button, .desktop-icon, .file-item, .folder-item, .menu-item, input",
  );
  interactives.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      if (cursorRing) cursorRing.classList.add("cursor-hover");
      audio.playHover();
    });
    el.addEventListener("mouseleave", () => {
      if (cursorRing) cursorRing.classList.remove("cursor-hover");
    });
  });
}

// Start Menu
const startBtn = document.getElementById("start-btn");
const startMenu = document.getElementById("start-menu");

if (startBtn && startMenu) {
  startBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    audio.playClick();
    startMenu.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!startMenu.contains(e.target) && e.target !== startBtn) {
      startMenu.classList.add("hidden");
    }
  });
}

// App Launching from Desktop & Start Menu
document.querySelectorAll("[data-app]").forEach((launcher) => {
  launcher.addEventListener("click", () => {
    const appKey = launcher.getAttribute("data-app");
    if (window.windowManager) window.windowManager.openWindow(appKey);
    if (startMenu) startMenu.classList.add("hidden");
  });
});

// Bootstrap Instances
window.windowManager = new WindowManager();
window.matrix = new MatrixEngine("matrix-canvas");
window.terminalApp = new TerminalApp();
window.systemMonitorApp = new SystemMonitorApp();
window.fileExplorerApp = new FileExplorerApp();
window.synthApp = new SynthApp();

// Apply settings
applyLanguage(currentLang);
attachHoverListeners();
