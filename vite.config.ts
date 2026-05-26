import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the built `dist/` works when Lively Wallpaper loads
// `dist/index.html` directly from disk (assets get `./assets/...` paths).
export default defineConfig({
  base: "./",
  plugins: [react()],
});
