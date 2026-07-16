# Archive: full-window desktop app (abandoned)

## What we tried

After the web / Lively MVP, we wrapped the same React UI in **Tauri as a normal desktop window**: one large undecorated (or decorated) window that showed the full anime wallpaper, in-page `CloudLayer`, and habit panel together — essentially “the Lively page, but as an `.exe`.”

## Why it was abandoned

- The goal was a **widget on the real desktop**, not a second wallpaper inside an app window.
- A full-window host always owns the sky; it cannot sit lightly on top of the user’s existing wallpaper.
- It felt like opening an app, not like Rainmeter-style desktop decoration.

## What replaced it

**Rainmeter-style Tauri widgets** (current main path):

- Small transparent **habit panel** window (interactive, skip taskbar, tray-managed)
- Separate **cloud** windows per completed habit (click-through, WorkerW-attached behind icons)
- User’s normal Windows wallpaper stays underneath

See the root [README](../../README.md) for how to run the widget build.

## What we kept from that experiment

- Tauri + Vite tooling (`src-tauri/`, `npm run tauri:*`, Cargo/PATH helper scripts)
- Lessons about WebView2 (async commands when creating windows on Windows; don’t open `.exe` files in the editor)

## Lively

Lively was the original full-page host and remains a **backup** for shipping one HTML page as a live wallpaper. It is not archived; it is documented as secondary in the README.
