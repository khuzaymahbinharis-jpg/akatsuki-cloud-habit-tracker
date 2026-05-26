import type { Habit } from "../types/habit";
import { Cloud } from "./Cloud";
import styles from "./CloudLayer.module.css";

type CloudLayerProps = {
  habits: Habit[];
};

export function CloudLayer({ habits }: CloudLayerProps) {
  return (
    <div className={styles.layer}>
      {habits.map((h) =>
        h.cloud ? <Cloud key={h.id} cloud={h.cloud} /> : null,
      )}
    </div>
  );
}
