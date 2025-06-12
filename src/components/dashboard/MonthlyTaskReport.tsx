import React, { useMemo, useState } from "react";
import { Task, TaskPriority, PRIORITY_LABELS } from "../types";

interface MonthlyTaskReportProps {
  tasks: Task[];
  className?: string;
}

const MonthlyTaskReport: React.FC<MonthlyTaskReportProps> = ({
  tasks,
  className = "",
}) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });

  const monthlyData = useMemo(() => {
    const { month, year } = selectedMonth;

    // Filtrer les tâches du mois sélectionné
    const monthTasks = tasks.filter((task) => {
      const taskDate = new Date(task.createdAt);
      return (
        taskDate.getMonth() + 1 === month && taskDate.getFullYear() === year
      );
    });

    const completedTasks = monthTasks.filter((task) => task.completed);
    const totalTasks = monthTasks.length;
    const completionPercentage =
      totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

    // Statistiques par priorité
    const tasksByPriority = {
      [TaskPriority.HIGH]: {
        total: monthTasks.filter((t) => t.priority === TaskPriority.HIGH)
          .length,
        completed: monthTasks.filter(
          (t) => t.priority === TaskPriority.HIGH && t.completed
        ).length,
      },
      [TaskPriority.MEDIUM]: {
        total: monthTasks.filter((t) => t.priority === TaskPriority.MEDIUM)
          .length,
        completed: monthTasks.filter(
          (t) => t.priority === TaskPriority.MEDIUM && t.completed
        ).length,
      },
      [TaskPriority.LOW]: {
        total: monthTasks.filter((t) => t.priority === TaskPriority.LOW).length,
        completed: monthTasks.filter(
          (t) => t.priority === TaskPriority.LOW && t.completed
        ).length,
      },
    };

    const dailyCompletion = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dayTasks = monthTasks.filter((task) => {
        const taskDate = new Date(task.createdAt);
        return taskDate.getDate() === day;
      });

      dailyCompletion.push({
        date: day.toString(),
        total: dayTasks.length,
        completed: dayTasks.filter((t) => t.completed).length,
      });
    }

    return {
      totalTasks,
      completedTasks: completedTasks.length,
      notCompletedTasks: totalTasks - completedTasks.length,
      completionPercentage,
      tasksByPriority,
      dailyCompletion,
    };
  }, [tasks, selectedMonth]);

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const handleMonthChange = (direction: "prev" | "next") => {
    setSelectedMonth((prev) => {
      if (direction === "prev") {
        return prev.month === 1
          ? { month: 12, year: prev.year - 1 }
          : { month: prev.month - 1, year: prev.year };
      } else {
        return prev.month === 12
          ? { month: 1, year: prev.year + 1 }
          : { month: prev.month + 1, year: prev.year };
      }
    });
  };

  // 🎯 Nouveau composant : Diagramme circulaire (Pie Chart)
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
          {/* Cercle de fond */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          {/* Cercle de progression */}
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

        {/* Texte central */}
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

  // Composant simple de graphique en barres (votre version existante améliorée)
  const SimpleBarChart: React.FC<{
    data: typeof monthlyData.dailyCompletion;
  }> = ({ data }) => {
    const maxValue = Math.max(...data.map((d) => d.total), 1);

    return (
      <div className="flex items-end space-x-1 h-32 overflow-x-auto pb-2">
        {data.slice(0, 31).map((day, index) => (
          <div
            key={index}
            className="flex flex-col items-center min-w-[20px] group"
          >
            <div className="flex flex-col-reverse h-24 w-4 bg-gray-100 rounded-sm transition-all duration-200 group-hover:shadow-sm">
              {day.total > 0 && (
                <>
                  <div
                    className="bg-gradient-to-t from-green-400 to-green-500 rounded-sm transition-all duration-300"
                    style={{ height: `${(day.completed / maxValue) * 100}%` }}
                    title={`${day.completed} complétées`}
                  />
                  <div
                    className="bg-gradient-to-t from-blue-300 to-blue-400 rounded-sm transition-all duration-300"
                    style={{
                      height: `${
                        ((day.total - day.completed) / maxValue) * 100
                      }%`,
                    }}
                    title={`${day.total - day.completed} en cours`}
                  />
                </>
              )}
            </div>
            <span className="text-xs text-gray-500 mt-1 group-hover:text-gray-700 transition-colors">
              {day.date}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Sélecteur de mois */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleMonthChange("prev")}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <h3 className="text-xl font-semibold text-gray-800">
            📊 Rapport mensuel - {monthNames[selectedMonth.month - 1]}{" "}
            {selectedMonth.year}
          </h3>

          <button
            onClick={() => handleMonthChange("next")}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Statistiques principales avec cartes améliorées */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 transition-transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {monthlyData.totalTasks}
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
                {monthlyData.completedTasks}
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

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 transition-transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-red-600">
                {monthlyData.notCompletedTasks}
              </div>
              <div className="text-sm text-red-700 font-medium">
                Tâches non complétées
              </div>
            </div>
            <div className="text-red-400">
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
                {monthlyData.completionPercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-purple-700 font-medium">
                Taux de complétion
              </div>
            </div>
            <div className="text-purple-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 Nouvelle section : Diagramme circulaire + Barre de progression */}
      {monthlyData.totalTasks > 0 && (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-6">
            Vue d'ensemble du taux de complétion
          </h4>

          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Diagramme circulaire */}
            <div className="flex flex-col items-center">
              <CircularChart
                completed={monthlyData.completedTasks}
                total={monthlyData.totalTasks}
              />
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-600">Progression globale</div>
                <div className="text-xs text-gray-500">
                  {monthlyData.completedTasks} sur {monthlyData.totalTasks}{" "}
                  tâches
                </div>
              </div>
            </div>

            {/* Barre de progression détaillée */}
            <div className="flex-1 w-full">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">
                      Tâches complétées
                    </span>
                    <span className="text-green-600 font-semibold">
                      {monthlyData.completionPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium transition-all duration-1000"
                      style={{
                        width: `${Math.max(
                          monthlyData.completionPercentage,
                          5
                        )}%`,
                      }}
                    >
                      {monthlyData.completionPercentage > 20 &&
                        `${monthlyData.completionPercentage.toFixed(0)}%`}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>
                      Complétées: <strong>{monthlyData.completedTasks}</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span>
                      En attente:{" "}
                      <strong>{monthlyData.notCompletedTasks}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques par priorité (votre version existante améliorée) */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h4 className="text-lg font-semibold text-gray-800 mb-6">
          Répartition par priorité
        </h4>
        <div className="space-y-4">
          {Object.entries(monthlyData.tasksByPriority).map(
            ([priority, stats]) => {
              const priorityNum = parseInt(priority) as TaskPriority;
              const config = PRIORITY_LABELS[priorityNum];
              const completionRate =
                stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

              return (
                <div
                  key={priority}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3 w-32">
                    <span className="text-lg">{config.icon}</span>
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">
                        {stats.completed}/{stats.total} tâches
                      </span>
                      <span className="font-semibold">
                        {completionRate.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          priorityNum === TaskPriority.HIGH
                            ? "bg-gradient-to-r from-red-400 to-red-500"
                            : priorityNum === TaskPriority.MEDIUM
                            ? "bg-gradient-to-r from-blue-400 to-blue-500"
                            : "bg-gradient-to-r from-gray-400 to-gray-500"
                        }`}
                        style={{ width: `${Math.max(completionRate, 3)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Graphique quotidien (votre version existante améliorée) */}
      {monthlyData.totalTasks > 0 && (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-6">
            Activité quotidienne
          </h4>
          <div className="mb-4">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded"></div>
                <span className="font-medium">Tâches complétées</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-300 to-blue-400 rounded"></div>
                <span className="font-medium">Tâches en cours</span>
              </div>
            </div>
          </div>
          <SimpleBarChart data={monthlyData.dailyCompletion} />
        </div>
      )}

      {/* Message si aucune donnée */}
      {monthlyData.totalTasks === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
          <div className="mb-4 text-6xl">📊</div>
          <h3 className="text-xl font-semibold mb-2">
            Aucune donnée disponible
          </h3>
          <p className="text-lg mb-2">
            Aucune tâche créée en {monthNames[selectedMonth.month - 1]}{" "}
            {selectedMonth.year}
          </p>
          <p className="text-sm">
            Commencez à créer des tâches pour voir vos statistiques mensuelles !
          </p>
        </div>
      )}
    </div>
  );
};

export default MonthlyTaskReport;
