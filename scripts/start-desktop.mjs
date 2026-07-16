import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const exe = join(
  root,
  "src-tauri",
  "target",
  "release",
  "akatsuki-cloud-habit-tracker.exe",
);

if (!existsSync(exe)) {
  console.error(
    "Desktop app not built yet. Run: npm run tauri:build\n" +
      `Expected: ${exe}`,
  );
  process.exit(1);
}

const child = spawn(exe, [], {
  detached: true,
  stdio: "ignore",
  cwd: dirname(exe),
});
child.unref();
console.log(`Launched: ${exe}`);
