import React, { useMemo, useState } from "react";
import { Task, TaskPriority, PRIORITY_LABELS } from "../types";

interface MonthlyTaskReportProps {
  tasks: Task[];
}

const MonthlyTaskReport: React.FC<MonthlyTaskReportProps> = ({ tasks }) => {
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

    // Données quotidiennes pour le graphique
    const dailyCompletion = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month - 1, day);
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

  // Composant simple de graphique en barres
  const SimpleBarChart: React.FC<{
    data: typeof monthlyData.dailyCompletion;
  }> = ({ data }) => {
    const maxValue = Math.max(...data.map((d) => d.total), 1);

    return (
      <div className="flex items-end space-x-1 h-32 overflow-x-auto">
        {data.slice(0, 31).map((day, index) => (
          <div key={index} className="flex flex-col items-center min-w-[20px]">
            <div className="flex flex-col-reverse h-24 w-4 bg-gray-100 rounded-sm">
              {day.total > 0 && (
                <>
                  <div
                    className="bg-green-400 rounded-sm"
                    style={{ height: `${(day.completed / maxValue) * 100}%` }}
                    title={`${day.completed} complétées`}
                  />
                  <div
                    className="bg-blue-300 rounded-sm"
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
            <span className="text-xs text-gray-500 mt-1">{day.date}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
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

          <h3 className="text-lg font-semibold text-gray-800">
            {monthNames[selectedMonth.month - 1]} {selectedMonth.year}
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

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {monthlyData.totalTasks}
          </div>
          <div className="text-sm text-blue-800">Total des tâches</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {monthlyData.completedTasks}
          </div>
          <div className="text-sm text-green-800">Tâches complétées</div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">
            {monthlyData.notCompletedTasks}
          </div>
          <div className="text-sm text-red-800">Tâches non complétées</div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {monthlyData.completionPercentage.toFixed(1)}%
          </div>
          <div className="text-sm text-purple-800">Taux de complétion</div>
        </div>
      </div>

      {/* Diagramme de complétion */}
      {monthlyData.totalTasks > 0 && (
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="text-md font-medium text-gray-800 mb-4">
            Taux de complétion
          </h4>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{
                    width: `${Math.max(monthlyData.completionPercentage, 10)}%`,
                  }}
                >
                  {monthlyData.completionPercentage > 15 &&
                    `${monthlyData.completionPercentage.toFixed(1)}%`}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {monthlyData.completedTasks}/{monthlyData.totalTasks}
            </div>
          </div>
        </div>
      )}

      {/* Statistiques par priorité */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-md font-medium text-gray-800 mb-4">
          Répartition par priorité
        </h4>
        <div className="space-y-3">
          {Object.entries(monthlyData.tasksByPriority).map(
            ([priority, stats]) => {
              const priorityNum = parseInt(priority) as TaskPriority;
              const config = PRIORITY_LABELS[priorityNum];
              const completionRate =
                stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

              return (
                <div key={priority} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 w-24">
                    <span>{config.icon}</span>
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        {stats.completed}/{stats.total}
                      </span>
                      <span>{completionRate.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          priorityNum === TaskPriority.HIGH
                            ? "bg-red-500"
                            : priorityNum === TaskPriority.MEDIUM
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        }`}
                        style={{ width: `${Math.max(completionRate, 2)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Graphique quotidien */}
      {monthlyData.totalTasks > 0 && (
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="text-md font-medium text-gray-800 mb-4">
            Activité quotidienne
          </h4>
          <div className="mb-4">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span>Complétées</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-300 rounded"></div>
                <span>En cours</span>
              </div>
            </div>
          </div>
          <SimpleBarChart data={monthlyData.dailyCompletion} />
        </div>
      )}

      {/* Message si aucune donnée */}
      {monthlyData.totalTasks === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="mb-2">📊</div>
          <p>
            Aucune tâche créée en {monthNames[selectedMonth.month - 1]}{" "}
            {selectedMonth.year}
          </p>
          <p className="text-sm">
            Commencez à créer des tâches pour voir vos statistiques !
          </p>
        </div>
      )}
    </div>
  );
};

export default MonthlyTaskReport;
