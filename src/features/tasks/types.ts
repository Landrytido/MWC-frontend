// Enums et types de base
export enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
}

export const PRIORITY_LABELS = {
  [TaskPriority.LOW]: { label: "Basse", icon: "🔹", color: "gray" },
  [TaskPriority.MEDIUM]: { label: "Moyenne", icon: "🔸", color: "blue" },
  [TaskPriority.HIGH]: { label: "Haute", icon: "🔴", color: "red" },
} as const;

export type TaskStatus =
  | "upcoming"
  | "today"
  | "tomorrow"
  | "overdue"
  | "completed";

export enum ScheduleType {
  NONE = "none",
  TODAY = "today",
  TOMORROW = "tomorrow",
}

export const SCHEDULE_LABELS = {
  [ScheduleType.NONE]: "Pas de planification",
  [ScheduleType.TODAY]: "Pour aujourd'hui",
  [ScheduleType.TOMORROW]: "Pour demain",
} as const;

// Interfaces principales
export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  scheduledDate?: string;
  priority: number;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  carriedOver: boolean;
  originalDate?: string;
  orderIndex: number;
  status: TaskStatus;
  overdue: boolean;
  scheduledForToday: boolean;
  scheduledForTomorrow: boolean;
}

export interface CreateTaskForm {
  title: string;
  description?: string;
  dueDate?: string;
  scheduledDate?: string;
  priority?: number;
  orderIndex?: number;
}

export interface UpdateTaskForm extends Partial<CreateTaskForm> {
  completed?: boolean;
  carriedOver?: boolean;
  originalDate?: string;
  orderIndex?: number;
}

// Statistiques et rapports
export interface ApiTaskSummary {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  todayTasks: number;
  tomorrowTasks: number;
}

export interface ApiTaskStats {
  month: number;
  year: number;
  totalTasks: number;
  completedTasks: number;
  notCompletedTasks: number;
  completionPercentage: number;
  tasksByPriority: Record<
    number,
    {
      total: number;
      completed: number;
      completionRate: number;
    }
  >;
  dailyStats: Record<
    string,
    {
      date: string;
      total: number;
      completed: number;
      completionRate: number;
    }
  >;
}

export function getTaskPriorityEnum(priority: number): TaskPriority {
  if (priority === 1) return TaskPriority.LOW;
  if (priority === 3) return TaskPriority.HIGH;
  return TaskPriority.MEDIUM;
}

export function getPriorityConfig(priority: number) {
  const priorityEnum = getTaskPriorityEnum(priority);
  return PRIORITY_LABELS[priorityEnum];
}

export function getTaskStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    completed: "Terminée",
    overdue: "En retard",
    today: "Aujourd'hui",
    tomorrow: "Demain",
    upcoming: "À venir",
  };
  return labels[status];
}

export function getTaskStatusColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    completed: "green",
    overdue: "red",
    today: "blue",
    tomorrow: "orange",
    upcoming: "gray",
  };
  return colors[status];
}
