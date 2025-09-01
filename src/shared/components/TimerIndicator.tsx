import React from "react";
import { useGlobalTimer } from "../contexts/AppContext";

export const TimerIndicator: React.FC = () => {
  const { timer } = useGlobalTimer();

  // Ne rien afficher si le timer n'est pas actif
  if (!timer.isRunning && !timer.isPaused) {
    return null;
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getStatusIcon = () => {
    if (timer.isRunning) {
      return "▶️";
    } else if (timer.isPaused) {
      return "⏸️";
    }
    return "⏹️";
  };

  const getStatusColor = () => {
    if (timer.isRunning) {
      return "text-green-600";
    } else if (timer.isPaused) {
      return "text-orange-600";
    }
    return "text-gray-600";
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-200">
      <div className="bg-teal-100 p-1 rounded">
        <svg
          className="w-4 h-4 text-teal-600"
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
      <div className="flex items-center gap-1">
        <span className={`text-sm ${getStatusColor()}`}>{getStatusIcon()}</span>
        <span className="text-sm font-mono font-medium text-gray-800">
          {formatTime(timer.time)}
        </span>
        <span className="text-xs text-gray-500">
          {timer.mode === "stopwatch" ? "Chrono" : "Minuteur"}
        </span>
      </div>
    </div>
  );
};
