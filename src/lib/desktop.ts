import type { CloudInstance } from "../types/habit";

export type CloudWindowSpec = CloudInstance & { id: string };

declare global {
  interface Window {
    __CLOUD_DATA__?: CloudInstance & { id?: string };
  }
}

/** True when running inside a Tauri webview. */
export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function parseCloudJson(raw: unknown): CloudInstance | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as CloudInstance;
  if (
    typeof data.x !== "number" ||
    typeof data.y !== "number" ||
    typeof data.scale !== "number"
  ) {
    return null;
  }
  return data;
}

function parseCloudString(raw: string): CloudInstance | null {
  try {
    return parseCloudJson(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Parse cloud payload from injected data, `?cloud=`, or `#cloud=`. */
export function parseCloudFromLocation(
  search: string = window.location.search,
  hash: string = window.location.hash,
): CloudInstance | null {
  const injected = parseCloudJson(window.__CLOUD_DATA__);
  if (injected) return injected;

  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const fromQuery = params.get("cloud");
  if (fromQuery) {
    return parseCloudString(fromQuery);
  }
  if (hash.startsWith("#cloud=")) {
    try {
      return parseCloudString(decodeURIComponent(hash.slice("#cloud=".length)));
    } catch {
      return null;
    }
  }
  return null;
}

export function cloudsFromHabits(
  habits: Array<{ id: string; cloud?: CloudInstance }>,
): CloudWindowSpec[] {
  return habits
    .filter((h): h is { id: string; cloud: CloudInstance } => Boolean(h.cloud))
    .map((h) => ({ id: h.id, ...h.cloud }));
}
