import { TaskPriority } from "./index";

export type EventMode = "PRESENTIEL" | "DISTANCIEL";
export type EventType = "EVENT" | "TASK_BASED";
export type ReminderType = "EMAIL" | "IN_APP_NOTIFICATION";

export interface EventReminderDto {
  id: number;
  type: ReminderType;
  minutesBefore: number;
  sent: boolean;
  scheduledFor: string;
  createdAt: string;
}

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
  reminders: EventReminderDto[];
  createdAt: string;
  updatedAt: string;

  priority?: number;
  completed?: boolean;
  dueDate?: string;
  scheduledDate?: string;
}

export interface CalendarViewDto {
  date: string;
  events: EventDto[];
  tasks: TaskDto[];
  totalItems: number;
}

export interface CreateReminderRequest {
  type: ReminderType;
  minutesBefore: number;
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
  reminders?: CreateReminderRequest[];
  dueDate?: string; // Date d'échéance pour les tâches
  scheduledDate?: string; // Date de planification pour les tâches
  priority?: TaskPriority; // TaskPriority enum
}
export const REMINDER_OPTIONS = [
  { label: "15 minutes avant", minutes: 15 },
  { label: "1 heure avant", minutes: 60 },
  { label: "1 jour avant", minutes: 1440 },
] as const;

export const EVENT_MODE_LABELS = {
  PRESENTIEL: "Présentiel",
  DISTANCIEL: "Distanciel",
} as const;

export const EVENT_TYPE_LABELS = {
  EVENT: "Événement",
  TASK_BASED: "Basé sur une tâche",
} as const;
import { Task as TaskDto } from "./index";
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
    const startDateStr = start.toLocaleDateString("fr-FR", dateFormat); // Renommé
    const endDateStr = end.toLocaleDateString("fr-FR", dateFormat); // Renommé

    return `${startDateStr} ${startTime} - ${endDateStr} ${endTime}`;
  }
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
export function isEventOverdue(endDate: string): boolean {
  return new Date(endDate) < new Date();
}
