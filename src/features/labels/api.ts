import { httpService } from "../../shared/services/httpService";
import { Label, CreateLabelForm, LabelUsageStats } from "./types";
import { Note } from "../notes/types";

export const labelsApi = {
  getAll: (): Promise<Label[]> => httpService.get("/labels"),

  getById: (labelId: string): Promise<Label> =>
    httpService.get(`/labels/${labelId}`),

  getNotes: (labelId: string): Promise<Note[]> =>
    httpService.get(`/labels/${labelId}/notes`),

  search: (keyword: string): Promise<Label[]> =>
    httpService.get("/labels/search", { keyword }),

  create: (label: CreateLabelForm): Promise<Label> =>
    httpService.post("/labels", label),

  update: (id: string, label: { name: string }): Promise<Label> =>
    httpService.put(`/labels/${id}`, label),

  delete: (id: string, forceDelete = false): Promise<void> =>
    httpService.delete(`/labels/${id}?forceDelete=${forceDelete}`),

  getUsageStats: (): Promise<LabelUsageStats> =>
    httpService.get("/labels/stats"),
};
