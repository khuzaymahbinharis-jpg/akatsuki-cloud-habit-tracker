import type { CloudInstance } from "../types/habit";

type Rect = { x1: number; y1: number; x2: number; y2: number };

// All coords are viewport percentages so positions stay stable
// across resolutions. (0,0) is top-left, (100,100) is bottom-right.

// Where clouds are allowed to spawn (open sky, upper half).
const SKY_ZONE: Rect = { x1: 4, y1: 4, x2: 96, y2: 50 };

// House / arch structure on the right side of the wallpaper.
// Clouds should not spawn here so they don't visually fight the building.
const HOUSE_EXCLUSION: Rect = { x1: 50, y1: 0, x2: 100, y2: 70 };

// Habit panel area (bottom-left). It sits below SKY_ZONE today, but we
// keep an exclusion so this stays correct if the sky zone ever expands.
const PANEL_EXCLUSION: Rect = { x1: 0, y1: 58, x2: 32, y2: 100 };

const EXCLUSIONS: Rect[] = [HOUSE_EXCLUSION, PANEL_EXCLUSION];

// Only one PNG asset, but `variant` is kept as a stable seed for future
// asset sets / themes. We use it now only as a tiebreaker for sizing.
const VARIANT_COUNT = 3;
const MIN_CLOUD_DISTANCE = 16;
const MAX_ATTEMPTS = 16;

function inRect(x: number, y: number, r: Rect): boolean {
  return x >= r.x1 && x <= r.x2 && y >= r.y1 && y <= r.y2;
}

function distance(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.hypot(dx, dy);
}

function randomInSky(): { x: number; y: number } {
  return {
    x: SKY_ZONE.x1 + Math.random() * (SKY_ZONE.x2 - SKY_ZONE.x1),
    y: SKY_ZONE.y1 + Math.random() * (SKY_ZONE.y2 - SKY_ZONE.y1),
  };
}

function nearestNeighborDistance(
  x: number,
  y: number,
  others: CloudInstance[],
): number {
  if (others.length === 0) return Infinity;
  let min = Infinity;
  for (const c of others) {
    const d = distance(x, y, c.x, c.y);
    if (d < min) min = d;
  }
  return min;
}

function makeCloud(x: number, y: number): CloudInstance {
  return {
    x,
    y,
    variant: Math.floor(Math.random() * VARIANT_COUNT),
    // Wider range so clouds read as different sizes, not stamped copies.
    scale: 0.7 + Math.random() * 0.7,
    rotation: -14 + Math.random() * 28,
    opacity: 0.62 + Math.random() * 0.33,
    flipped: Math.random() < 0.5,
  };
}

export function generateCloud(existing: CloudInstance[]): CloudInstance {
  let fallback: { x: number; y: number; score: number } | null = null;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const { x, y } = randomInSky();
    if (EXCLUSIONS.some((r) => inRect(x, y, r))) continue;

    const minDist = nearestNeighborDistance(x, y, existing);
    if (minDist >= MIN_CLOUD_DISTANCE) {
      return makeCloud(x, y);
    }
    if (!fallback || minDist > fallback.score) {
      fallback = { x, y, score: minDist };
    }
  }

  // Best non-colliding-enough spot we found, or a safe default.
  if (fallback) return makeCloud(fallback.x, fallback.y);
  return makeCloud(20, 18);
}
