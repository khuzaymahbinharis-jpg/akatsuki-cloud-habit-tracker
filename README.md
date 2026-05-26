# Akatsuki Cloud Habit Tracker

An interactive desktop wallpaper habit tracker. Built as a React + Vite + TypeScript web app and designed to run full-screen through [Lively Wallpaper](https://www.rocksdanister.com/lively/) on Windows.

Tick off a habit, a stylized cloud drifts into the sky. Untick it, the cloud is gone. State persists in `localStorage` and resets each calendar day.

## MVP Scope (Phase 1)

- Full-screen anime sky background from `/public/wallpaper.png`
- Glassmorphism habit panel in the bottom-left
- Five default habits (Drink Water, Morning Stretch, Read 20 Min, No Screen 1hr, Sleep by 11pm)
- Check / uncheck spawns or removes one decorative cloud
- Cloud position, variant, scale, and rotation are saved with the habit
- Daily reset on app load, on window focus, on `visibilitychange`, and as a guard before every toggle
- Manual "Reset Day" button in the panel
- Targets 1920x1080 first, degrades gracefully at smaller sizes

Out of scope for Phase 1: themes, multiple wallpapers, habit editing, streaks, settings panel.

## Getting Started

1. Place your wallpaper image at `public/wallpaper.png`.
2. Place your stylized cloud PNG at `public/assets/cloud.png` (transparent background, ~1024px wide works well).
3. Install dependencies:

   ```bash
   npm install
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open the printed URL (usually `http://localhost:5173`) to test interactively.

5. Build for production:

   ```bash
   npm run build
   ```

   The output lands in `dist/`. The Vite `base` is set to `./` so the build works both from a server and when opened directly from disk.

## Using It as a Lively Wallpaper

1. Run `npm run build`.
2. In Lively Wallpaper, choose **Add Wallpaper** -> **Browse** and pick `dist/index.html`.
3. Lively will load the page full-screen as your desktop wallpaper. Interactions (clicks on the habit panel) are forwarded to the page when "Input Forwarding" is enabled in Lively.
4. Re-run `npm run build` after any code change. Lively reloads from disk.

For iteration speed, you can instead point Lively at the dev server URL while `npm run dev` is running.

## Project Structure

```text
src/
├── components/
│   ├── Wallpaper.tsx          # full-screen background image
│   ├── CloudLayer.tsx         # absolute layer holding all clouds
│   ├── Cloud.tsx              # renders cloud.png with per-instance variation
│   ├── HabitPanel.tsx         # glassmorphism panel with decor + reset
│   └── HabitItem.tsx          # one checkbox row with icon
├── hooks/
│   └── useHabitState.ts       # central state, persistence, daily reset
├── lib/
│   ├── storage.ts             # versioned localStorage load / save
│   ├── date.ts                # local todayKey() / isNewDay()
│   └── cloudPosition.ts       # sky-zone random pos + exclusion rects
├── config/
│   └── defaultHabits.ts       # five seed habits with stable ids
├── types/
│   └── habit.ts               # Habit, CloudInstance, AppState
├── styles/
│   ├── variables.css          # design tokens (colors, blur, motion)
│   └── global.css             # reset and body defaults
├── App.tsx
└── main.tsx
```

## Data Model

```ts
type CloudInstance = {
  x: number;          // 0-100 (percent of viewport width)
  y: number;          // 0-100 (percent of viewport height)
  variant: number;    // discrete seed (reserved for future asset sets)
  scale: number;      // 0.7 - 1.4
  rotation: number;   // -14 - 14 degrees
  opacity?: number;   // 0.62 - 0.95
  flipped?: boolean;  // horizontally mirrored
};

type Habit = {
  id: string;
  label: string;
  completed: boolean;
  cloud?: CloudInstance; // present iff completed
};

type AppState = {
  version: 1;
  date: string;     // "YYYY-MM-DD" local
  habits: Habit[];
};
```

Stored under the single key `habit-wallpaper:state`.

## Cloud Spawning

`src/lib/cloudPosition.ts` defines:

- A **sky zone** the upper portion of the viewport where clouds may appear.
- **Exclusion rectangles** for the house / arch (right side of the wallpaper) and the habit panel (bottom-left).
- A **minimum distance** between clouds; the algorithm retries random positions until it finds one that fits, falling back to the best candidate otherwise.

To re-tune for a different wallpaper, edit `SKY_ZONE`, `HOUSE_EXCLUSION`, `PANEL_EXCLUSION`, and `MIN_CLOUD_DISTANCE` at the top of the file.

## Daily Reset

The reset runs in four places, all comparing the stored `state.date` to today's local date (`YYYY-MM-DD`):

1. Lazy initial state on first render (`initialState()`).
2. On `window` `focus`.
3. On `document` `visibilitychange` when the document becomes visible.
4. Inside `toggleHabit`, as a guard before the toggle is applied.

There is no background timer, so a wallpaper that runs unattended past midnight will catch up the moment you interact or refocus it.

## Scripts

- `npm run dev` start Vite dev server.
- `npm run build` typecheck + production build into `dist/`.
- `npm run preview` serve the built `dist/` locally.
- `npm run lint` ESLint over the project.
