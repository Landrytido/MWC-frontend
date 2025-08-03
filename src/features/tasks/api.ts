import { httpService } from "../../shared/services/httpService";
import type {
  Task,
  CreateTaskForm,
  UpdateTaskForm,
  ApiTaskSummary,
  ApiTaskStats,
} from "./types";

// ==========================================
// API TASKS
// ==========================================
export const tasksApi = {
  // CRUD de base
  getAll: (): Promise<Task[]> => httpService.get("/tasks"),

  getById: (id: number): Promise<Task> => httpService.get(`/tasks/${id}`),

  create: (task: CreateTaskForm): Promise<Task> =>
    httpService.post("/tasks", task),

  update: (id: number, task: UpdateTaskForm): Promise<Task> =>
    httpService.put(`/tasks/${id}`, task),

  delete: (id: number): Promise<void> => httpService.delete(`/tasks/${id}`),

  toggle: (id: number): Promise<Task> => httpService.put(`/tasks/${id}/toggle`),

  search: async (keyword: string): Promise<Task[]> => {
    if (!keyword.trim()) {
      return await tasksApi.getAll();
    }
    return httpService.get("/tasks/search", { keyword });
  },

  // Filtres par statut
  getPending: (): Promise<Task[]> => httpService.get("/tasks/pending"),

  getCompleted: (): Promise<Task[]> => httpService.get("/tasks/completed"),

  getOverdue: (): Promise<Task[]> => httpService.get("/tasks/overdue"),

  getTodayTasks: (): Promise<Task[]> => httpService.get("/tasks/today"),

  getTomorrowTasks: (): Promise<Task[]> => httpService.get("/tasks/tomorrow"),

  getTasksByDate: (date: string): Promise<Task[]> =>
    httpService.get("/tasks/by-date", { date }),

  getCarriedOverTasks: (): Promise<Task[]> =>
    httpService.get("/tasks/carried-over"),

  getTasksDueInDays: (days: number = 7): Promise<Task[]> =>
    httpService.get("/tasks/due-in-days", { days }),

  getTasksByPriority: (priority: number): Promise<Task[]> =>
    httpService.get("/tasks/by-priority", { priority }),

  // Statistiques
  getPendingCount: (): Promise<{ count: number }> =>
    httpService.get("/tasks/pending/count"),

  getSummary: (): Promise<ApiTaskSummary> => httpService.get("/tasks/summary"),

  getMonthlyStats: (year: number, month: number): Promise<ApiTaskStats> =>
    httpService.get("/tasks/stats/monthly", { year, month }),

  endDay: (data: {
    date?: string;
    taskIdsToCarryOver?: number[];
    markDayAsCompleted?: boolean;
  }): Promise<Task[]> => httpService.post("/tasks/end-day", data),

  reorderTasks: (data: {
    taskIds: number[];
    scheduledDate?: string;
  }): Promise<Task[]> => httpService.post("/tasks/reorder", data),
};
