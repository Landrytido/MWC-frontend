import {
  Note,
  Comment,
  CreateNoteForm,
  UpdateNoteForm,
  CreateCommentForm,
  NotesSearchParams,
} from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

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

// API Notes
export const notesApi = {
  // CRUD de base
  getAll: async (): Promise<Note[]> => {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: number): Promise<Note> => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getByNotebook: async (notebookId: number): Promise<Note[]> => {
    const response = await fetch(
      `${API_BASE_URL}/notes/notebooks/${notebookId}/notes`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  create: async (note: CreateNoteForm): Promise<Note> => {
    const cleanedNote = {
      ...note,
      notebookId: note.notebookId || undefined,
    };

    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(cleanedNote),
    });
    return handleResponse(response);
  },

  createInNotebook: async (
    notebookId: number,
    note: Omit<CreateNoteForm, "notebookId">
  ): Promise<Note> => {
    const noteData = { ...note, notebookId };
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(noteData),
    });
    return handleResponse(response);
  },

  update: async (id: number, note: UpdateNoteForm): Promise<Note> => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(note),
    });
    return handleResponse(response);
  },

  moveToNotebook: async (
    id: number,
    notebookId: number | null
  ): Promise<Note> => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}/notebook`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ notebookId }),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    await handleResponse(response);
  },

  // Labels
  addLabel: async (noteId: number, labelId: string): Promise<Note> => {
    const response = await fetch(
      `${API_BASE_URL}/notes/${noteId}/labels/${labelId}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  removeLabel: async (noteId: number, labelId: string): Promise<Note> => {
    const response = await fetch(
      `${API_BASE_URL}/notes/${noteId}/labels/${labelId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  getByLabel: async (labelId: string): Promise<Note[]> => {
    const response = await fetch(`${API_BASE_URL}/labels/${labelId}/notes`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  batchAddLabels: async (noteId: number, labelIds: string[]): Promise<Note> => {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}/labels`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ labelIds }),
    });
    return handleResponse(response);
  },

  batchRemoveLabels: async (
    noteId: number,
    labelIds: string[]
  ): Promise<Note> => {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}/labels`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      body: JSON.stringify({ labelIds }),
    });
    return handleResponse(response);
  },

  // Recherche et filtres
  search: async (
    params: NotesSearchParams
  ): Promise<{ notes: Note[]; total?: number }> => {
    const searchParams = new URLSearchParams();

    if (params.query) searchParams.append("query", params.query);
    if (params.notebookId)
      searchParams.append("notebookId", params.notebookId.toString());
    if (params.labelIds?.length) {
      params.labelIds.forEach((id) => searchParams.append("labelIds", id));
    }
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.offset) searchParams.append("offset", params.offset.toString());

    const response = await fetch(
      `${API_BASE_URL}/notes/search?${searchParams.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  getRecentNotes: async (limit: number = 10): Promise<Note[]> => {
    const response = await fetch(
      `${API_BASE_URL}/notes/recent?limit=${limit}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  getFavoriteNotes: async (): Promise<Note[]> => {
    const response = await fetch(`${API_BASE_URL}/notes/favorites`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  toggleFavorite: async (noteId: number): Promise<Note> => {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}/favorite`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// API Comments
export const commentsApi = {
  getByNoteId: async (noteId: number): Promise<Comment[]> => {
    const response = await fetch(`${API_BASE_URL}/comments/note/${noteId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getMy: async (): Promise<Comment[]> => {
    const response = await fetch(`${API_BASE_URL}/comments/my`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (noteId: number, content: string): Promise<Comment> => {
    const response = await fetch(`${API_BASE_URL}/comments/note/${noteId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    return handleResponse(response);
  },

  update: async (id: number, content: string): Promise<Comment> => {
    const response = await fetch(`${API_BASE_URL}/comments/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/comments/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    await handleResponse(response);
  },
};
