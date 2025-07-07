import React from "react";
import {
  useCalendar,
  useCalendarNavigation,
} from "../contexts/CalendarContext";

const CalendarHeader: React.FC = () => {
  const { state, dispatch } = useCalendar();
  const {
    currentMonth,
    currentYear,
    navigateToPreviousMonth,
    navigateToNextMonth,
    navigateToToday,
  } = useCalendarNavigation();

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

  const filterOptions = [
    { value: "all", label: "Tout afficher", icon: "📅" },
    { value: "events", label: "Événements", icon: "🎉" },
    { value: "tasks", label: "Tâches", icon: "✅" },
  ] as const;

  return (
    <div className="border-b border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Titre et navigation */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            📅 Calendrier
          </h1>

          <div className="flex items-center space-x-2">
            <button
              onClick={navigateToPreviousMonth}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              title="Mois précédent"
            >
              <svg
                className="w-5 h-5"
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

            <h2 className="text-xl font-medium text-gray-700 min-w-[200px] text-center">
              {monthNames[currentMonth - 1]} {currentYear}
            </h2>

            <button
              onClick={navigateToNextMonth}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              title="Mois suivant"
            >
              <svg
                className="w-5 h-5"
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

            <button
              onClick={navigateToToday}
              className="ml-4 px-3 py-1 text-sm bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
            >
              Aujourd'hui
            </button>
          </div>
        </div>

        {/* Actions et filtres */}
        <div className="flex items-center space-x-4">
          {/* Filtres */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Afficher :</span>
            <select
              value={state.filterType}
              onChange={(e) =>
                dispatch({
                  type: "SET_FILTER_TYPE",
                  payload: e.target.value as "all" | "events" | "tasks",
                })
              }
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Indicateur de chargement */}
      {state.loadingStates.monthView.isLoading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="inline-block w-4 h-4 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin mr-2"></div>
          <span className="text-sm text-gray-600">
            Chargement du calendrier...
          </span>
        </div>
      )}

      {/* Erreur de chargement */}
      {state.loadingStates.monthView.error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
          {state.loadingStates.monthView.error}
        </div>
      )}
    </div>
  );
};

export default CalendarHeader;
