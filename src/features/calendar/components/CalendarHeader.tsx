import React from "react";

interface CalendarHeaderProps {
  currentMonth: number;
  currentYear: number;
  loading: boolean;
  error: string | null;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentMonth,
  currentYear,
  loading,
  error,
  onPreviousMonth,
  onNextMonth,
  onToday,
}) => {
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

  return (
    <div className="border-b border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            📅 Calendrier
          </h1>

          <div className="flex items-center space-x-2">
            <button
              onClick={onPreviousMonth}
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
              onClick={onNextMonth}
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
              onClick={onToday}
              className="ml-4 px-3 py-1 text-sm bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
            >
              Aujourd'hui
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="inline-block w-4 h-4 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin mr-2"></div>
          <span className="text-sm text-gray-600">
            Chargement du calendrier...
          </span>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default CalendarHeader;
