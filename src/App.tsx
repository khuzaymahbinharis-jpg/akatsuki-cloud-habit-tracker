import { Wallpaper } from "./components/Wallpaper";
import { CloudLayer } from "./components/CloudLayer";
import { HabitPanel } from "./components/HabitPanel";
import { useHabitState } from "./hooks/useHabitState";

export default function App() {
  const { state, toggleHabit, resetDay } = useHabitState();

  return (
    <>
      <Wallpaper />
      <CloudLayer habits={state.habits} />
      <HabitPanel
        habits={state.habits}
        date={state.date}
        onToggle={toggleHabit}
        onResetDay={resetDay}
      />
    </>
  );
}
