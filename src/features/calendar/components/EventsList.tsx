import React, { useState, useMemo } from "react";
import { EventDto, formatEventTime, getEventColor } from "../types";

interface EventsListProps {
  events: EventDto[];
  onEventClick: (event: EventDto) => void;
  onEventDelete: (eventId: number) => void;
}

const EventsList: React.FC<EventsListProps> = ({
  events,
  onEventClick,
  onEventDelete,
}) => {
  const [filter, setFilter] = useState<"all" | "upcoming" | "today" | "week">(
    "upcoming"
  );
  const filteredEvents = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    let filtered = events;

    switch (filter) {
      case "today":
        filtered = events.filter((event) => {
          const eventDate = new Date(event.startDate);
          return eventDate >= today && eventDate < tomorrow;
        });
        break;
      case "week":
        filtered = events.filter((event) => {
          const eventDate = new Date(event.startDate);
          return eventDate >= today && eventDate <= weekFromNow;
        });
        break;
      case "upcoming":
        filtered = events.filter((event) => {
          const eventDate = new Date(event.startDate);
          return eventDate >= today;
        });
        break;
      default:
        filtered = events;
    }
    return filtered.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [events, filter]);

  const formatEventDate = (dateString: string) => {
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
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    }
  };

  const filterOptions = [
    {
      value: "upcoming",
      label: "À venir",
      count: events.filter((e) => new Date(e.startDate) >= new Date()).length,
    },
    {
      value: "today",
      label: "Aujourd'hui",
      count: events.filter((e) => {
        const eventDate = new Date(e.startDate);
        const today = new Date();
        return eventDate.toDateString() === today.toDateString();
      }).length,
    },
    {
      value: "week",
      label: "Cette semaine",
      count: events.filter((e) => {
        const eventDate = new Date(e.startDate);
        const today = new Date();
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return eventDate >= today && eventDate <= weekFromNow;
      }).length,
    },
    { value: "all", label: "Tous", count: events.length },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-3">
          📋 Événements
        </h3>

        {/* Filtres */}
        <div className="space-y-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                setFilter(option.value as "all" | "upcoming" | "today" | "week")
              }
              className={`
                w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                ${
                  filter === option.value
                    ? "bg-teal-50 text-teal-700 border border-teal-200"
                    : "text-gray-600 hover:bg-gray-50"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span>{option.label}</span>
                {option.count > 0 && (
                  <span
                    className={`
                    text-xs px-2 py-1 rounded-full
                    ${
                      filter === option.value
                        ? "bg-teal-100 text-teal-700"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                  >
                    {option.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Liste des événements */}
      <div className="max-h-96 overflow-y-auto">
        {filteredEvents.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 hover:bg-gray-50 transition-colors group cursor-pointer"
                onClick={() => onEventClick(event)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    {/* Titre et type */}
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {event.title}
                      </h4>
                      <span
                        className={`
                        inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                        ${getEventColor(event)}
                      `}
                      >
                        {event.type === "TASK_BASED" ? "📋" : "🎉"}
                      </span>
                    </div>

                    {/* Date et heure */}
                    <div className="text-xs text-gray-600 mb-1">
                      <div>{formatEventDate(event.startDate)}</div>
                      <div>
                        {formatEventTime(event.startDate, event.endDate)}
                      </div>
                    </div>

                    {/* Lieu ou lien */}
                    {event.location && (
                      <div className="text-xs text-gray-500 flex items-center mt-1">
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
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}

                    {event.meetingLink && (
                      <div className="text-xs text-blue-600 flex items-center mt-1">
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
                        <span className="truncate">Lien de réunion</span>
                      </div>
                    )}

                    {/* Rappels */}
                    {event.reminders.length > 0 && (
                      <div className="text-xs text-gray-500 flex items-center mt-1">
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
                        <span>{event.reminders.length} rappel(s)</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
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
        ) : (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📅</div>
            <p className="text-sm">
              {filter === "today" && "Aucun événement aujourd'hui"}
              {filter === "week" && "Aucun événement cette semaine"}
              {filter === "upcoming" && "Aucun événement à venir"}
              {filter === "all" && "Aucun événement"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsList;
