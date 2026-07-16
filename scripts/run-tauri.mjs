import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { delimiter, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cargoBin = join(homedir(), ".cargo", "bin");
process.env.PATH = `${cargoBin}${delimiter}${process.env.PATH ?? ""}`;

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/run-tauri.mjs <dev|build|...> [extra tauri args]");
  process.exit(1);
}

const require = createRequire(import.meta.url);
let tauriJs;
try {
  tauriJs = require.resolve("@tauri-apps/cli/tauri.js");
} catch {
  tauriJs = join(root, "node_modules", "@tauri-apps", "cli", "tauri.js");
}

if (!existsSync(tauriJs)) {
  console.error(`Tauri CLI not found. Run: npm install`);
  process.exit(1);
}

// Invoke via node (no shell) so paths with spaces work on Windows.
const child = spawn(process.execPath, [tauriJs, ...args], {
  stdio: "inherit",
  env: process.env,
  cwd: root,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
