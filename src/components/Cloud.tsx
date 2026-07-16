import type { CSSProperties } from "react";
import type { CloudInstance } from "../types/habit";
import styles from "./Cloud.module.css";

const cloudSrc = `${import.meta.env.BASE_URL}assets/cloud.png`;

type CloudProps = {
  cloud: CloudInstance;
  /** When true, cloud fills its own small transparent window (desktop widget). */
  standalone?: boolean;
};

export function Cloud({ cloud, standalone = false }: CloudProps) {
  const opacity = cloud.opacity ?? 0.85;
  const flipped = cloud.flipped ?? false;

  const positionStyle = {
    left: standalone ? "50%" : `${cloud.x}%`,
    top: standalone ? "50%" : `${cloud.y}%`,
    "--cloud-opacity": opacity,
  } as CSSProperties;

  const transformStyle = {
    "--cloud-scale": standalone ? 1 : cloud.scale,
    "--cloud-rotation": cloud.rotation,
    "--cloud-flip": flipped ? -1 : 1,
  } as CSSProperties;

  return (
    <div
      className={standalone ? `${styles.cloud} ${styles.standalone}` : styles.cloud}
      style={positionStyle}
      aria-hidden="true"
    >
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
