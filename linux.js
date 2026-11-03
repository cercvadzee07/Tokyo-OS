/**
 * TOKYO OS - Linux Terminal
 * Boots a real Linux 6.8 (Buildroot) inside the visitor's browser with the v86
 * x86 emulator and shows its serial console in xterm.js.
 *
 * Safety: the VM lives entirely in this browser tab. It has no network and no
 * access to the visitor's files or to any server — `rm -rf /` only breaks this
 * tab's own copy, and a reload (or closing the window) starts fresh.
 *
 * Everything is loaded lazily from CDNs on the first boot (~12 MB), so the
 * desktop itself stays light.
 */

const LINUX_ASSETS = {
  xtermCss: "https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/css/xterm.css",
  xtermJs: "https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/lib/xterm.js",
  fitJs: "https://cdn.jsdelivr.net/npm/@xterm/addon-fit@0.10.0/lib/addon-fit.js",
  v86Js: "https://cdn.jsdelivr.net/npm/v86@0.5.465/build/libv86.js",
  v86Wasm: "https://cdn.jsdelivr.net/npm/v86@0.5.465/build/v86.wasm",
  // BIOS files from the v86 repo, pinned to the commit that last changed them
  bios: "https://cdn.jsdelivr.net/gh/copy/v86@b8a39b11dd2076870699e6cac053556271b9bfab/bios/seabios.bin",
  vgaBios: "https://cdn.jsdelivr.net/gh/copy/v86@b8a39b11dd2076870699e6cac053556271b9bfab/bios/vgabios.bin",
  // Buildroot Linux 6.8 image built by the v86 author (from i.copy.sh, which blocks
  // hotlinking, so it's served from this repo — see README for sources/licence)
  kernel: "linux/buildroot-bzimage68.bin",
};

const loadedScripts = {};
function loadScript(src) {
  loadedScripts[src] ??= new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.onload = resolve;
    el.onerror = () => reject(new Error(`failed to load ${src}`));
    document.head.appendChild(el);
  });
  return loadedScripts[src];
}

function loadCss(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const el = document.createElement("link");
  el.rel = "stylesheet";
  el.href = href;
  document.head.appendChild(el);
}

class LinuxTerminalApp {
  constructor() {
    this.screen = document.getElementById("linux-screen");
    this.bootPanel = document.getElementById("linux-boot");
    this.bootBtn = document.getElementById("linux-boot-btn");
    this.progress = document.getElementById("linux-progress");
    this.progressFill = document.getElementById("linux-progress-fill");
    this.progressText = document.getElementById("linux-progress-text");
    if (!this.screen) return;

    this.state = "idle"; // idle | loading | running
    this.emulator = null;
    this.term = null;
    this.fit = null;

    this.bootBtn.addEventListener("click", () => this.boot());
    // opening the terminal from the desktop boots straight away
    document.addEventListener("window:opened", (e) => {
      if (e.detail === "terminal" && this.state === "idle") this.boot();
    });
    // closing the window powers the VM off and frees its memory
    document.addEventListener("window:closed", (e) => {
      if (e.detail === "terminal") this.shutdown();
    });

    this.resizeObserver = new ResizeObserver(() => this.fitTerminal());
    this.resizeObserver.observe(this.screen);
  }

  setProgress(text, ratio = null) {
    this.progress.classList.remove("hidden");
    this.progressText.textContent = text;
    this.progressFill.style.width = ratio === null ? "100%" : `${Math.round(ratio * 100)}%`;
    this.progressFill.classList.toggle("indeterminate", ratio === null);
  }

