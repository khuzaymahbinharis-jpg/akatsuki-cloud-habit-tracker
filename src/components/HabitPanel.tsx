import type { Habit } from "../types/habit";
import { HabitItem } from "./HabitItem";
import styles from "./HabitPanel.module.css";

type HabitPanelProps = {
  habits: Habit[];
  date: string;
  onToggle: (id: string) => void;
  onResetDay: () => void;
};

const cloudSrc = `${import.meta.env.BASE_URL}assets/cloud.png`;

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Decorative cloud reusing the same asset as sky clouds, but heavily
// transparent and tucked into the panel corners. Purely visual.
function DecorCloud({ className }: { className: string }) {
  return (
    <img
      className={className}
      src={cloudSrc}
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}

function Sparkle({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M 10 0 L 11 9 L 20 10 L 11 11 L 10 20 L 9 11 L 0 10 L 9 9 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function HabitPanel({
  habits,
  date,
  onToggle,
  onResetDay,
}: HabitPanelProps) {
  return (
    <section className={styles.panel} aria-label="Habit tracker">
      <div className={styles.decorations} aria-hidden="true">
        <DecorCloud className={`${styles.decorCloud} ${styles.decorTL}`} />
        <DecorCloud className={`${styles.decorCloud} ${styles.decorTLb}`} />
        <DecorCloud className={`${styles.decorCloud} ${styles.decorTR}`} />
        <Sparkle className={`${styles.sparkle} ${styles.sparkleA}`} />
        <Sparkle className={`${styles.sparkle} ${styles.sparkleB}`} />
        <Sparkle className={`${styles.sparkle} ${styles.sparkleC}`} />
        <DecorCloud className={`${styles.decorCloud} ${styles.decorBL}`} />
        <DecorCloud className={`${styles.decorCloud} ${styles.decorBR}`} />
      </div>

      <header className={styles.header}>
        <span className={styles.title}>Habit Tracker</span>
        <span className={styles.date}>{formatDate(date)}</span>
      </header>

      <ul className={styles.list}>
        {habits.map((habit) => (
          <li key={habit.id} className={styles.listItem}>
            <HabitItem habit={habit} onToggle={onToggle} />
          </li>
        ))}
      </ul>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.resetButton}
          onClick={onResetDay}
        >
          Reset Day
        </button>
      </div>
    </section>
  );
}
