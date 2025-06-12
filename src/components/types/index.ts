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

// ⭐ TYPES POUR LA PLANIFICATION (correspondant au backend)
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

// ⭐ INTERFACE TASK CORRIGÉE (basée sur le backend Spring Boot)
export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string; // LocalDateTime du backend
  scheduledDate?: string; // LocalDate du backend
  priority: TaskPriority; // 1, 2, 3
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;

  // Propriétés de planification quotidienne (du backend)
  carriedOver: boolean;
  originalDate?: string;
  orderIndex: number;

  // Propriétés calculées côté backend
  status?: string; // "completed", "overdue", "today", "tomorrow", "upcoming"
}

// ⭐ FORM TYPES CORRIGÉS
export interface CreateTaskForm {
  title: string;
  description?: string;
  dueDate?: string;
  scheduledDate?: string;
  priority?: TaskPriority;
}

export interface UpdateTaskForm extends Partial<CreateTaskForm> {
  completed?: boolean;
  carriedOver?: boolean;
  originalDate?: string;
  orderIndex?: number;
}

// ⭐ STATISTIQUES SIMPLIFIÉES (basées sur ce que le backend peut fournir)
export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  notCompletedTasks: number;
  completionPercentage: number;
  tasksByPriority: Record<
    number,
    { total: number; completed: number; completionRate: number }
  >;
  dailyStats: Record<
    string,
    { date: string; total: number; completed: number; completionRate: number }
  >;
}

// ⭐ FONCTION UTILITAIRE pour calculer le statut
export function getTaskStatus(task: Task): TaskStatus {
  if (task.completed) return "completed";

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  if (task.scheduledDate === today) return "today";
  if (task.scheduledDate === tomorrow) return "tomorrow";

  if (task.dueDate && new Date(task.dueDate) < new Date()) return "overdue";

  return "upcoming";
}

// Reste des interfaces existantes inchangées...
export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notebook {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  noteCount?: number;
}

export interface Label {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  noteCount?: number;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
  taskCount?: number;
  completedTaskCount?: number;
  notebookId?: number;
  notebookTitle?: string;
  labels?: Label[];
  comments?: Comment[];
}

export interface Comment {
  id: number;
  content: string;
  noteId: number;
  createdAt: string;
  author: User;
}

export interface SavedLink {
  id: number;
  url: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinkGroup {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  linkCount?: number;
  savedLinks?: SavedLinkGroup[];
}

export interface SavedLinkGroup {
  savedLinkId: number;
  linkGroupId: string;
  linkName: string;
  url: string;
  clickCounter: number;
  savedLinkDetails: SavedLink;
}

export interface DailyTask {
  id: number;
  uniqueTaskId: string;
  title: string;
  description?: string;
  scheduledDate: string;
  originalDate?: string;
  carriedOver: boolean;
  orderIndex: number;
  priority: number;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteTask {
  id: number;
  title: string;
  completed: boolean;
  noteId: number;
  parentId?: number;
  subtasks?: NoteTask[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  totalSubtasks?: number;
  completedSubtasks?: number;
}

export interface FileInfo {
  id: number;
  filename: string;
  initialFilename: string;
  uri: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlocNote {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyReport {
  totalTasks: number;
  completedTasks: number;
  notCompletedTasks: number;
  completionPercentage: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Form types existants
export interface CreateNoteForm {
  title: string;
  content: string;
  notebookId?: number;
  labelIds?: string[];
}

export interface CreateNotebookForm {
  title: string;
}

export interface CreateLabelForm {
  name: string;
}

export interface CreateLinkForm {
  url: string;
  title: string;
  description?: string;
}

export interface CreateDailyTaskForm {
  title: string;
  description?: string;
  scheduledDate: string;
  priority: number;
}

export interface CreateCommentForm {
  content: string;
  noteId: number;
}

// Filter and sorting types
export interface NotesFilter {
  notebookId?: number;
  labelIds?: string[];
  searchTerm?: string;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// Dashboard statistics
export interface DashboardStats {
  notesCount: number;
  linksCount: number;
  tasksCount: number;
  pendingTasksCount: number;
  notebooksCount: number;
  labelsCount: number;
}
