import { useEffect, useState } from "react";
import type { Habit } from "../types/habit";
import { HabitItem } from "./HabitItem";
import styles from "./HabitPanel.module.css";

type HabitPanelProps = {
  habits: Habit[];
  date: string;
  onToggle: (id: string) => void;
  onResetDay: () => void;
  onAddHabit: (label: string) => void;
  onUpdateHabitLabel: (id: string, label: string) => void;
  onDeleteHabit: (id: string) => void;
  /** When true, panel fills its own desktop widget window. */
  fillWindow?: boolean;
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
  onAddHabit,
  onUpdateHabitLabel,
  onDeleteHabit,
  fillWindow = false,
}: HabitPanelProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [draftLabels, setDraftLabels] = useState<Record<string, string>>({});
  const [newHabitDraft, setNewHabitDraft] = useState("");

  useEffect(() => {
    if (!isEditMode) return;
    setDraftLabels((prev) => {
      const next: Record<string, string> = {};
      habits.forEach((habit) => {
        next[habit.id] = prev[habit.id] ?? habit.label;
      });
      return next;
    });
  }, [habits, isEditMode]);

  const enterEditMode = () => {
    const initialDrafts: Record<string, string> = {};
    habits.forEach((habit) => {
      initialDrafts[habit.id] = habit.label;
    });
    setDraftLabels(initialDrafts);
    setIsEditMode(true);
  };

  const saveLabelDraft = (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;
    const draft = draftLabels[id] ?? habit.label;
    const normalized = draft.trim();

    if (!normalized) {
      setDraftLabels((prev) => ({ ...prev, [id]: habit.label }));
      return;
    }

    if (normalized !== habit.label) {
      onUpdateHabitLabel(id, normalized);
    }

    setDraftLabels((prev) => ({ ...prev, [id]: normalized }));
  };

  const doneEditing = () => {
    habits.forEach((habit) => saveLabelDraft(habit.id));
    setIsEditMode(false);
    setNewHabitDraft("");
  };

  const addHabitFromDraft = () => {
    const normalized = newHabitDraft.trim();
    if (!normalized) return;
    onAddHabit(normalized);
    setNewHabitDraft("");
  };

  const deleteHabit = (id: string) => {
    setDraftLabels((prev) => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
    onDeleteHabit(id);
  };

  return (
    <section
      className={fillWindow ? `${styles.panel} ${styles.fillWindow}` : styles.panel}
      aria-label="Habit tracker"
    >
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
        <div className={styles.headerActions}>
          <span className={styles.date}>{formatDate(date)}</span>
          {!isEditMode ? (
            <button
              type="button"
              className={styles.editButton}
              onClick={enterEditMode}
              aria-label="Edit habits"
            >
              Edit
            </button>
          ) : (
            <button
              type="button"
              className={styles.editButton}
              onClick={doneEditing}
            >
              Done
            </button>
          )}
        </div>
      </header>

      <ul className={styles.list}>
        {!isEditMode &&
          habits.map((habit) => (
            <li key={habit.id} className={styles.listItem}>
              <HabitItem habit={habit} onToggle={onToggle} />
            </li>
          ))}

        {isEditMode &&
          habits.map((habit) => (
            <li key={habit.id} className={styles.listItem}>
              <div className={styles.editRow}>
                <input
                  type="text"
                  value={draftLabels[habit.id] ?? ""}
                  onChange={(event) =>
                    setDraftLabels((prev) => ({
                      ...prev,
                      [habit.id]: event.target.value,
                    }))
                  }
                  onBlur={() => saveLabelDraft(habit.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      saveLabelDraft(habit.id);
                      (event.currentTarget as HTMLInputElement).blur();
                    }
                  }}
                  className={styles.editInput}
                  aria-label={`Edit label for ${habit.label}`}
                />
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => deleteHabit(habit.id)}
                  aria-label={`Delete ${habit.label}`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
      </ul>

      <div className={styles.footer}>
        {isEditMode && (
          <div className={styles.addHabitRow}>
            <input
              type="text"
              value={newHabitDraft}
              onChange={(event) => setNewHabitDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addHabitFromDraft();
                }
              }}
              className={styles.editInput}
              placeholder="New habit"
              aria-label="New habit label"
            />
            <button
              type="button"
              className={styles.addButton}
              onClick={addHabitFromDraft}
              disabled={!newHabitDraft.trim()}
            >
              Add habit
            </button>
          </div>
        )}
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
