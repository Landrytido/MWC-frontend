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
  dueDate?: string; // ISO string du backend
  scheduledDate?: string; // ISO string du backend
  priority: number;
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
  priority?: number;
  orderIndex?: number;
}

export interface UpdateTaskForm extends Partial<CreateTaskForm> {
  completed?: boolean;
  carriedOver?: boolean;
  originalDate?: string;
  orderIndex?: number;
}

// ⭐ NOUVEAUX TYPES pour les retours API backend
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

// ⭐ STATISTIQUES SIMPLIFIÉES (basées sur ce que le backend peut fournir)
export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  notCompletedTasks: number;
  completionPercentage: number;
  tasksByPriority: Record<number, { total: number; completed: number }>;
  dailyStats: Record<string, { total: number; completed: number }>;
}

export function getTaskPriorityEnum(priority: number): TaskPriority {
  // Protection contre les valeurs invalides
  if (priority === 1) return TaskPriority.LOW;
  if (priority === 3) return TaskPriority.HIGH;
  return TaskPriority.MEDIUM; // défaut
}

export function getPriorityConfig(priority: number) {
  const priorityEnum = getTaskPriorityEnum(priority);
  return PRIORITY_LABELS[priorityEnum];
}

// ⭐ FONCTION UTILITAIRE pour calculer le statut
export function getTaskStatus(task: Task): string {
  if (task.completed) return "completed";

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  if (task.scheduledDate === today) return "today";
  if (task.scheduledDate === tomorrow) return "tomorrow";

  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    if (dueDate < now) return "overdue";
  }

  return "upcoming";
}

// ⭐ INTERFACES UTILISATEUR
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

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// ⭐ INTERFACES NOTEBOOKS
export interface Notebook {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  noteCount?: number;
}

// ⭐ INTERFACES LABELS
export interface Label {
  id: string; // ✅ String car UUID côté backend
  name: string;
  createdAt: string;
  updatedAt: string;
  noteCount?: number;
}

// ⭐ INTERFACES NOTES
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

// ⭐ INTERFACES COMMENTS
export interface Comment {
  id: number;
  content: string;
  noteId: number;
  author: {
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  createdAt: string;
  updatedAt?: string;
}

// ⭐ INTERFACES SAVED LINKS
export interface SavedLink {
  id: number;
  url: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// ⭐ NOUVELLES INTERFACES LINK GROUPS
export interface LinkGroup {
  id: string; // ✅ String car UUID côté backend
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

// ⭐ INTERFACES NOTE TASKS
export interface NoteTask {
  id: number;
  title: string;
  completed: boolean;
  noteId: number;
  parentId?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;

  // Propriétés calculées côté backend
  subtasks?: NoteTask[];
  completedSubtasks?: number;
  totalSubtasks?: number;
}

// ⭐ NOUVELLES INTERFACES FILES
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

export interface FileUploadResponse {
  id: number;
  filename: string;
  uri: string;
  message: string;
}

export interface FileStatistics {
  totalFiles: number;
  totalSizeMB: number;
  filesByType: Record<string, number>;
}

// ⭐ INTERFACE BLOC NOTE
export interface BlocNote {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// ⭐ INTERFACESDAILY TASKS (si utilisées)
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

// ⭐ INTERFACE MONTHLY REPORT
export interface MonthlyReport {
  totalTasks: number;
  completedTasks: number;
  notCompletedTasks: number;
  completionPercentage: number;
}

// ⭐ API RESPONSE WRAPPER
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// ⭐ FORM TYPES
export interface CreateNoteForm {
  title: string;
  content: string;
  notebookId?: number;
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

export interface CreateLinkGroupForm {
  title: string;
  description?: string;
}

// ⭐ FILTER AND SORTING TYPES
export interface NotesFilter {
  notebookId?: number;
  labelIds?: string[];
  searchTerm?: string;
}

export interface TasksFilter {
  status?: TaskStatus;
  priority?: number;
  scheduledDate?: string;
  searchTerm?: string;
}

// ⭐ LOADING STATES
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// ⭐ DASHBOARD STATISTICS
export interface DashboardStats {
  notesCount: number;
  linksCount: number;
  tasksCount: number;
  pendingTasksCount: number;
  notebooksCount: number;
  labelsCount: number;
  filesCount: number;
  linkGroupsCount: number;
}

// ⭐ TYPES POUR ENDPOINTS SPÉCIAUX
export interface EndDayRequest {
  date?: string;
  taskIdsToCarryOver?: number[];
  markDayAsCompleted?: boolean;
}

export interface ReorderTasksRequest {
  taskIds: number[];
  scheduledDate?: string;
}

// ⭐ HEALTH CHECK
export interface HealthStatus {
  status: string;
}
