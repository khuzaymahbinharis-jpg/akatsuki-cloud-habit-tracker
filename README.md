# Akatsuki Cloud Habit Tracker

An interactive habit tracker with drifting decorative clouds. Built with React, Vite, TypeScript, and [Tauri](https://tauri.app/) on Windows.

**Primary experience:** Rainmeter-style **desktop widgets**. A glass habit panel and click-through cloud windows sit on your real Windows wallpaper (panel interactive; clouds behind desktop icons via WorkerW).

**Backup / secondary:** Full-screen web layout in the browser, or the same page loaded as a [Lively Wallpaper](https://www.rocksdanister.com/lively/).

Tick off a habit → a cloud appears. Untick → it disappears. State lives in `localStorage` and resets each calendar day.

## Quick start (desktop widgets)

**Prerequisites (one-time on Windows):**

1. [Node.js](https://nodejs.org/) (LTS)
2. [Rust](https://www.rust-lang.org/tools/install) via rustup
3. [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (“Desktop development with C++”)
4. [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/) (usually already installed)

```bash
npm install
npm run tauri:dev
```

You should see:

- A transparent habit panel near the bottom-left (no taskbar button)
- A tray icon: **Show Panel**, **Hide Panel**, **Re-attach Widgets**, **Quit**
- Cloud widgets on the desktop when habits are completed (click-through)

**Build / launch a release:**

```bash
npm run tauri:build
npm run start:desktop
```

Installer: `src-tauri/target/release/bundle/nsis/Akatsuki Cloud Habit Tracker_0.1.0_x64-setup.exe`  
App: `src-tauri/target/release/akatsuki-cloud-habit-tracker.exe`  

Do not open the `.exe` inside the editor — run it from File Explorer or `npm run start:desktop`.

### Desktop limitations

- Windows only (WorkerW / wallpaper-layer APIs)
- Wallpaper or theme changes can briefly detach cloud widgets — use tray **Re-attach Widgets**, or wait for auto re-attach (~45s)
- v1 targets the **primary monitor** only

## Features

- Glassmorphism habit panel with edit mode (add / rename / delete habits)
- Five default habits to start
- One decorative cloud per completed habit (position, scale, rotation persisted)
- Daily reset on load, focus, visibility change, and before each toggle
- Manual **Reset Day**
- System tray for a taskbar-free desktop app

## Backup: web UI & Lively Wallpaper

The original full-page sky + panel still works for browser testing and as a Lively live wallpaper if you prefer everything in one HTML page.

1. Put art at `public/assets/wallpaper.png` and `public/assets/cloud.png`
2. `npm install` then `npm run dev` (browser) or `npm run build` (for Lively)

**Lively:**

1. `npm run build`
2. Lively → **Add Wallpaper** → **Browse** → `dist/index.html`
3. Enable **Input Forwarding**
4. Rebuild after code changes (or point Lively at `http://localhost:5173` while `npm run dev` runs)

Vite `base` is `./` so `dist/` works from disk under Lively.

## Project structure

```text
src/
├── components/          # Panel, clouds, wallpaper (web/Lively)
├── hooks/useHabitState.ts
├── lib/
│   ├── desktop.ts       # Tauri window-mode helpers
│   ├── tauriBridge.ts   # sync_cloud_windows / reattach
│   └── …                # storage, date, cloud positions
├── App.tsx              # Routes: panel widget | cloud widget | web/Lively
└── …

src-tauri/               # Tauri shell: tray, cloud HWNDs, WorkerW attach
scripts/                 # PATH-safe tauri runners + start:desktop
docs/archive/            # Abandoned approaches (historical)
```

## Data model

```ts
type CloudInstance = {
  x: number;          // 0–100 (% of primary screen)
  y: number;
  variant: number;
  scale: number;      // 0.7–1.4
  rotation: number;
  opacity?: number;
  flipped?: boolean;
};

type Habit = {
  id: string;
  label: string;
  completed: boolean;
  cloud?: CloudInstance;
};

type AppState = {
  version: 1;
  date: string;       // YYYY-MM-DD local
  habits: Habit[];
};
```

Stored under `habit-wallpaper:state`.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run tauri:dev` | **Main** — desktop widgets (dev) |
| `npm run tauri:build` | Windows NSIS installer + release exe |
| `npm run start:desktop` | Launch built release exe |
| `npm run dev` | Backup — Vite browser / Lively URL |
| `npm run build` | Backup — static `dist/` for Lively |
| `npm run preview` | Serve `dist/` |
| `npm run lint` | ESLint |

## Design history

We briefly tried a **full-window Tauri app** that redrew the entire wallpaper inside one window. That did not match the “widget on my desktop” goal and was abandoned. Notes: [docs/archive/FULL_WINDOW_DESKTOP.md](docs/archive/FULL_WINDOW_DESKTOP.md).

Lively remains supported as a **backup** path for a single full-bleed page, not as the primary shipping mode.
