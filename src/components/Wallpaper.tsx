import styles from "./Wallpaper.module.css";

// Using <img> + BASE_URL so the same path resolves whether the app is
// served by `vite dev` or opened from disk by Lively Wallpaper.
const wallpaperSrc = `${import.meta.env.BASE_URL}assets/wallpaper.png`;

export function Wallpaper() {
  return (
    <img
      className={styles.wallpaper}
      src={wallpaperSrc}
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}
