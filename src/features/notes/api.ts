import { httpService } from "../../shared/services/httpService";
import type {
  Note,
  Comment,
  CreateNoteForm,
  UpdateNoteForm,
  NotesSearchParams,
} from "./types";

export const notesApi = {
  getAll: (): Promise<Note[]> => httpService.get("/notes"),

  getById: (id: number): Promise<Note> => httpService.get(`/notes/${id}`),

  getByNotebook: (notebookId: number): Promise<Note[]> =>
    httpService.get(`/notes/notebooks/${notebookId}/notes`),

  create: (note: CreateNoteForm): Promise<Note> => {
    const cleanedNote = {
      ...note,
      notebookId: note.notebookId || undefined,
    };
    return httpService.post("/notes", cleanedNote);
  },

  createInNotebook: (
    notebookId: number,
    note: Omit<CreateNoteForm, "notebookId">
  ): Promise<Note> => {
    const noteData = { ...note, notebookId };
    return httpService.post("/notes", noteData);
  },

  update: (id: number, note: UpdateNoteForm): Promise<Note> =>
    httpService.put(`/notes/${id}`, note),

  moveToNotebook: (id: number, notebookId: number | null): Promise<Note> =>
    httpService.put(`/notes/${id}/notebook`, { notebookId }),

  delete: (id: number): Promise<void> => httpService.delete(`/notes/${id}`),

  // Labels
  addLabel: (noteId: number, labelId: string): Promise<Note> =>
    httpService.post(`/notes/${noteId}/labels/${labelId}`),

  removeLabel: (noteId: number, labelId: string): Promise<Note> =>
    httpService.delete(`/notes/${noteId}/labels/${labelId}`),

  getByLabel: (labelId: string): Promise<Note[]> =>
    httpService.get(`/labels/${labelId}/notes`),

  batchAddLabels: (noteId: number, labelIds: string[]): Promise<Note> =>
    httpService.post(`/notes/${noteId}/labels`, { labelIds }),

  batchRemoveLabels: (noteId: number, labelIds: string[]): Promise<Note> => {
    const labelIdsParam = labelIds
      .map((id) => `labelIds=${encodeURIComponent(id)}`)
      .join("&");
    return httpService.delete(`/notes/${noteId}/labels?${labelIdsParam}`);
  },

  search: (
    params: NotesSearchParams
  ): Promise<{ notes: Note[]; total?: number }> =>
    httpService.get("/notes/search", params),

  getRecentNotes: (limit: number = 10): Promise<Note[]> =>
    httpService.get("/notes/recent", { limit }),

  getFavoriteNotes: (): Promise<Note[]> => httpService.get("/notes/favorites"),

  toggleFavorite: (noteId: number): Promise<Note> =>
    httpService.post(`/notes/${noteId}/favorite`),
};

// ==========================================
// API COMMENTS
// ==========================================
export const commentsApi = {
  getByNoteId: (noteId: number): Promise<Comment[]> =>
    httpService.get(`/comments/note/${noteId}`),

  getMy: (): Promise<Comment[]> => httpService.get("/comments/my"),

  create: (noteId: number, content: string): Promise<Comment> =>
    httpService.post(`/comments/note/${noteId}`, { content }),

  update: (id: number, content: string): Promise<Comment> =>
    httpService.put(`/comments/${id}`, { content }),

  delete: (id: number): Promise<void> => httpService.delete(`/comments/${id}`),
};
