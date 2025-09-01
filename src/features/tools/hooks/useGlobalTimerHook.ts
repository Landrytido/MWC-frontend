import { useEffect, useCallback, useRef } from "react";
import { TimerMode, TimerLap, TimerPreset } from "../types/timer";
import { TimerService } from "../services/timerService";
import { useGlobalTimer } from "../../../shared/contexts/AppContext";

export const useGlobalTimerHook = () => {
  const { timer, updateTimer } = useGlobalTimer();
  const intervalRef = useRef<number | null>(null);

  // Fonction pour mettre à jour le temps
  const updateTime = useCallback(() => {
    if (!timer.isRunning || !timer.startTime) return;

    const now = Date.now();
    const elapsed = now - timer.startTime + timer.pausedTime;

    if (timer.mode === "stopwatch") {
      updateTimer({ time: elapsed });
    } else {
      // Mode countdown
      const remaining = Math.max(0, timer.targetTime - elapsed);

      // Vérifier si le temps est écoulé
      if (remaining === 0 && timer.time > 0) {
        // Timer terminé !
        const settings = TimerService.getSettings();

        if (settings.soundEnabled) {
          TimerService.playAlarmSound();
        }

        if (settings.notificationsEnabled) {
          TimerService.showNotification(
            "Timer terminé !",
            `Le minuteur de ${TimerService.formatTimeCompact(
              timer.targetTime
            )} est terminé.`
          );
        }

        updateTimer({
          time: 0,
          isRunning: false,
          startTime: null,
          pausedTime: 0,
        });
      } else {
        updateTimer({ time: remaining });
      }
    }
  }, [
    timer.isRunning,
    timer.startTime,
    timer.pausedTime,
    timer.mode,
    timer.targetTime,
    timer.time,
    updateTimer,
  ]);

  // Démarrer l'interval quand le timer est en marche
  useEffect(() => {
    if (timer.isRunning) {
      intervalRef.current = setInterval(updateTime, 10); // Mise à jour toutes les 10ms pour la précision
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
  }, [timer.isRunning, updateTime]);

  // Changer de mode
  const switchMode = useCallback(
    (mode: TimerMode) => {
      // Si le timer est actif (en cours ou en pause), ne pas permettre le changement
      if (timer.isRunning || timer.isPaused) {
        return false; // Indique que le changement n'a pas été effectué
      }

      // Sinon, changer de mode sans reset
      updateTimer({
        mode,
        targetTime: mode === "countdown" ? 5 * 60 * 1000 : 0, // 5 minutes par défaut
        time: mode === "countdown" ? 5 * 60 * 1000 : 0,
      });

      return true; // Indique que le changement a été effectué
    },
    [timer.isRunning, timer.isPaused, updateTimer]
  );

  // Forcer le changement de mode (avec reset)
  const forceSwitchMode = useCallback(
    (mode: TimerMode) => {
      updateTimer({
        mode,
        isRunning: false,
        isPaused: false,
        time: mode === "countdown" ? 5 * 60 * 1000 : 0,
        targetTime: mode === "countdown" ? 5 * 60 * 1000 : 0,
        startTime: null,
        pausedTime: 0,
        laps: [],
      });
    },
    [updateTimer]
  );

  // Démarrer/Reprendre
  const start = useCallback(() => {
    if (timer.isPaused) {
      // Reprendre après pause
      updateTimer({
        isRunning: true,
        isPaused: false,
        startTime: Date.now(),
      });
    } else {
      // Premier démarrage
      if (timer.mode === "countdown" && timer.targetTime === 0) {
        return; // Ne peut pas démarrer un minuteur sans temps
      }

      updateTimer({
        isRunning: true,
        isPaused: false,
        startTime: Date.now(),
        pausedTime: 0,
        time: timer.mode === "countdown" ? timer.targetTime : 0,
      });
    }
  }, [timer.isPaused, timer.mode, timer.targetTime, updateTimer]);

  // Pause
  const pause = useCallback(() => {
    if (timer.isRunning && timer.startTime) {
      const now = Date.now();
      const additionalTime = now - timer.startTime;

      updateTimer({
        isRunning: false,
        isPaused: true,
        pausedTime: timer.pausedTime + additionalTime,
        startTime: null,
      });
    }
  }, [timer.isRunning, timer.startTime, timer.pausedTime, updateTimer]);

  // Reset
  const reset = useCallback(() => {
    updateTimer({
      isRunning: false,
      isPaused: false,
      time: timer.mode === "countdown" ? timer.targetTime : 0,
      startTime: null,
      pausedTime: 0,
      laps: [],
    });
  }, [timer.mode, timer.targetTime, updateTimer]);

  // Ajouter un tour (chronomètre seulement)
  const addLap = useCallback(() => {
    if (timer.mode !== "stopwatch" || !timer.isRunning) return;

    const totalTime = timer.time;
    const previousLapTime =
      timer.laps.length > 0 ? timer.laps[timer.laps.length - 1].totalTime : 0;
    const lapTime = totalTime - previousLapTime;

    const newLap: TimerLap = {
      id: `lap-${Date.now()}`,
      lapTime,
      totalTime,
      timestamp: new Date(),
    };

    updateTimer({
      laps: [...timer.laps, newLap],
    });
  }, [timer.mode, timer.isRunning, timer.time, timer.laps, updateTimer]);

  // Définir le temps cible (minuteur seulement)
  const setTargetTime = useCallback(
    (hours: number, minutes: number, seconds: number) => {
      const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
      updateTimer({
        targetTime: totalMs,
        time: timer.isRunning ? timer.time : totalMs,
      });
    },
    [timer.isRunning, timer.time, updateTimer]
  );

  // Charger un préréglage
  const loadPreset = useCallback(
    (preset: TimerPreset) => {
      if (timer.isRunning) return; // Ne peut pas charger pendant que le timer tourne

      updateTimer({
        mode: "countdown",
        targetTime: preset.duration,
        time: preset.duration,
      });
    },
    [timer.isRunning, updateTimer]
  );

  // Gérer les préréglages
  const addPreset = useCallback((name: string, duration: number) => {
    return TimerService.addPreset(name, duration);
  }, []);

  const deletePreset = useCallback((id: string) => {
    return TimerService.deletePreset(id);
  }, []);

  const getPresets = useCallback(() => {
    return TimerService.getPresets();
  }, []);

  // Effacer les tours
  const clearLaps = useCallback(() => {
    updateTimer({ laps: [] });
  }, [updateTimer]);

  // Formatage
  const formatTime = useCallback((ms: number) => {
    return TimerService.formatTime(ms);
  }, []);

  const formatTimeCompact = useCallback((ms: number) => {
    return TimerService.formatTimeCompact(ms);
  }, []);

  const timeToInputs = useCallback((ms: number) => {
    return TimerService.timeToInputs(ms);
  }, []);

  // États calculés
  const canStart = !timer.isRunning;
  const canPause = timer.isRunning && !timer.isPaused;
  const canReset = timer.isRunning || timer.isPaused || timer.time > 0;
  const canLap = timer.mode === "stopwatch" && timer.isRunning;
  const isFinished =
    timer.mode === "countdown" && timer.time === 0 && timer.targetTime > 0;

  return {
    // État
    mode: timer.mode,
    isRunning: timer.isRunning,
    isPaused: timer.isPaused,
    time: timer.time,
    targetTime: timer.targetTime,
    laps: timer.laps,
    presets: getPresets(),

    // Actions
    switchMode,
    forceSwitchMode,
    start,
    pause,
    reset,
    addLap,
    setTargetTime,
    loadPreset,
    addPreset,
    deletePreset,
    clearLaps,

    // Utilitaires
    formatTime,
    formatTimeCompact,
    timeToInputs,

    // États calculés
    canStart,
    canPause,
    canReset,
    canLap,
    isFinished,
  };
};
