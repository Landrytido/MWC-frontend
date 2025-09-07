export type TimerMode = "stopwatch" | "countdown";

export interface TimerState {
  mode: TimerMode;
  isRunning: boolean;
  isPaused: boolean;
  time: number;
  targetTime: number;
  startTime: number | null;
  pausedTime: number;
  laps: TimerLap[];
}

export interface TimerLap {
  id: string;
  lapTime: number;
  totalTime: number;
  timestamp: Date;
}

export interface TimerPreset {
  id: string;
  name: string;
  duration: number;
  isDefault: boolean;
}

export interface TimerSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  autoStart: boolean;
  defaultPresets: TimerPreset[];
}
