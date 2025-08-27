import React, { useState, useEffect, useCallback } from "react";
import {
  CalendarViewDto,
  EventDto,
  formatEventTime,
  getEventColor,
  TaskDto,
} from "../types";

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  onEventClick: (event: EventDto) => void;
  onEventDelete: (eventId: number) => void;
  onCreateEvent: () => void;
  onCreateTask: () => void;
  loadDayData: (date: string) => Promise<CalendarViewDto>; // ✅ Passé depuis le composant parent
}

const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  date,
  onEventClick,
  onEventDelete,
  onCreateEvent,
  onCreateTask,
  loadDayData, // ✅ Reçu en prop
}) => {
  const [dayData, setDayData] = useState<CalendarViewDto | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadDay = useCallback(async () => {
    if (!date) return;

    setError("");
    setIsLoading(true);

    try {
      const data = await loadDayData(date);
      setDayData(data);
    } catch (err) {
      setError("Erreur lors du chargement des données du jour");
      console.error("Erreur chargement jour:", err);
    } finally {
      setIsLoading(false);
    }
  }, [loadDayData, date]);

  useEffect(() => {
    if (isOpen && date) {
      loadDay();
    }
  }, [isOpen, date, loadDay]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const tomorrowOnly = new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate()
    );

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return "Aujourd'hui";
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return "Demain";
    } else {
      return date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  };

  const formatTaskForDisplay = (task: TaskDto): EventDto => {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      startDate: task.dueDate || date,
      endDate: task.dueDate || date,
      type: "TASK_BASED" as const,
      reminders: [],
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      location: undefined,
      mode: undefined,
      meetingLink: undefined,
      relatedTaskId: task.id,
      relatedTaskTitle: undefined,
      priority: task.priority,
      completed: task.completed,
      dueDate: task.dueDate,
    };
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {formatDate(date)}
              </h2>
              <p className="text-sm text-gray-600">
                {dayData ? `${dayData.totalItems} élément(s)` : "Chargement..."}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Fermer"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Chargement des données...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="text-red-500 mb-4">⚠️</div>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadDay}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            ) : dayData ? (
              <div className="p-6">
                <div className="flex space-x-3 mb-6">
                  <button
                    onClick={onCreateEvent}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-500 rounded-md hover:bg-teal-600 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Nouvel événement
                  </button>
                  <button
                    onClick={onCreateTask}
                    className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Nouvelle tâche
                  </button>
                </div>

                {dayData.events.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                      🎉 Événements ({dayData.events.length})
                    </h3>
                    <div className="space-y-3">
                      {dayData.events.map((event) => (
                        <div
                          key={event.id}
                          className={`
                            p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all group
                            ${getEventColor(event)}
                          `}
                          onClick={() => onEventClick(event)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 mb-1">
                                {event.title}
                              </h4>
                              <div className="text-sm text-gray-600 mb-2">
                                {formatEventTime(
                                  event.startDate,
                                  event.endDate
                                )}
                              </div>
                              {event.description && (
                                <p className="text-sm text-gray-700 mb-2">
                                  {event.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                {event.location && (
                                  <span className="flex items-center">
                                    <svg
                                      className="w-3 h-3 mr-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                      />
                                    </svg>
                                    {event.location}
                                  </span>
                                )}
                                {event.meetingLink && (
                                  <span className="flex items-center text-blue-600">
                                    <svg
                                      className="w-3 h-3 mr-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                      />
                                    </svg>
                                    Lien réunion
                                  </span>
                                )}
                                {event.reminders.length > 0 && (
                                  <span className="flex items-center">
                                    <svg
                                      className="w-3 h-3 mr-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15 17h5l-5 5v-5zM4 19h6v-6h6V7H4v12z"
                                      />
                                    </svg>
                                    {event.reminders.length} rappel(s)
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEventClick(event);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-500 rounded"
                                title="Modifier"
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
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEventDelete(event.id);
                                }}
                                className="p-1 text-gray-400 hover:text-red-500 rounded"
                                title="Supprimer"
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dayData.tasks.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                      📋 Tâches ({dayData.tasks.length})
                    </h3>
                    <div className="space-y-3">
                      {dayData.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`
                            p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all group
                            ${
                              task.completed
                                ? "bg-green-50 border-green-200"
                                : "bg-blue-50 border-blue-200"
                            }
                          `}
                          onClick={() =>
                            onEventClick(formatTaskForDisplay(task))
                          }
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div
                                className={`
                                mt-1 w-4 h-4 rounded border-2 flex items-center justify-center
                                ${
                                  task.completed
                                    ? "bg-green-500 border-green-500 text-white"
                                    : "border-gray-300"
                                }
                              `}
                              >
                                {task.completed && (
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4
                                  className={`font-medium mb-1 ${
                                    task.completed
                                      ? "line-through text-gray-500"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p
                                    className={`text-sm mb-2 ${
                                      task.completed
                                        ? "text-gray-400"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>
                                    Priorité:{" "}
                                    {task.priority === 3
                                      ? "Haute"
                                      : task.priority === 2
                                      ? "Moyenne"
                                      : "Basse"}
                                  </span>
                                  {task.dueDate && (
                                    <span>
                                      Prévue:{" "}
                                      {new Date(
                                        task.dueDate
                                      ).toLocaleDateString("fr-FR", {
                                        day: "numeric",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEventClick(formatTaskForDisplay(task));
                                }}
                                className="p-1 text-gray-400 hover:text-blue-500 rounded"
                                title="Modifier"
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
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dayData.totalItems === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📅</div>
                    <p className="text-lg font-medium mb-2">Journée libre</p>
                    <p className="text-sm">
                      Aucun événement ou tâche planifié pour cette date
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default DayDetailModal;
