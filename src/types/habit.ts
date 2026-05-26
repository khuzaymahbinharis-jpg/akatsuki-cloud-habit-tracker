export type CloudInstance = {
  x: number;
  y: number;
  variant: number;
  scale: number;
  rotation: number;
  // Optional fields added in v1.1. Older saved clouds (without these)
  // still render fine via defaults inside <Cloud />.
  opacity?: number;
  flipped?: boolean;
};

export type Habit = {
  id: string;
  label: string;
  completed: boolean;
  cloud?: CloudInstance;
};

export type AppState = {
  version: 1;
  date: string;
  habits: Habit[];
};
