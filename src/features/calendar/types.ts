import { TaskPriority } from "../tasks";

export type EventMode = "PRESENTIEL" | "DISTANCIEL";
export type EventType = "EVENT" | "TASK_BASED";

export const EVENT_MODE_LABELS = {
  PRESENTIEL: "Présentiel",
  DISTANCIEL: "Distanciel",
} as const;

export const EVENT_TYPE_LABELS = {
  EVENT: "Événement",
  TASK_BASED: "Basé sur une tâche",
} as const;

export interface EventDto {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  mode?: EventMode;
  meetingLink?: string;
  type: EventType;
  relatedTaskId?: number;
  relatedTaskTitle?: string;
  createdAt: string;
  updatedAt: string;

  priority?: number;
  completed?: boolean;
  dueDate?: string; // Unifié avec backend
}

export interface TaskDto {
  id: number;
  title: string;
  description?: string;
  priority: number;
  completed: boolean;
  dueDate?: string; // Unifié avec backend
  createdAt: string;
  updatedAt: string;
}

export interface CalendarViewDto {
  date: string;
  events: EventDto[];
  tasks: TaskDto[];
  totalItems: number;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  startDate: string; // ISO string
  endDate: string;
  location?: string;
  mode?: EventMode;
  meetingLink?: string;
  type?: EventType;
  relatedTaskId?: number;
  dueDate?: string; // Pour les tâches - Unifié avec backend
  priority?: TaskPriority; // Pour les tâches
}

export interface CalendarState {
  events: EventDto[];
  monthViewData: Record<string, CalendarViewDto[]>; // key: "2025-01"
  selectedDate: string | null;
  currentMonth: number;
  currentYear: number;
  filterType: "all" | "events" | "tasks";

  loadingStates: {
    events: { isLoading: boolean; error?: string };
    monthView: { isLoading: boolean; error?: string };
    dayView: { isLoading: boolean; error?: string };
  };
}

export type CalendarAction =
  | { type: "SET_EVENTS"; payload: EventDto[] }
  | { type: "ADD_EVENT"; payload: EventDto }
  | { type: "UPDATE_EVENT"; payload: { id: number; event: EventDto } }
  | { type: "DELETE_EVENT"; payload: number }
  | {
      type: "SET_MONTH_VIEW_DATA";
      payload: { key: string; data: CalendarViewDto[] };
    }
  | { type: "SET_SELECTED_DATE"; payload: string | null }
  | { type: "SET_CURRENT_MONTH"; payload: number }
  | { type: "SET_CURRENT_YEAR"; payload: number }
  | { type: "SET_FILTER_TYPE"; payload: "all" | "events" | "tasks" }
  | {
      type: "SET_LOADING";
      payload: {
        key: keyof CalendarState["loadingStates"];
        loading: { isLoading: boolean; error?: string };
      };
    }
  | { type: "CLEAR_MONTH_VIEW_DATA" };

export function formatEventDateTime(
  startDateTime: string,
  endDateTime?: string
): string {
  const start = new Date(startDateTime);

  if (!endDateTime) {
    return start.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const end = new Date(endDateTime);
  const isSameDay = start.toDateString() === end.toDateString();

  if (isSameDay) {
    const dateStr = start.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
    const startTimeStr = start.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endTimeStr = end.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${dateStr} ${startTimeStr} - ${endTimeStr}`;
  } else {
    const startTime = start.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endTime = end.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateFormat = { day: "numeric", month: "short" } as const;
    const startDateStr = start.toLocaleDateString("fr-FR", dateFormat);
    const endDateStr = end.toLocaleDateString("fr-FR", dateFormat);

    return `${startDateStr} ${startTime} - ${endDateStr} ${endTime}`;
  }
}

export function formatEventTime(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const timeFormat = { hour: "2-digit", minute: "2-digit" } as const;
  const startTime = start.toLocaleTimeString("fr-FR", timeFormat);
  const endTime = end.toLocaleTimeString("fr-FR", timeFormat);

  if (start.toDateString() === end.toDateString()) {
    return `${startTime} - ${endTime}`;
  }

  const dateFormat = { day: "numeric", month: "short" } as const;
  const startDateStr = start.toLocaleDateString("fr-FR", dateFormat);
  const endDateStr = end.toLocaleDateString("fr-FR", dateFormat);

  return `${startDateStr} ${startTime} - ${endDateStr} ${endTime}`;
}

export function getEventColor(event: EventDto): string {
  if (event.type === "TASK_BASED") {
    return "bg-blue-100 border-blue-300 text-blue-800";
  }
  return "bg-green-100 border-green-300 text-green-800";
}

export function isEventToday(eventDate: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  const eventDay = new Date(eventDate).toISOString().split("T")[0];
  return today === eventDay;
}

export function isEventOverdue(endDate: string): boolean {
  return new Date(endDate) < new Date();
}
