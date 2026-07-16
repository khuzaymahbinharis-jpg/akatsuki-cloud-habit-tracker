import { useCallback, useEffect, useState } from "react";
import type { AppState } from "../types/habit";
import { DEFAULT_HABITS } from "../config/defaultHabits";
import { loadState, saveState } from "../lib/storage";
import { todayKey } from "../lib/date";
import { generateCloud } from "../lib/cloudPosition";

function normalizeLabel(label: string): string {
  return label.trim();
}

function createHabitId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `habit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function seedState(): AppState {
  return {
    version: 1,
    date: todayKey(),
    habits: DEFAULT_HABITS.map((h) => ({
      ...h,
      completed: false,
      cloud: undefined,
    })),
  };
}

function resetForNewDay(prev: AppState, today: string): AppState {
  return {
    ...prev,
    date: today,
    habits: prev.habits.map((h) => ({
      ...h,
      completed: false,
      cloud: undefined,
    })),
  };
}

function initialState(): AppState {
  const loaded = loadState();
  if (!loaded) return seedState();
  const today = todayKey();
  return loaded.date === today ? loaded : resetForNewDay(loaded, today);
}

export function useHabitState() {
  const [state, setState] = useState<AppState>(initialState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const checkAndResetIfNewDay = useCallback(() => {
    setState((prev) => {
      const today = todayKey();
      return prev.date === today ? prev : resetForNewDay(prev, today);
    });
  }, []);

  useEffect(() => {
    // Initial "on load" reset already happens in initialState() lazily,
    // so we only subscribe to refocus/visibility here.
    const onFocus = () => checkAndResetIfNewDay();
    const onVisibility = () => {
      if (document.visibilityState === "visible") checkAndResetIfNewDay();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [checkAndResetIfNewDay]);

  const toggleHabit = useCallback((id: string) => {
    setState((prev) => {
      const today = todayKey();
      const base = prev.date === today ? prev : resetForNewDay(prev, today);

      const habits = base.habits.map((h) => {
        if (h.id !== id) return h;
        if (h.completed) {
          return { ...h, completed: false, cloud: undefined };
        }
        const existingClouds = base.habits
          .filter((x) => x.id !== id && x.cloud)
          .map((x) => x.cloud!);
        return { ...h, completed: true, cloud: generateCloud(existingClouds) };
      });

      return { ...base, habits };
    });
  }, []);

  const resetDay = useCallback(() => {
    setState((prev) => ({
      ...prev,
      date: todayKey(),
      habits: prev.habits.map((h) => ({
        ...h,
        completed: false,
        cloud: undefined,
      })),
    }));
  }, []);

  const addHabit = useCallback((label: string) => {
    const normalized = normalizeLabel(label);
    if (!normalized) return;

    setState((prev) => ({
      ...prev,
      habits: [
        ...prev.habits,
        {
          id: createHabitId(),
          label: normalized,
          completed: false,
          cloud: undefined,
        },
      ],
    }));
  }, []);

  const updateHabitLabel = useCallback((id: string, nextLabel: string) => {
    const normalized = normalizeLabel(nextLabel);
    if (!normalized) return;

    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((habit) =>
        habit.id === id ? { ...habit, label: normalized } : habit,
      ),
    }));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.filter((habit) => habit.id !== id),
    }));
  }, []);

  return { state, toggleHabit, resetDay, addHabit, updateHabitLabel, deleteHabit };
}
