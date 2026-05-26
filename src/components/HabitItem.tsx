import type { ReactNode } from "react";
import type { Habit } from "../types/habit";
import styles from "./HabitItem.module.css";

type HabitItemProps = {
  habit: Habit;
  onToggle: (id: string) => void;
};

const ICONS: Record<string, ReactNode> = {
  "drink-water": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path
        d="M12 3 C 14 7 18 11 18 15 a 6 6 0 0 1 -12 0 C 6 11 10 7 12 3 Z"
        strokeLinejoin="round"
      />
    </svg>
  ),
  "morning-stretch": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="4.5" r="1.8" />
      <path d="M5 9 L 12 8 L 19 9" strokeLinecap="round" />
      <path d="M12 8 L 12 15" strokeLinecap="round" />
      <path d="M12 15 L 8 21" strokeLinecap="round" />
      <path d="M12 15 L 16 21" strokeLinecap="round" />
    </svg>
  ),
  "read-20-min": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 5 H 11 a 2 2 0 0 1 2 2 V 20 H 5 a 2 2 0 0 1 -2 -2 Z" strokeLinejoin="round" />
      <path d="M21 5 H 13 a 2 2 0 0 0 -2 2 V 20 H 19 a 2 2 0 0 0 2 -2 Z" strokeLinejoin="round" />
    </svg>
  ),
  "no-screen-1hr": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="5" width="18" height="12" rx="1.5" strokeLinejoin="round" />
      <path d="M9 20 H 15" strokeLinecap="round" />
      <path d="M7 8 L 17 16" strokeLinecap="round" />
    </svg>
  ),
  "sleep-by-11pm": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path
        d="M20 14.5 A 8 8 0 1 1 9.5 4 A 6 6 0 0 0 20 14.5 Z"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export function HabitItem({ habit, onToggle }: HabitItemProps) {
  const rowClass = `${styles.row} ${habit.completed ? styles.checked : ""}`;
  return (
    <label className={rowClass}>
      <input
        type="checkbox"
        checked={habit.completed}
        onChange={() => onToggle(habit.id)}
        className={styles.input}
      />
      <span className={styles.box} aria-hidden="true">
        <svg className={styles.checkmark} viewBox="0 0 16 16">
          <path d="M3 8.5 L 7 12 L 13 4.5" />
        </svg>
      </span>
      <span className={styles.label}>{habit.label}</span>
      <span className={styles.icon} aria-hidden="true">
        {ICONS[habit.id]}
      </span>
    </label>
  );
}
