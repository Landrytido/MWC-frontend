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

export type LabelColorName =
  | "teal"
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "red"
  | "gray";

export interface LabelColorConfig {
  default: string;
  outlined: string;
  minimal: string;
  dot: string;
}

export const LABEL_COLORS: Record<LabelColorName, LabelColorConfig> = {
  teal: {
    default: "bg-teal-100 text-teal-800",
    outlined: "border-teal-300 text-teal-700 bg-white",
    minimal: "text-teal-600",
    dot: "bg-teal-500",
  },
  blue: {
    default: "bg-blue-100 text-blue-800",
    outlined: "border-blue-300 text-blue-700 bg-white",
    minimal: "text-blue-600",
    dot: "bg-blue-500",
  },
  green: {
    default: "bg-green-100 text-green-800",
    outlined: "border-green-300 text-green-700 bg-white",
    minimal: "text-green-600",
    dot: "bg-green-500",
  },
  yellow: {
    default: "bg-yellow-100 text-yellow-800",
    outlined: "border-yellow-300 text-yellow-700 bg-white",
    minimal: "text-yellow-600",
    dot: "bg-yellow-500",
  },
  purple: {
    default: "bg-purple-100 text-purple-800",
    outlined: "border-purple-300 text-purple-700 bg-white",
    minimal: "text-purple-600",
    dot: "bg-purple-500",
  },
  red: {
    default: "bg-red-100 text-red-800",
    outlined: "border-red-300 text-red-700 bg-white",
    minimal: "text-red-600",
    dot: "bg-red-500",
  },
  gray: {
    default: "bg-gray-100 text-gray-800",
    outlined: "border-gray-300 text-gray-700 bg-white",
    minimal: "text-gray-600",
    dot: "bg-gray-500",
  },
};

export const AVAILABLE_LABEL_COLORS: LabelColorName[] = [
  "teal",
  "blue",
  "green",
  "yellow",
  "purple",
  "red",
];

export const getLabelColor = (labelId: string): LabelColorName => {
  let hash = 0;
  for (let i = 0; i < labelId.length; i++) {
    hash = labelId.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  return AVAILABLE_LABEL_COLORS[hash % AVAILABLE_LABEL_COLORS.length];
};

export const getLabelColorClasses = (
  colorName: LabelColorName,
  variant: "default" | "outlined" | "minimal" = "default"
): LabelColorConfig => {
  return LABEL_COLORS[colorName];
};
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

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  notCompletedTasks: number;
  completionPercentage: number;
  tasksByPriority: Record<number, { total: number; completed: number }>;
  dailyStats: Record<string, { total: number; completed: number }>;
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

export function isTaskOverdue(task: Task): boolean {
  return task.status === "overdue";
}

export function isTaskToday(task: Task): boolean {
  return task.status === "today";
}

export function isTaskTomorrow(task: Task): boolean {
  return task.status === "tomorrow";
}

export function isTaskCompleted(task: Task): boolean {
  return task.status === "completed";
}

export function isTaskUpcoming(task: Task): boolean {
  return task.status === "upcoming";
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
  color?: string;
  isSelected?: boolean;
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
  author: {
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface CreateNoteForm {
  title: string;
  content: string;
  notebookId?: number | null;
  labelIds?: string[];
}

export interface UpdateNoteForm {
  title?: string;
  content?: string;
  notebookId?: number | null;
}

export interface CreateNotebookForm {
  title: string;
}

export interface CreateLabelForm {
  name: string;
  color?: string;
}

export interface NotesFilter {
  notebookId?: number | null;
  labelIds?: string[];
  searchTerm?: string;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
}

export interface NotesSearchParams {
  query?: string;
  notebookId?: number;
  labelIds?: string[];
  limit?: number;
  offset?: number;
}

export interface LabelUsageStats {
  totalLabels: number;
  mostUsedLabels: Array<{
    label: Label;
    noteCount: number;
  }>;
  unusedLabels: Label[];
}

export interface NotebookUsageStats {
  totalNotebooks: number;
  notebooksWithMostNotes: Array<{
    notebook: Notebook;
    noteCount: number;
  }>;
  emptyNotebooks: Notebook[];
}

export interface DashboardStats {
  notesCount: number;
  linksCount: number;
  tasksCount: number;
  pendingTasksCount: number;
  notebooksCount: number;
  labelsCount: number;
  filesCount: number;
  linkGroupsCount: number;

  notesWithoutNotebook: number;
  notesWithoutLabels: number;
  averageLabelsPerNote: number;
  averageNotesPerNotebook: number;
}

export interface LabelBadgeProps {
  label: Label;
  removable?: boolean;
  onRemove?: (labelId: string) => void;
  clickable?: boolean;
  onClick?: (labelId: string) => void;
  size?: "sm" | "md" | "lg";
}

export interface NotebookSelectorProps {
  selectedNotebookId?: number | null;
  onNotebookChange: (notebookId: number | null) => void;
  includeNone?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export interface LabelSelectorProps {
  selectedLabelIds: string[];
  onLabelsChange: (labelIds: string[]) => void;
  maxSelections?: number;
  creatable?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export interface DragDropNote {
  id: number;
  title: string;
  type: "note";
}

export interface DropTarget {
  type: "notebook" | "label" | "trash";
  id: string | number;
}

export interface ExportData {
  notes: Note[];
  notebooks: Notebook[];
  labels: Label[];
  exportedAt: string;
  version: string;
}

export interface ImportResult {
  importedNotes: number;
  importedNotebooks: number;
  importedLabels: number;
  skippedDuplicates: number;
  errors: string[];
}

export interface BulkNoteAction {
  type: "moveToNotebook" | "addLabels" | "removeLabels" | "delete";
  noteIds: number[];
  targetNotebookId?: number | null;
  labelIds?: string[];
}

export interface BulkActionResult {
  successCount: number;
  failureCount: number;
  errors: string[];
}

export interface NavigationState {
  currentNotebook: number | null;
  selectedLabels: string[];
  searchTerm: string;
  viewMode: "grid" | "list" | "compact";
  sortBy: "createdAt" | "updatedAt" | "title";
  sortOrder: "asc" | "desc";
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncAt?: string;
  pendingChanges: number;
  syncInProgress: boolean;
  syncErrors: string[];
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

export interface CreateLinkForm {
  url: string;
  title: string;
  description?: string;
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

export interface BlocNote {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
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

export interface MonthlyReport {
  totalTasks: number;
  completedTasks: number;
  notCompletedTasks: number;
  completionPercentage: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
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

export interface TasksFilter {
  status?: TaskStatus;
  priority?: number;
  scheduledDate?: string;
  searchTerm?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface EndDayRequest {
  date?: string;
  taskIdsToCarryOver?: number[];
  markDayAsCompleted?: boolean;
}

export interface ReorderTasksRequest {
  taskIds: number[];
  scheduledDate?: string;
}

export interface HealthStatus {
  status: string;
}