  async boot() {
    if (this.state !== "idle") return;
    this.state = "loading";
    this.bootBtn.disabled = true;
    this.setProgress(`${t("linux_loading")}…`, 0);

    try {
      loadCss(LINUX_ASSETS.xtermCss);
      await Promise.all([loadScript(LINUX_ASSETS.xtermJs), loadScript(LINUX_ASSETS.v86Js)]);
      await loadScript(LINUX_ASSETS.fitJs);
    } catch (err) {
      console.error(err);
      return this.fail();
    }

    this.createTerminal();

    this.emulator = new V86({
      wasm_path: LINUX_ASSETS.v86Wasm,
      memory_size: 128 * 1024 * 1024,
      vga_memory_size: 2 * 1024 * 1024,
      bios: { url: LINUX_ASSETS.bios },
      vga_bios: { url: LINUX_ASSETS.vgaBios },
      bzimage: { url: LINUX_ASSETS.kernel, size: 10068480, async: false },
      cmdline: "tsc=reliable mitigations=off random.trust_cpu=on console=ttyS0",
      // empty in-memory 9p share: the image mounts it at /mnt on boot
      filesystem: {},
      autostart: true,
      disable_keyboard: true,
      disable_mouse: true,
      disable_speaker: true,
    });

    this.emulator.add_listener("download-progress", (e) => {
      if (!e.total) return;
      const mb = (n) => (n / 1048576).toFixed(1);
      this.setProgress(`${t("linux_loading")} ${e.file_name.split("/").pop()} — ${mb(e.loaded)} / ${mb(e.total)} MB`, e.loaded / e.total);
    });
    this.emulator.add_listener("download-error", () => this.fail());

    this.emulator.add_listener("emulator-ready", () => {
      this.setProgress(t("linux_booting"));
    });

    let sawOutput = false;
    let tail = "";
    let loggedIn = false;
    // serial output arrives byte by byte — batch it into one write every ~16 ms
    // (setTimeout, not rAF: rAF pauses in background tabs and output would stall)
    let pending = [];
    const flush = () => {
      if (this.term && pending.length) this.term.write(Uint8Array.from(pending));
      pending = [];
    };
    this.emulator.add_listener("serial0-output-byte", (byte) => {
      if (!sawOutput) {
        sawOutput = true;
        this.state = "running";
        this.bootPanel.classList.add("hidden");
        this.fitTerminal();
        this.term.focus();
      }
      if (!pending.length) setTimeout(flush, 16);
      pending.push(byte);

      // log in as root automatically the first time the login prompt appears
      if (!loggedIn) {
        tail = (tail + String.fromCharCode(byte)).slice(-32);
        if (/login: ?$/.test(tail)) {
          loggedIn = true;
          this.emulator.serial0_send("root\n");
        }
      }
    });
  }

  createTerminal() {
    this.term = new Terminal({
      cursorBlink: true,
      convertEol: false,
      fontFamily: 'Consolas, "Cascadia Mono", "Courier New", monospace',
      fontSize: 14,
      theme: {
        background: "#0a0b10",
        foreground: "#c0caf5",
        cursor: "#7dcfff",
        selectionBackground: "#33467c",
        black: "#15161e", red: "#f7768e", green: "#9ece6a", yellow: "#e0af68",
        blue: "#7aa2f7", magenta: "#bb9af7", cyan: "#7dcfff", white: "#a9b1d6",
      },
    });
    this.fit = new FitAddon.FitAddon();
    this.term.loadAddon(this.fit);
    this.term.open(this.screen);
    this.term.writeln("\x1b[36mTokyo OS\x1b[0m · v86 x86 emulator · Linux 6.8 (Buildroot)");
    this.term.writeln(`\x1b[90m${t("linux_hint")}\x1b[0m`);
    this.term.writeln("");
    this.term.onData((data) => {
      if (this.emulator) this.emulator.serial0_send(data);
      audio.playKeypress(data.charCodeAt(0));
    });
    this.fitTerminal();
  }

  fitTerminal() {
    if (!this.fit || !this.screen.offsetWidth) return;
    try {
      this.fit.fit();
    } catch {
      /* window is hidden */
    }
  }

  fail() {
    this.setProgress(t("linux_failed"), 0);
    this.shutdown({ keepMessage: true });
  }

  shutdown({ keepMessage = false } = {}) {
    if (this.emulator) {
      this.emulator.destroy();
      this.emulator = null;
    }
    if (this.term) {
      this.term.dispose();
      this.term = null;
      this.fit = null;
    }
    this.state = "idle";
    this.bootBtn.disabled = false;
    this.bootPanel.classList.remove("hidden");
    if (!keepMessage) this.progress.classList.add("hidden");
  }
}

window.linuxTerminalApp = new LinuxTerminalApp();
