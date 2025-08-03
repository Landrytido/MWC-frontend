import { httpService } from "../../shared/services/httpService";
import type {
  Notebook,
  CreateNotebookForm,
  NotebookUsageStats,
  NotebookWithNotes,
} from "./types";

export const notebooksApi = {
  getAll: (): Promise<Notebook[]> => httpService.get("/notebooks"),

  getById: (id: number): Promise<Notebook> =>
    httpService.get(`/notebooks/${id}`),

  getNotes: (
    notebookId: number,
    params?: { limit?: number; offset?: number }
  ): Promise<NotebookWithNotes> =>
    httpService.get(`/notebooks/${notebookId}/notes`, params),

  create: (notebook: CreateNotebookForm): Promise<Notebook> =>
    httpService.post("/notebooks", notebook),

  update: (id: number, notebook: CreateNotebookForm): Promise<Notebook> =>
    httpService.put(`/notebooks/${id}`, notebook),

  delete: (id: number, forceDelete: boolean = true): Promise<void> =>
    httpService.delete(`/notebooks/${id}?forceDelete=${forceDelete}`),

  getUsageStats: (): Promise<NotebookUsageStats> =>
    httpService.get("/notebooks/stats"),
};
