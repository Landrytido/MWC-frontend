import React from "react";
import {
  CalendarViewDto,
  EventDto,
  getEventColor,
  formatEventTime,
} from "../types/calendar";
import { useCalendar } from "../contexts/CalendarContext";

interface CalendarGridProps {
  monthData: CalendarViewDto[];
  onDayClick: (date: string) => void;
  onEventClick: (event: EventDto) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  monthData,
  onDayClick,
  onEventClick,
}) => {
  const { state } = useCalendar();
  const createCalendarGrid = () => {
    if (monthData.length === 0) return [];
    const firstDate = new Date(monthData[0].date);
    const year = firstDate.getFullYear();
    const month = firstDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Lundi = 0
    const days = [];
    for (let i = adjustedStartDay - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date: date.toISOString().split("T")[0],
        isCurrentMonth: false,
        dayNumber: date.getDate(),
      });
    }
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date: date.toISOString().split("T")[0],
        isCurrentMonth: true,
        dayNumber: day,
      });
    }
    const totalCells = 42; // 6 semaines × 7 jours
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date: date.toISOString().split("T")[0],
        isCurrentMonth: false,
        dayNumber: day,
      });
    }

    return days;
  };

  const calendarDays = createCalendarGrid();
  const getDayData = (date: string): CalendarViewDto | null => {
    return monthData.find((day) => day.date === date) || null;
  };
  const isToday = (date: string): boolean => {
    return date === new Date().toISOString().split("T")[0];
  };
  const getFilteredItems = (dayData: CalendarViewDto) => {
    const items = [];

    if (state.filterType === "all" || state.filterType === "events") {
      items.push(...dayData.events);
    }

    if (state.filterType === "all" || state.filterType === "tasks") {
      items.push(
        ...dayData.tasks.map((task) => ({
          id: task.id,
          title: task.title,
          startDate: task.scheduledDate || task.dueDate || dayData.date,
          endDate: task.scheduledDate || task.dueDate || dayData.date,
          type: "TASK_BASED" as const,
          relatedTaskId: task.id,
          reminders: [],
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        }))
      );
    }

    return items;
  };

  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* En-têtes des jours */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {dayNames.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-gray-700"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-0">
        {calendarDays.map((day, index) => {
          const dayData = getDayData(day.date);
          const filteredItems = dayData ? getFilteredItems(dayData) : [];
          const isCurrentDay = isToday(day.date);

          return (
            <div
              key={`${day.date}-${index}`}
              className={`
                min-h-[120px] border-r border-b border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors
                ${!day.isCurrentMonth ? "bg-gray-50 text-gray-400" : "bg-white"}
                ${isCurrentDay ? "bg-blue-50 border-blue-200" : ""}
              `}
              onClick={() => onDayClick(day.date)}
            >
              {/* Numéro du jour */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`
                  text-sm font-medium
                  ${
                    isCurrentDay
                      ? "bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
                      : ""
                  }
                  ${!day.isCurrentMonth ? "text-gray-400" : "text-gray-900"}
                `}
                >
                  {day.dayNumber}
                </span>

                {/* Indicateur de nombre d'éléments */}
                {filteredItems.length > 0 && (
                  <span className="text-xs bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-full">
                    {filteredItems.length}
                  </span>
                )}
              </div>

              {/* Liste des événements/tâches */}
              <div className="space-y-1">
                {filteredItems.slice(0, 3).map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`
                      text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity
                      ${getEventColor(item)}
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      if ("relatedTaskId" in item && item.relatedTaskId) {
                        onEventClick(item as EventDto);
                      } else {
                        onEventClick(item as EventDto);
                      }
                    }}
                    title={item.title}
                  >
                    <div className="truncate font-medium">{item.title}</div>
                    {item.startDate && (
                      <div className="truncate opacity-75">
                        {formatEventTime(item.startDate, item.endDate)}
                      </div>
                    )}
                  </div>
                ))}

                {/* Indicateur d'éléments supplémentaires */}
                {filteredItems.length > 3 && (
                  <div className="text-xs text-gray-500 text-center p-1">
                    +{filteredItems.length - 3} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
