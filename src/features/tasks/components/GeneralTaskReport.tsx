import React, { useState, useEffect } from "react";
import { tasksApi } from "../api";
import { ApiTaskSummary } from "../types";

interface GeneralTaskReportProps {
  className?: string;
}

const GeneralTaskReport: React.FC<GeneralTaskReportProps> = ({
  className = "",
}) => {
  const [summaryData, setSummaryData] = useState<ApiTaskSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadSummary = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await tasksApi.getSummary();
      setSummaryData(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur inconnue lors du chargement des statistiques";
      setError(
        errorMessage || "Erreur lors du chargement des statistiques générales",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const CircularChart: React.FC<{
    completed: number;
    total: number;
    size?: number;
  }> = ({ completed, total, size = 160 }) => {
    if (total === 0) {
      return (
        <div
          className="flex items-center justify-center bg-gray-100 rounded-full text-gray-400"
          style={{ width: size, height: size }}
        >
          <span className="text-sm">Aucune donnée</span>
        </div>
      );
    }

    const percentage = (completed / total) * 100;
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#10b981"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-gray-900">
            {percentage.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500 text-center">
            {completed}/{total}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12 text-red-500 bg-red-50 rounded-xl border border-red-200">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-sm">{error}</p>
          <button
            onClick={loadSummary}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <p>Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  const completionPercentage =
    summaryData.totalTasks > 0
      ? (summaryData.completedTasks / summaryData.totalTasks) * 100
      : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-gray-800">
          📊 Vue générale - Toutes les tâches
        </h3>
        <p className="text-sm text-gray-500 mt-2">Statistiques all-time</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 transition-transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {summaryData.totalTasks}
              </div>
              <div className="text-sm text-blue-700 font-medium">
                Total des tâches
              </div>
            </div>
            <div className="text-blue-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 transition-transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-600">
                {summaryData.completedTasks}
              </div>
              <div className="text-sm text-green-700 font-medium">
                Tâches complétées
              </div>
            </div>
            <div className="text-green-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 transition-transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-orange-600">
                {summaryData.overdueTasks}
              </div>
              <div className="text-sm text-orange-700 font-medium">
                Tâches en retard
              </div>
            </div>
            <div className="text-orange-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 transition-transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {completionPercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-purple-700 font-medium">
                Taux de complétion
              </div>
            </div>
            <div className="text-purple-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Chart & Summary */}
      {summaryData.totalTasks > 0 && (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-6">
            Vue d'ensemble du taux de complétion
          </h4>

          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0 lg:space-x-8">
            <div className="flex flex-col items-center">
              <CircularChart
                completed={summaryData.completedTasks}
                total={summaryData.totalTasks}
              />
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-600">Progression globale</div>
                <div className="text-xs text-gray-500">
                  {summaryData.completedTasks} sur {summaryData.totalTasks}{" "}
                  tâches
                </div>
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">
                      Tâches complétées
                    </span>
                    <span className="font-semibold text-green-600">
                      {completionPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium transition-all duration-1000"
                      style={{
                        width: `${Math.max(completionPercentage, 5)}%`,
                      }}
                    >
                      {completionPercentage > 20 &&
                        `${completionPercentage.toFixed(0)}%`}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>
                      Complétées: <strong>{summaryData.completedTasks}</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>
                      En retard: <strong>{summaryData.overdueTasks}</strong>
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 mt-4 text-xs text-gray-600">
                  <p>
                    📅 Aujourd'hui: <strong>{summaryData.todayTasks}</strong>{" "}
                    tâche(s)
                  </p>
                  <p>
                    📆 Demain: <strong>{summaryData.tomorrowTasks}</strong>{" "}
                    tâche(s)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {summaryData.totalTasks === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
          <div className="mb-4 text-6xl">📊</div>
          <h3 className="text-xl font-semibold mb-2">
            Aucune donnée disponible
          </h3>
          <p className="text-lg mb-2">Pas de tâches créées pour l'instant</p>
          <p className="text-sm">
            Commencez à créer des tâches pour voir vos statistiques !
          </p>
        </div>
      )}
    </div>
  );
};

export default GeneralTaskReport;
