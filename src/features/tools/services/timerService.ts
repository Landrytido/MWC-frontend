import { TimerLap, TimerPreset, TimerSettings } from "../types/timer";

export class TimerService {
  private static readonly STORAGE_KEY = "timer-settings";
  private static readonly PRESETS_KEY = "timer-presets";
  private static readonly LAPS_KEY = "timer-laps";

  // Formatage du temps
  static formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10); // centièmes

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else {
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
    }
  }

  // Formatage compact (pour les minuteurs)
  static formatTimeCompact(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Conversion depuis les inputs utilisateur
  static parseTimeInput(
    hours: number,
    minutes: number,
    seconds: number
  ): number {
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }

  // Conversion vers les inputs utilisateur
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

  // Gestion des préréglages
  static getPresets(): TimerPreset[] {
    try {
      const stored = localStorage.getItem(this.PRESETS_KEY);
      const presets = stored ? JSON.parse(stored) : [];

      // Vérifier si on a les nouveaux préréglages par défaut
      const hasNewDefaults = presets.some(
        (p: TimerPreset) =>
          p.isDefault &&
          (p.name === "5 minutes" ||
            p.name === "15 minutes" ||
            p.name === "30 minutes")
      );

      // Si on n'a pas les nouveaux préréglages ou s'il n'y a pas de préréglages
      if (presets.length === 0 || !hasNewDefaults) {
        // Garder seulement les préréglages personnalisés (non par défaut)
        const customPresets = presets.filter((p: TimerPreset) => !p.isDefault);
        const defaultPresets = this.getDefaultPresets();
        const newPresets = [...defaultPresets, ...customPresets];
        this.savePresets(newPresets);
        return newPresets;
      }

      return presets;
    } catch {
      return this.getDefaultPresets();
    }
  }

  static getDefaultPresets(): TimerPreset[] {
    return [
      { id: "1", name: "5 minutes", duration: 5 * 60 * 1000, isDefault: true },
      {
        id: "2",
        name: "15 minutes",
        duration: 15 * 60 * 1000,
        isDefault: true,
      },
      {
        id: "3",
        name: "30 minutes",
        duration: 30 * 60 * 1000,
        isDefault: true,
      },
    ];
  }

  static savePresets(presets: TimerPreset[]): void {
    localStorage.setItem(this.PRESETS_KEY, JSON.stringify(presets));
  }

  static addPreset(name: string, duration: number): TimerPreset {
    const presets = this.getPresets();
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
    const presetToDelete = presets.find((p) => p.id === id);

    // Ne permettre la suppression que des préréglages personnalisés (pas les préréglages par défaut)
    if (!presetToDelete || presetToDelete.isDefault) {
      return false; // Impossible de supprimer un préréglage par défaut
    }

    const filteredPresets = presets.filter((p) => p.id !== id);
    this.savePresets(filteredPresets);
    return true; // Suppression réussie
  }

  static resetToDefaultPresets(): void {
    // Garder seulement les préréglages personnalisés
    const currentPresets = this.getPresets();
    const customPresets = currentPresets.filter((p) => !p.isDefault);
    const defaultPresets = this.getDefaultPresets();
    const newPresets = [...defaultPresets, ...customPresets];
    this.savePresets(newPresets);
  }

  // Gestion des tours (chronomètre)
  static saveLap(lap: TimerLap): void {
    const laps = this.getLaps();
    laps.unshift(lap); // Ajouter au début

    // Garder seulement les 50 derniers tours
    if (laps.length > 50) {
      laps.splice(50);
    }

    localStorage.setItem(this.LAPS_KEY, JSON.stringify(laps));
  }

  static getLaps(): TimerLap[] {
    try {
      const stored = localStorage.getItem(this.LAPS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static clearLaps(): void {
    localStorage.removeItem(this.LAPS_KEY);
  }

  // Gestion des paramètres
  static getSettings(): TimerSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const settings = stored ? JSON.parse(stored) : {};

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
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
  }

  // Notifications et son
  static async requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  static showNotification(title: string, body: string): void {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    }
  }

  static playAlarmSound(): void {
    // Son simple avec Web Audio API
    try {
      const AudioContextConstructor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextConstructor) {
        console.warn("Web Audio API non supportée");
        return;
      }

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
    } catch (error) {
      console.warn("Impossible de jouer le son:", error);
    }
  }
}
