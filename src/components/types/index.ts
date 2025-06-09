// src/components/types/index.ts (Version mise à jour)
// Enhanced types aligned with backend DTOs
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

export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  status: "upcoming" | "overdue" | "completed";
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

// Form types
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

export interface CreateTaskForm {
  title: string;
  description?: string;
  dueDate?: string;
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

export interface TasksFilter {
  status?: "all" | "pending" | "completed" | "overdue";
  dueInDays?: number;
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
