# Tokyo OS — by NEONDEV

A cyberpunk desktop environment that runs in the browser. Live: https://cercvadzee07.github.io/Tokyo-OS/os.html

## Features

- **Real Linux terminal** — the [v86](https://github.com/copy/v86) x86 emulator boots Linux 6.8 (Buildroot)
  inside the page and its serial console is rendered with [xterm.js](https://xtermjs.org/). It runs only in the
  visitor's browser: no network, no access to their files or to any server. `rm -rf /` only breaks that tab's
  own copy; closing the window or reloading starts fresh. Assets (~12 MB) load on first boot only.
- **Tabbed browser** — iframe-based, with an address bar (domains open directly, other text searches Wikipedia),
  back/forward/reload/home, bookmarks to my projects, and a fallback page for sites that forbid framing
  (Google, GitHub…). Shortcuts: Ctrl+T, Ctrl+W, Ctrl+L.
- **Window manager** — drag, resize, minimize (stays in the taskbar), maximize (double-click the title bar),
  focus/z-order, Start menu; mouse and touch; full-screen windows on phones.
- System monitor, file explorer, procedural Web Audio lo-fi synth, Georgian / English.
- **NEONDEV design** — dark navy glass UI with the brand gradient, boot splash and clock widget.
- **Mobile layout** — phone home screen, full-screen apps and a bottom dock (Linux shows a "best on desktop" note on phones).

## Files

| File | What |
|---|---|
| `os.html` | desktop + window markup |
| `theme-neondev.css` | NEONDEV design system + mobile layout |
| `neondev.js` | brand layer: background, clock widget, splash, icons, xterm colours, mobile behaviour |
| `kernel.js` | i18n, audio, matrix rain, window manager, monitor/explorer/synth apps |
| `browser.js` | the tabbed browser |
| `linux.js` | v86 + xterm.js terminal |
| `linux/buildroot-bzimage68.bin` | Linux kernel + initramfs image |

## Third-party software

- **v86** (BSD-2-Clause) — `libv86.js` / `v86.wasm` from npm `v86@0.5.465` and SeaBIOS / VGABIOS
  (LGPL-3.0) from the v86 repo, loaded via jsDelivr.
- **xterm.js** (MIT) — `@xterm/xterm@5.5.0`, `@xterm/addon-fit@0.10.0`, via jsDelivr.
- **`linux/buildroot-bzimage68.bin`** — the Buildroot Linux 6.8 image built and published by the v86 author
  (originally `https://i.copy.sh/buildroot-bzimage68.bin`, SHA-256
  `507a759c70ab7a490a233be454d0b5b88bc667956a410b531cb4edc091e2eb1c`). It contains the Linux kernel and
  BusyBox, both licensed under the GPL-2.0. Sources: [kernel.org](https://www.kernel.org/),
  [busybox.net](https://busybox.net/), [buildroot.org](https://buildroot.org/), build config in the
  [v86 repository](https://github.com/copy/v86/tree/master/tools/docker).
