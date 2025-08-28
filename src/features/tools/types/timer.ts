// Types pour le Timer unifié (chrono + minuteur)
export type TimerMode = "stopwatch" | "countdown";

export interface TimerState {
  mode: TimerMode;
  isRunning: boolean;
  isPaused: boolean;
  time: number; // en millisecondes
  targetTime: number; // pour le minuteur (en millisecondes)
  startTime: number | null;
  pausedTime: number;
  laps: TimerLap[];
}

export interface TimerLap {
  id: string;
  lapTime: number; // temps du tour
  totalTime: number; // temps total au moment du tour
  timestamp: Date;
}

export interface TimerPreset {
  id: string;
  name: string;
  duration: number; // en millisecondes
  isDefault: boolean;
}

export interface TimerSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  autoStart: boolean;
  defaultPresets: TimerPreset[];
}
