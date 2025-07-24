import {
  Task,
  CreateTaskForm,
  UpdateTaskForm,
  ApiTaskSummary,
  ApiTaskStats,
} from "./types";

// Configuration de base (temporaire, sera dans shared plus tard)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Helper pour les appels authentifiés (temporaire, sera dans shared)
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message || `Erreur ${response.status}: ${response.statusText}`
    );
  }

  const text = await response.text();
  return text && text.trim() !== "" ? JSON.parse(text) : null;
};

// API Tasks
export const tasksApi = {
  // CRUD de base
  getAll: async (): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: number): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (task: CreateTaskForm): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(task),
    });
    return handleResponse(response);
  },

  update: async (id: number, task: UpdateTaskForm): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(task),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    await handleResponse(response);
  },

  toggle: async (id: number): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/toggle`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Recherche et filtres
  search: async (keyword: string): Promise<Task[]> => {
    if (!keyword.trim()) {
      return await tasksApi.getAll();
    }
    const response = await fetch(
      `${API_BASE_URL}/tasks/search?keyword=${encodeURIComponent(keyword)}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },

  // Filtres par statut
  getPending: async (): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/tasks/pending`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getCompleted: async (): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/tasks/completed`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getOverdue: async (): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/tasks/overdue`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getTodayTasks: async (): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/tasks/today`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getTomorrowTasks: async (): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/tasks/tomorrow`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getTasksByDate: async (date: string): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/tasks/by-date?date=${date}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getCarriedOverTasks: async (): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/tasks/carried-over`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getTasksDueInDays: async (days: number = 7): Promise<Task[]> => {
    const response = await fetch(
      `${API_BASE_URL}/tasks/due-in-days?days=${days}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  getTasksByPriority: async (priority: number): Promise<Task[]> => {
    const response = await fetch(
      `${API_BASE_URL}/tasks/by-priority?priority=${priority}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Statistiques
  getPendingCount: async (): Promise<{ count: number }> => {
    const response = await fetch(`${API_BASE_URL}/tasks/pending/count`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getSummary: async (): Promise<ApiTaskSummary> => {
    const response = await fetch(`${API_BASE_URL}/tasks/summary`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getMonthlyStats: async (
    year: number,
    month: number
  ): Promise<ApiTaskStats> => {
    const response = await fetch(
      `${API_BASE_URL}/tasks/stats/monthly?year=${year}&month=${month}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },

  // Actions avancées
  endDay: async (data: {
    date?: string;
    taskIdsToCarryOver?: number[];
    markDayAsCompleted?: boolean;
  }): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/tasks/end-day`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  reorderTasks: async (data: {
    taskIds: number[];
    scheduledDate?: string;
  }): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/tasks/reorder`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};
