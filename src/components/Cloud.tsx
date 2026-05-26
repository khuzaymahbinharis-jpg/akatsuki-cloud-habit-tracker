import type { CSSProperties } from "react";
import type { CloudInstance } from "../types/habit";
import styles from "./Cloud.module.css";

// Stylized cloud PNG lives in /public/assets so we route through BASE_URL,
// which keeps the same code working under `vite dev` and in the built
// dist/ when Lively Wallpaper opens it from disk.
const cloudSrc = `${import.meta.env.BASE_URL}assets/cloud.png`;

type CloudProps = { cloud: CloudInstance };

export function Cloud({ cloud }: CloudProps) {
  const opacity = cloud.opacity ?? 0.85;
  const flipped = cloud.flipped ?? false;

  const positionStyle = {
    left: `${cloud.x}%`,
    top: `${cloud.y}%`,
    "--cloud-opacity": opacity,
  } as CSSProperties;

  const transformStyle = {
    "--cloud-scale": cloud.scale,
    "--cloud-rotation": cloud.rotation,
    "--cloud-flip": flipped ? -1 : 1,
  } as CSSProperties;

  return (
    <div className={styles.cloud} style={positionStyle} aria-hidden="true">
      <div className={styles.transform} style={transformStyle}>
        <img
          className={styles.image}
          src={cloudSrc}
          alt=""
          draggable={false}
        />
      </div>
    </div>
  );
}
