import { TimerLap, TimerPreset, TimerSettings } from "../types/timer";

export class TimerService {
  private static readonly STORAGE_KEY = "timer-settings";
  private static readonly PRESETS_KEY = "timer-presets";
  private static readonly LAPS_KEY = "timer-laps";

  static formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  }

  static formatTimeCompact(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }

  static parseTimeInput(
    hours: number,
    minutes: number,
    seconds: number
  ): number {
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }

  static timeToInputs(milliseconds: number): {
    hours: number;
    minutes: number;
    seconds: number;
  } {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds };
  }

  static getDefaultPresets(): TimerPreset[] {
    return [
      {
        id: "default-pomodoro",
        name: "Pomodoro",
        duration: 25 * 60 * 1000,
        isDefault: true,
      },
      {
        id: "default-short-break",
        name: "Pause courte",
        duration: 5 * 60 * 1000,
        isDefault: true,
      },
      {
        id: "default-long-break",
        name: "Pause longue",
        duration: 15 * 60 * 1000,
        isDefault: true,
      },
    ];
  }

  static getPresets(): TimerPreset[] {
    try {
      const stored = localStorage.getItem(this.PRESETS_KEY);
      const presets = stored ? (JSON.parse(stored) as TimerPreset[]) : [];

      if (!Array.isArray(presets) || presets.length === 0) {
        const defaults = this.getDefaultPresets();
        this.savePresets(defaults);
        return defaults;
      }

      const defaultIds = this.getDefaultPresets().map((d) => d.id);
      const hasAnyDefault = presets.some(
        (p) => p.isDefault && defaultIds.includes(p.id)
      );

      if (!hasAnyDefault) {
        const custom = presets.filter((p) => !p.isDefault);
        const merged = [...this.getDefaultPresets(), ...custom];
        this.savePresets(merged);
        return merged;
      }

      return presets;
    } catch {
      return this.getDefaultPresets();
    }
  }

  static savePresets(presets: TimerPreset[]): void {
    try {
      localStorage.setItem(this.PRESETS_KEY, JSON.stringify(presets));
    } catch {
      // Erreur silencieuse
    }
  }

  static addPreset(name: string, duration: number): TimerPreset {
    const stored = localStorage.getItem(this.PRESETS_KEY);
    const presets = stored ? (JSON.parse(stored) as TimerPreset[]) : [];

    const newPreset: TimerPreset = {
      id: Date.now().toString(),
      name,
      duration,
      isDefault: false,
    };

    presets.push(newPreset);
    this.savePresets(presets);
    return newPreset;
  }

  static deletePreset(id: string): boolean {
    const presets = this.getPresets();
    const preset = presets.find((p) => p.id === id);
    if (!preset) return false;
    if (preset.isDefault) return false;

    const filtered = presets.filter((p) => p.id !== id);
    this.savePresets(filtered);
    return true;
  }

  static resetToDefaultPresets(): void {
    const custom = this.getPresets().filter((p) => !p.isDefault);
    const merged = [...this.getDefaultPresets(), ...custom];
    this.savePresets(merged);
  }

  static saveLap(lap: TimerLap): void {
    try {
      const stored = localStorage.getItem(this.LAPS_KEY);
      const laps = stored ? (JSON.parse(stored) as TimerLap[]) : [];
      laps.unshift(lap);
      if (laps.length > 50) laps.splice(50);
      localStorage.setItem(this.LAPS_KEY, JSON.stringify(laps));
    } catch {
      // Erreur silencieuse
    }
  }

  static getLaps(): TimerLap[] {
    try {
      const stored = localStorage.getItem(this.LAPS_KEY);
      return stored ? (JSON.parse(stored) as TimerLap[]) : [];
    } catch {
      return [];
    }
  }

  static clearLaps(): void {
    try {
      localStorage.setItem(this.LAPS_KEY, JSON.stringify([]));
    } catch {
      // Erreur silencieuse
    }
  }

  static getSettings(): TimerSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const settings = stored
        ? (JSON.parse(stored) as Partial<TimerSettings>)
        : {};

      return {
        soundEnabled: settings.soundEnabled ?? true,
        notificationsEnabled: settings.notificationsEnabled ?? true,
        autoStart: settings.autoStart ?? false,
        defaultPresets: settings.defaultPresets ?? this.getDefaultPresets(),
      };
    } catch {
      return {
        soundEnabled: true,
        notificationsEnabled: true,
        autoStart: false,
        defaultPresets: this.getDefaultPresets(),
      };
    }
  }

  static saveSettings(settings: TimerSettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Erreur silencieuse
    }
  }

  static async requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  static showNotification(title: string, body: string): void {
    try {
      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
        });
      }
    } catch {
      // Erreur silencieuse
    }
  }

  static playAlarmSound(): void {
    try {
      const win = window as unknown as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const AudioContextConstructor =
        win.AudioContext || win.webkitAudioContext;
      if (!AudioContextConstructor) return;
      const audioContext = new AudioContextConstructor();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch {
      // Erreur silencieuse
    }
  }
}
