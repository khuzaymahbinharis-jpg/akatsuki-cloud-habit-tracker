import { invoke } from "@tauri-apps/api/core";
import type { CloudWindowSpec } from "./desktop";

export async function syncCloudWindows(clouds: CloudWindowSpec[]): Promise<void> {
  await invoke("sync_cloud_windows", { clouds });
}

export async function reattachWidgets(): Promise<void> {
  await invoke("reattach_widgets");
}
