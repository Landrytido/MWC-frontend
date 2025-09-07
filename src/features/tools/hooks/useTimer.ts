import { useState, useEffect, useCallback, useRef } from "react";
import { TimerState, TimerMode, TimerLap, TimerPreset } from "../types/timer";
import { TimerService } from "../services/timerService";

const initialState: TimerState = {
  mode: "stopwatch",
  isRunning: false,
  isPaused: false,
  time: 0,
  targetTime: 0,
  startTime: null,
  pausedTime: 0,
  laps: [],
};

export const useTimer = () => {
  const [state, setState] = useState<TimerState>(initialState);
  const intervalRef = useRef<number | null>(null);
  const [presets, setPresets] = useState<TimerPreset[]>(() =>
    TimerService.getPresets()
  );

  const updateTime = useCallback(() => {
    setState((prev) => {
      if (!prev.isRunning || !prev.startTime) return prev;

      const now = Date.now();
      const elapsed = now - prev.startTime + prev.pausedTime;

      if (prev.mode === "stopwatch") {
        return { ...prev, time: elapsed };
      } else {
        const remaining = Math.max(0, prev.targetTime - elapsed);

        if (remaining === 0 && prev.time > 0) {
          const settings = TimerService.getSettings();

          if (settings.soundEnabled) {
            TimerService.playAlarmSound();
          }

          if (settings.notificationsEnabled) {
            TimerService.showNotification(
              "Timer terminé !",
              `Le minuteur de ${TimerService.formatTimeCompact(
                prev.targetTime
              )} est terminé.`
            );
          }

          return {
            ...prev,
            time: 0,
            isRunning: false,
            startTime: null,
            pausedTime: 0,
          };
        }

        return { ...prev, time: remaining };
      }
    });
  }, []);

  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(updateTime, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, updateTime]);

  const switchMode = useCallback((mode: TimerMode) => {
    setState({
      ...initialState,
      mode,
      targetTime: mode === "countdown" ? 5 * 60 * 1000 : 0,
    });
  }, []);

  const start = useCallback(() => {
    setState((prev) => {
      if (prev.isPaused) {
        return {
          ...prev,
          isRunning: true,
          isPaused: false,
          startTime: Date.now() - prev.pausedTime,
        };
      } else {
        return {
          ...prev,
          isRunning: true,
          startTime: Date.now(),
          pausedTime: 0,
          time: prev.mode === "countdown" ? prev.targetTime : 0,
        };
      }
    });
  }, []);

  const pause = useCallback(() => {
    setState((prev) => {
      if (!prev.isRunning) return prev;

      const now = Date.now();
      const newPausedTime = prev.startTime
        ? now - prev.startTime + prev.pausedTime
        : 0;

      return {
        ...prev,
        isRunning: false,
        isPaused: true,
        pausedTime: newPausedTime,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      time: prev.mode === "countdown" ? prev.targetTime : 0,
      startTime: null,
      pausedTime: 0,
      laps: [],
    }));
  }, []);

  const addLap = useCallback(() => {
    setState((prev) => {
      if (prev.mode !== "stopwatch" || !prev.isRunning) return prev;

      const lapTime =
        prev.laps.length > 0
          ? prev.time - prev.laps[prev.laps.length - 1].totalTime
          : prev.time;

      const lap: TimerLap = {
        id: Date.now().toString(),
        lapTime,
        totalTime: prev.time,
        timestamp: new Date(),
      };

      TimerService.saveLap(lap);

      return {
        ...prev,
        laps: [...prev.laps, lap],
      };
    });
  }, []);

  const setTargetTime = useCallback(
    (hours: number, minutes: number, seconds: number) => {
      const targetTime = TimerService.parseTimeInput(hours, minutes, seconds);
      setState((prev) => ({
        ...prev,
        targetTime,
        time: targetTime,
      }));
    },
    []
  );

  const loadPreset = useCallback((preset: TimerPreset) => {
    setState((prev) => ({
      ...prev,
      mode: "countdown",
      targetTime: preset.duration,
      time: preset.duration,
      isRunning: false,
      isPaused: false,
      startTime: null,
      pausedTime: 0,
    }));
  }, []);

  const addPreset = useCallback((name: string, duration: number) => {
    const newPreset = TimerService.addPreset(name, duration);
    setPresets(TimerService.getPresets());
    return newPreset;
  }, []);

  const deletePreset = useCallback((id: string): boolean => {
    const success = TimerService.deletePreset(id);
    if (success) {
      setPresets(TimerService.getPresets());
    }
    return success;
  }, []);

  const clearLaps = useCallback(() => {
    TimerService.clearLaps();
    setState((prev) => ({ ...prev, laps: [] }));
  }, []);

  return {
    mode: state.mode,
    isRunning: state.isRunning,
    isPaused: state.isPaused,
    time: state.time,
    targetTime: state.targetTime,
    laps: state.laps,
    presets,

    switchMode,
    start,
    pause,
    reset,
    addLap,
    setTargetTime,
    loadPreset,
    addPreset,
    deletePreset,
    clearLaps,

    formatTime: TimerService.formatTime,
    formatTimeCompact: TimerService.formatTimeCompact,
    timeToInputs: TimerService.timeToInputs,

    canStart:
      !state.isRunning && (state.mode === "stopwatch" || state.targetTime > 0),
    canPause: state.isRunning,
    canReset: state.time > 0 || state.isPaused,
    canLap: state.mode === "stopwatch" && state.isRunning && state.time > 0,
    isFinished:
      state.mode === "countdown" && state.time === 0 && !state.isRunning,
  };
};
