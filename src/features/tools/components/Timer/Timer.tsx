import React, { useState } from "react";
import { useGlobalTimerHook } from "../../hooks/useGlobalTimerHook";
import { useConfirmation } from "../../../../shared/hooks/useConfirmation";

export const Timer: React.FC = () => {
  const { confirm, ConfirmationComponent } = useConfirmation();
  const {
    mode,
    isRunning,
    isPaused,
    time,
    targetTime,
    laps,
    presets,
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
    formatTime,
    formatTimeCompact,
    timeToInputs,
    canStart,
    canPause,
    canReset,
    canLap,
    isFinished,
  } = useGlobalTimerHook();

  const [showPresets, setShowPresets] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [timeInputs, setTimeInputs] = useState(() => timeToInputs(targetTime));

  const handleTimeInputChange = (
    field: "hours" | "minutes" | "seconds",
    value: string
  ) => {
    const numValue = Math.max(0, Math.min(99, parseInt(value) || 0));
    const newInputs = { ...timeInputs, [field]: numValue };
    setTimeInputs(newInputs);
    setTargetTime(newInputs.hours, newInputs.minutes, newInputs.seconds);
  };

  const handleAddPreset = () => {
    if (newPresetName.trim() && targetTime > 0) {
      addPreset(newPresetName.trim(), targetTime);
      setNewPresetName("");
    }
  };

  const handleDeletePreset = async (presetId: string, presetName: string) => {
    const confirmed = await confirm({
      title: "Supprimer le préréglage",
      message: `Êtes-vous sûr de vouloir supprimer le préréglage "${presetName}" ?`,
      confirmText: "Supprimer",
      cancelText: "Annuler",
      variant: "danger",
    });

    if (confirmed) {
      const success = deletePreset(presetId);
      if (!success) {
        await confirm({
          title: "Suppression impossible",
          message: "Impossible de supprimer les préréglages par défaut.",
          confirmText: "OK",
          variant: "warning",
        });
      }
    }
  };

  const handleSwitchMode = async (newMode: "stopwatch" | "countdown") => {
    const success = switchMode(newMode);

    // Si le changement n'a pas pu être effectué (timer actif)
    if (!success) {
      const confirmed = await confirm({
        title: "Timer en cours",
        message: `Un ${
          mode === "stopwatch" ? "chronomètre" : "minuteur"
        } est actuellement en cours. Voulez-vous l'arrêter et changer de mode ?`,
        confirmText: "Oui, changer de mode",
        cancelText: "Annuler",
        variant: "warning",
      });

      if (confirmed) {
        forceSwitchMode(newMode);
      }
    }
  };

  const getProgressPercentage = () => {
    if (mode === "countdown" && targetTime > 0) {
      return ((targetTime - time) / targetTime) * 100;
    }
    return 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-w-2xl mx-auto border border-gray-200">
      {/* En-tête avec switch de mode */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-teal-100 p-2 rounded-lg">
            <svg
              className="w-5 h-5 text-teal-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Timer {mode === "stopwatch" ? "Chronomètre" : "Minuteur"}
          </h3>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleSwitchMode("stopwatch")}
            disabled={mode === "stopwatch"}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              mode === "stopwatch"
                ? "bg-teal-600 text-white"
                : "text-gray-600 hover:text-teal-600 disabled:opacity-50"
            }`}
          >
            Chrono
          </button>
          <button
            onClick={() => handleSwitchMode("countdown")}
            disabled={mode === "countdown"}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              mode === "countdown"
                ? "bg-teal-600 text-white"
                : "text-gray-600 hover:text-teal-600 disabled:opacity-50"
            }`}
          >
            Minuteur
          </button>
        </div>
      </div>

      {/* Affichage principal du temps */}
      <div className="text-center mb-6">
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div
            className={`text-4xl font-mono font-bold mb-3 ${
              isFinished
                ? "text-red-600"
                : isRunning
                ? "text-green-600"
                : isPaused
                ? "text-orange-600"
                : "text-gray-800"
            }`}
          >
            {formatTime(time)}
          </div>

          {/* Barre de progression pour le minuteur */}
          {mode === "countdown" && targetTime > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div
                className={`h-2 rounded-full transition-all duration-100 ${
                  isFinished ? "bg-red-500" : "bg-teal-600"
                }`}
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          )}

          {/* État actuel */}
          <div className="text-sm text-gray-600">
            {isFinished
              ? "🎉 Terminé !"
              : isRunning
              ? "▶️ En cours"
              : isPaused
              ? "⏸️ En pause"
              : "⏹️ Arrêté"}
          </div>
        </div>
      </div>

      {/* Configuration du minuteur */}
      {mode === "countdown" && !isRunning && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Régler le temps
          </h4>
          <div className="flex items-center gap-2 justify-center">
            <div className="text-center">
              <input
                type="number"
                min="0"
                max="99"
                value={timeInputs.hours}
                onChange={(e) => handleTimeInputChange("hours", e.target.value)}
                className="w-14 text-center border rounded px-2 py-1 text-lg font-mono"
              />
              <div className="text-xs text-gray-500 mt-1">h</div>
            </div>
            <span className="text-xl font-mono">:</span>
            <div className="text-center">
              <input
                type="number"
                min="0"
                max="59"
                value={timeInputs.minutes}
                onChange={(e) =>
                  handleTimeInputChange("minutes", e.target.value)
                }
                className="w-14 text-center border rounded px-2 py-1 text-lg font-mono"
              />
              <div className="text-xs text-gray-500 mt-1">m</div>
            </div>
            <span className="text-xl font-mono">:</span>
            <div className="text-center">
              <input
                type="number"
                min="0"
                max="59"
                value={timeInputs.seconds}
                onChange={(e) =>
                  handleTimeInputChange("seconds", e.target.value)
                }
                className="w-14 text-center border rounded px-2 py-1 text-lg font-mono"
              />
              <div className="text-xs text-gray-500 mt-1">s</div>
            </div>
          </div>
        </div>
      )}

      {/* Boutons de contrôle */}
      <div className="flex justify-center gap-2 mb-4">
        {canStart && (
          <button
            onClick={start}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
          >
            ▶️ {isPaused ? "Reprendre" : "Démarrer"}
          </button>
        )}

        {canPause && (
          <button
            onClick={pause}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
          >
            ⏸️ Pause
          </button>
        )}

        {canReset && (
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
          >
            ⏹️ Reset
          </button>
        )}

        {canLap && (
          <button
            onClick={addLap}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            🏁 Tour
          </button>
        )}
      </div>

      {/* Préréglages pour le minuteur */}
      {mode === "countdown" && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Préréglages</h4>
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="text-xs text-teal-600 hover:text-teal-800"
            >
              {showPresets ? "Masquer" : "Gérer"}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {presets
              .slice(0, showPresets ? presets.length : 6)
              .map((preset) => (
                <div key={preset.id} className="relative group">
                  <button
                    onClick={() => loadPreset(preset)}
                    className="w-full p-2 bg-gray-50 text-gray-800 rounded border border-gray-200 hover:bg-gray-100 transition-colors text-sm"
                  >
                    <div className="font-medium truncate">{preset.name}</div>
                    <div className="text-xs text-gray-500">
                      {formatTimeCompact(preset.duration)}
                    </div>
                  </button>

                  {showPresets && !preset.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePreset(preset.id, preset.name);
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title={`Supprimer "${preset.name}"`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
          </div>

          {showPresets && (
            <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Nom du préréglage"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
                <button
                  onClick={handleAddPreset}
                  className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700"
                >
                  Ajouter
                </button>
              </div>
              <div className="text-xs text-gray-500">
                Réglez d'abord le temps, puis ajoutez un préréglage
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tours (chronomètre uniquement) */}
      {mode === "stopwatch" && laps.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">
              Tours ({laps.length})
            </h4>
            <button
              onClick={clearLaps}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Effacer
            </button>
          </div>

          <div className="max-h-32 overflow-y-auto bg-gray-50 rounded border border-gray-200">
            {laps
              .slice()
              .reverse()
              .map((lap, index) => (
                <div
                  key={lap.id}
                  className="flex justify-between items-center px-3 py-2 border-b border-gray-200 last:border-b-0"
                >
                  <span className="text-sm font-medium">
                    Tour {laps.length - index}
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-mono">
                      {formatTime(lap.lapTime)}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {formatTime(lap.totalTime)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        {mode === "stopwatch"
          ? "Chronomètre : Mesurez le temps écoulé et enregistrez des tours"
          : "Minuteur : Compte à rebours avec alarme à la fin"}
      </div>

      <ConfirmationComponent />
    </div>
  );
};
