import React from "react";
import {
  CalendarViewDto,
  EventDto,
  getEventColor,
  formatEventTime,
} from "../types";
import { useCalendar } from "../CalendarContext";

interface CalendarGridProps {
  monthData: CalendarViewDto[];
  onDayClick: (date: string) => void;
  onEventClick: (event: EventDto) => void;
}

interface MappedTaskItem extends EventDto {
  priority?: number;
  relatedTaskId: number;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  monthData,
  onDayClick,
  onEventClick,
}) => {
  const { state } = useCalendar();

  const createLocalDate = (
    year: number,
    month: number,
    day: number
  ): string => {
    const date = new Date(year, month, day, 12, 0, 0);
    return date.toISOString().split("T")[0];
  };

  const createCalendarGrid = () => {
    if (monthData.length === 0) return [];

    const firstDate = new Date(monthData[0].date + "T12:00:00");
    const year = firstDate.getFullYear();
    const month = firstDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const days = [];

    for (let i = adjustedStartDay - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      const dateString = date.toISOString().split("T")[0];
      days.push({
        date: dateString,
        isCurrentMonth: false,
        dayNumber: date.getDate(),
      });
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const dateString = createLocalDate(year, month, day);
      days.push({
        date: dateString,
        isCurrentMonth: true,
        dayNumber: day,
      });
    }

    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      const dateString = date.toISOString().split("T")[0];
      days.push({
        date: dateString,
        isCurrentMonth: false,
        dayNumber: day,
      });
    }

    return days;
  };

  const getDayData = (date: string): CalendarViewDto | null => {
    return monthData.find((day) => day.date === date) || null;
  };

  const isToday = (date: string): boolean => {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];
    return date === todayString;
  };

  const getFilteredItems = (
    dayData: CalendarViewDto
  ): (EventDto | MappedTaskItem)[] => {
    const items: (EventDto | MappedTaskItem)[] = [];

    if (state.filterType === "all" || state.filterType === "events") {
      items.push(...dayData.events);
    }

    if (state.filterType === "all" || state.filterType === "tasks") {
      const taskItems: MappedTaskItem[] = dayData.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        startDate: task.scheduledDate || task.dueDate || dayData.date,
        endDate: task.scheduledDate || task.dueDate || dayData.date,
        type: "TASK_BASED" as const,
        relatedTaskId: task.id,
        reminders: [],
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        description: task.description,
        priority: task.priority,
        location: undefined,
        mode: undefined,
        meetingLink: undefined,
      }));

      items.push(...taskItems);
    }

    return items;
  };

  const handleDayClick = (date: string) => {
    onDayClick(date);
  };

  const handleItemClick = (
    e: React.MouseEvent,
    item: EventDto | MappedTaskItem
  ) => {
    e.stopPropagation();
    onEventClick(item as EventDto);
  };

  const isMappedTask = (
    item: EventDto | MappedTaskItem
  ): item is MappedTaskItem => {
    return "relatedTaskId" in item && item.type === "TASK_BASED";
  };

  const calendarDays = createCalendarGrid();
  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {dayNames.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0">
        {calendarDays.map((day, index) => {
          const dayData = getDayData(day.date);
          const filteredItems = dayData ? getFilteredItems(dayData) : [];
          const isCurrentDay = isToday(day.date);
          const hasItems = filteredItems.length > 0;

          return (
            <div
              key={`${day.date}-${index}`}
              className={`
                min-h-[120px] border-r border-b border-gray-200 last:border-r-0 p-2 
                cursor-pointer transition-all duration-200 
                hover:bg-gray-50 hover:shadow-inner
                ${
                  !day.isCurrentMonth
                    ? "bg-gray-50/50 text-gray-400"
                    : "bg-white text-gray-900"
                }
                ${
                  isCurrentDay
                    ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200"
                    : ""
                }
                ${hasItems && day.isCurrentMonth ? "hover:bg-teal-50" : ""}
              `}
              onClick={() => handleDayClick(day.date)}
            >
              {/* En-tête de la cellule jour */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`
                    text-sm font-medium transition-colors
                    ${
                      isCurrentDay
                        ? "bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm"
                        : ""
                    }
                    ${
                      !day.isCurrentMonth
                        ? "text-gray-400"
                        : isCurrentDay
                        ? ""
                        : "text-gray-900"
                    }
                  `}
                >
                  {day.dayNumber}
                </span>

                {/* Badge du nombre d'éléments */}
                {hasItems && (
                  <span
                    className={`
                      text-xs px-1.5 py-0.5 rounded-full font-medium
                      ${
                        filteredItems.length > 5
                          ? "bg-red-100 text-red-800"
                          : filteredItems.length > 2
                          ? "bg-orange-100 text-orange-800"
                          : "bg-teal-100 text-teal-800"
                      }
                    `}
                  >
                    {filteredItems.length}
                  </span>
                )}
              </div>

              {/* Liste des événements et tâches */}
              <div className="space-y-1 overflow-hidden">
                {filteredItems.slice(0, 3).map((item, itemIndex) => {
                  const isTask = isMappedTask(item);

                  return (
                    <div
                      key={`${item.id}-${itemIndex}`}
                      className={`
                        text-xs p-1.5 rounded-md cursor-pointer 
                        transition-all duration-150
                        hover:opacity-80 hover:scale-[1.02] hover:shadow-sm
                        ${getEventColor(item)}
                        ${!day.isCurrentMonth ? "opacity-60" : ""}
                      `}
                      onClick={(e) => handleItemClick(e, item)}
                      title={`${item.title}${
                        item.description ? ` - ${item.description}` : ""
                      }`}
                    >
                      {/* Titre de l'élément */}
                      <div className="truncate font-medium flex items-center">
                        {isTask && (
                          <span className="mr-1 text-[10px]">
                            {item.priority === 1
                              ? "🔹"
                              : item.priority === 2
                              ? "🔸"
                              : "🔴"}
                          </span>
                        )}
                        {item.title}
                      </div>

                      {item.startDate && !isMappedTask(item) && (
                        <div className="truncate opacity-75 mt-0.5">
                          {formatEventTime(item.startDate, item.endDate)}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Indicateur d'éléments supplémentaires */}
                {filteredItems.length > 3 && (
                  <div className="text-xs text-gray-500 text-center p-1 bg-gray-100 rounded-md">
                    <span className="font-medium">
                      +{filteredItems.length - 3} autre
                      {filteredItems.length - 3 > 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                {/* Message si aucun élément et jour sélectionnable */}
                {filteredItems.length === 0 && day.isCurrentMonth && (
                  <div className="text-center py-4 opacity-0 hover:opacity-100 transition-opacity">
                    <div className="text-xs text-gray-400">
                      <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-lg">+</span>
                      </div>
                      Ajouter
                    </div>
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
