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

export interface NotebookSelectorProps {
  selectedNotebookId?: number | null;
  onNotebookChange: (notebookId: number | null) => void;
  includeNone?: boolean;
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

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface CreateCommentForm {
  content: string;
  noteId: number;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface HealthStatus {
  status: string;
}
