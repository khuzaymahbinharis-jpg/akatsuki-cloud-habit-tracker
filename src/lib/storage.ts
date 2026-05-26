import type { AppState } from "../types/habit";

const STORAGE_KEY = "habit-wallpaper:state";
const CURRENT_VERSION = 1 as const;

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (parsed?.version !== CURRENT_VERSION) return null;
    if (typeof parsed.date !== "string" || !Array.isArray(parsed.habits)) {
      return null;
    }
    return parsed as AppState;
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Swallow quota / private mode errors. State stays in memory.
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
