export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
}

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchParams {
  query?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResponse<T> {
  results: T[];
  total: number;
  query: string;
}

// Types pour les actions bulk (utilisé par plusieurs features)
export interface BulkActionResult {
  successCount: number;
  failureCount: number;
  errors: string[];
}

// États UI globaux
export interface UIState {
  sidebarCollapsed: boolean;
  searchTerm: string;
  currentView: "grid" | "list" | "compact";
  theme: "light" | "dark" | "auto";
}

// Types d'erreur standardisés
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  details?: Record<string, unknown>;
}

// Type pour les sélecteurs génériques
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  icon?: string;
}

// ==========================================
// UTILITAIRES DE TYPES
// ==========================================

export type WithId<T> = T & { id: number | string };
export type WithTimestamps<T> = T & {
  createdAt: string;
  updatedAt: string;
};
export type CreateForm<T> = Omit<T, "id" | "createdAt" | "updatedAt">;
export type UpdateForm<T> = Partial<CreateForm<T>>;

// ==========================================
// CONSTANTES PARTAGÉES
// ==========================================

export const COMMON_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  AUTO_SAVE_DELAY: 2000,
  NOTIFICATION_TIMEOUT: 3000,
} as const;
