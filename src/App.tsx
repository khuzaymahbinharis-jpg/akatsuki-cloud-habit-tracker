import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Wallpaper } from "./components/Wallpaper";
import { CloudLayer } from "./components/CloudLayer";
import { Cloud } from "./components/Cloud";
import { HabitPanel } from "./components/HabitPanel";
import { useHabitState } from "./hooks/useHabitState";
import {
  cloudsFromHabits,
  isTauriRuntime,
  parseCloudFromLocation,
} from "./lib/desktop";
import { reattachWidgets, syncCloudWindows } from "./lib/tauriBridge";
import type { CloudInstance } from "./types/habit";

type DesktopMode = "loading" | "web" | "panel" | "cloud";

function useDesktopMode(): { mode: DesktopMode; cloud: CloudInstance | null } {
  const [mode, setMode] = useState<DesktopMode>("loading");
  const [cloud, setCloud] = useState<CloudInstance | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      const fromLocation = parseCloudFromLocation();
      if (fromLocation) {
        if (!cancelled) {
          setCloud(fromLocation);
          setMode("cloud");
          document.documentElement.dataset.widget = "cloud";
        }
        return;
      }

      if (!isTauriRuntime()) {
        if (!cancelled) setMode("web");
        return;
      }

      try {
        const label = getCurrentWindow().label;
        if (label.startsWith("cloud-")) {
          const parsed = parseCloudFromLocation();
          if (!cancelled) {
            setCloud(parsed);
            setMode("cloud");
            document.documentElement.dataset.widget = "cloud";
          }
          return;
        }
        if (!cancelled) {
          setMode("panel");
          document.documentElement.dataset.widget = "panel";
        }
      } catch {
        if (!cancelled) setMode("web");
      }
    }

    void detect();
    return () => {
      cancelled = true;
    };
  }, []);

  return { mode, cloud };
}

function WebApp() {
  const { state, toggleHabit, resetDay, addHabit, updateHabitLabel, deleteHabit } =
    useHabitState();

  return (
    <>
      <Wallpaper />
      <CloudLayer habits={state.habits} />
      <HabitPanel
        habits={state.habits}
        date={state.date}
        onToggle={toggleHabit}
        onResetDay={resetDay}
        onAddHabit={addHabit}
        onUpdateHabitLabel={updateHabitLabel}
        onDeleteHabit={deleteHabit}
      />
    </>
  );
}

function PanelWidget() {
  const { state, toggleHabit, resetDay, addHabit, updateHabitLabel, deleteHabit } =
    useHabitState();

  useEffect(() => {
    const specs = cloudsFromHabits(state.habits);
    void syncCloudWindows(specs).catch((err) => {
      console.error("sync_cloud_windows failed", err);
    });
  }, [state.habits]);

  useEffect(() => {
    void reattachWidgets().catch(() => {
      /* ignore before Rust is ready */
    });
  }, []);

  return (
    <div className="panel-widget-root">
      <HabitPanel
        habits={state.habits}
        date={state.date}
        onToggle={toggleHabit}
        onResetDay={resetDay}
        onAddHabit={addHabit}
        onUpdateHabitLabel={updateHabitLabel}
        onDeleteHabit={deleteHabit}
        fillWindow
      />
    </div>
  );
}

function CloudWidget({ cloud }: { cloud: CloudInstance | null }) {
  if (!cloud) {
    return <div className="cloud-widget-root" />;
  }
  return (
    <div className="cloud-widget-root">
      <Cloud cloud={cloud} standalone />
    </div>
  );
}

export default function App() {
  const { mode, cloud } = useDesktopMode();

  if (mode === "loading") return null;
  if (mode === "cloud") return <CloudWidget cloud={cloud} />;
  if (mode === "panel") return <PanelWidget />;
  return <WebApp />;
}
