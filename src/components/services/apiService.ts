import { useAuth } from "../contexts/AuthContext";
import { useApp, AppState } from "../contexts/AppContext";
import { useCallback, useMemo } from "react";
import { authService } from "./authService";
import {
  Note,
  BlocNote,
  CreateNoteForm,
  Comment,
  FileInfo,
  FileUploadResponse,
  FileStatistics,
  User,
} from "../types";
import {
  CalendarViewDto,
  EventDto,
  CreateEventRequest,
} from "../types/calendar";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const useApiService = () => {
  const { getToken } = useAuth();
  const { dispatch } = useApp();

  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const token = getToken();

      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      };

      try {
        const response = await authService.authenticatedFetch(
          `${API_BASE_URL}${url}`,
          { ...options, headers }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message ||
              `Erreur ${response.status}: ${response.statusText}`
          );
        }

        const text = await response.text();
        return text && text.trim() !== "" ? JSON.parse(text) : null;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("Session expired")
        ) {
          window.location.href = "/login";
        }
        throw error;
      }
    },
    [getToken]
  );

  const fetchWithAuthMultipart = useCallback(
    async (url: string, formData: FormData) => {
      const token = getToken();

      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
          method: "POST",
          headers,
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message ||
              `Erreur ${response.status}: ${response.statusText}`
          );
        }

        return await response.json();
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("Session expired")
        ) {
          window.location.href = "/login";
        }
        throw error;
      }
    },
    [getToken]
  );

  const setLoading = useCallback(
    (key: string, isLoading: boolean, error?: string) => {
      dispatch({
        type: "SET_LOADING",
        payload: {
          key: key as keyof AppState["loadingStates"],
          loading: { isLoading, error },
        },
      });
    },
    [dispatch]
  );

  // ✅ NOTES API - Pas encore migré en feature
  const notesApi = useMemo(
    () => ({
      getAll: async (): Promise<Note[]> => {
        setLoading("notes", true);
        try {
          const notes = await fetchWithAuth("/notes");
          dispatch({ type: "SET_NOTES", payload: notes });
          setLoading("notes", false);
          return notes;
        } catch (error) {
          setLoading(
            "notes",
            false,
            error instanceof Error ? error.message : "Erreur inconnue"
          );
          throw error;
        }
      },

      getById: async (id: number): Promise<Note> => {
        return await fetchWithAuth(`/notes/${id}`);
      },

      getByNotebook: async (notebookId: number): Promise<Note[]> => {
        return await fetchWithAuth(`/notes/notebooks/${notebookId}/notes`);
      },

      create: async (note: CreateNoteForm): Promise<Note> => {
        const cleanedNote = {
          ...note,
          notebookId: note.notebookId || undefined,
        };

        const created = await fetchWithAuth("/notes", {
          method: "POST",
          body: JSON.stringify(cleanedNote),
        });
        dispatch({ type: "ADD_NOTE", payload: created });
        return created;
      },

      createInNotebook: async (
        notebookId: number,
        note: Omit<CreateNoteForm, "notebookId">
      ): Promise<Note> => {
        const noteData = { ...note, notebookId };
        const created = await fetchWithAuth("/notes", {
          method: "POST",
          body: JSON.stringify(noteData),
        });
        dispatch({ type: "ADD_NOTE", payload: created });
        return created;
      },

      update: async (id: number, note: Partial<Note>): Promise<Note> => {
        const updated = await fetchWithAuth(`/notes/${id}`, {
          method: "PUT",
          body: JSON.stringify(note),
        });
        dispatch({ type: "UPDATE_NOTE", payload: { id, note: updated } });
        return updated;
      },

      moveToNotebook: async (
        id: number,
        notebookId: number | null
      ): Promise<Note> => {
        const updated = await fetchWithAuth(`/notes/${id}/notebook`, {
          method: "PUT",
          body: JSON.stringify({ notebookId }),
        });
        dispatch({ type: "UPDATE_NOTE", payload: { id, note: updated } });
        return updated;
      },

      delete: async (id: number): Promise<void> => {
        await fetchWithAuth(`/notes/${id}`, { method: "DELETE" });
        dispatch({ type: "DELETE_NOTE", payload: id });
      },

      addLabel: async (noteId: number, labelId: string): Promise<Note> => {
        const updated = await fetchWithAuth(
          `/notes/${noteId}/labels/${labelId}`,
          {
            method: "POST",
          }
        );
        dispatch({
          type: "UPDATE_NOTE",
          payload: { id: noteId, note: updated },
        });
        return updated;
      },

      removeLabel: async (noteId: number, labelId: string): Promise<Note> => {
        const updated = await fetchWithAuth(
          `/notes/${noteId}/labels/${labelId}`,
          {
            method: "DELETE",
          }
        );
        dispatch({
          type: "UPDATE_NOTE",
          payload: { id: noteId, note: updated },
        });
        return updated;
      },

      getByLabel: async (labelId: string): Promise<Note[]> => {
        return await fetchWithAuth(`/labels/${labelId}/notes`);
      },

      search: async (params: {
        query?: string;
        notebookId?: number | null;
        labelIds?: string[];
        limit?: number;
        offset?: number;
      }): Promise<{ notes: Note[]; total?: number }> => {
        const searchParams = new URLSearchParams();

        if (params.query) searchParams.append("query", params.query);
        if (params.notebookId)
          searchParams.append("notebookId", params.notebookId.toString());
        if (params.labelIds?.length) {
          params.labelIds.forEach((id) => searchParams.append("labelIds", id));
        }
        if (params.limit) searchParams.append("limit", params.limit.toString());
        if (params.offset)
          searchParams.append("offset", params.offset.toString());

        return await fetchWithAuth(`/notes/search?${searchParams.toString()}`);
      },

      getRecentNotes: async (limit: number = 10): Promise<Note[]> => {
        return await fetchWithAuth(`/notes/recent?limit=${limit}`);
      },

      getFavoriteNotes: async (): Promise<Note[]> => {
        return await fetchWithAuth("/notes/favorites");
      },

      toggleFavorite: async (noteId: number): Promise<Note> => {
        const updated = await fetchWithAuth(`/notes/${noteId}/favorite`, {
          method: "POST",
        });
        dispatch({
          type: "UPDATE_NOTE",
          payload: { id: noteId, note: updated },
        });
        return updated;
      },

      batchAddLabels: async (
        noteId: number,
        labelIds: string[]
      ): Promise<Note> => {
        const updated = await fetchWithAuth(`/notes/${noteId}/labels`, {
          method: "POST",
          body: JSON.stringify({ labelIds }),
        });
        dispatch({
          type: "UPDATE_NOTE",
          payload: { id: noteId, note: updated },
        });
        return updated;
      },

      batchRemoveLabels: async (
        noteId: number,
        labelIds: string[]
      ): Promise<Note> => {
        const updated = await fetchWithAuth(`/notes/${noteId}/labels`, {
          method: "DELETE",
          body: JSON.stringify({ labelIds }),
        });
        dispatch({
          type: "UPDATE_NOTE",
          payload: { id: noteId, note: updated },
        });
        return updated;
      },
    }),
    [fetchWithAuth, setLoading, dispatch]
  );

  // ✅ USER API - Pas encore migré en feature
  const userApi = useMemo(
    () => ({
      getProfile: async () => {
        return await fetchWithAuth("/users/profile");
      },
      getMe: async () => {
        return await fetchWithAuth("/users/me");
      },
      updateProfile: async (userData: {
        firstName?: string;
        lastName?: string;
      }): Promise<User> => {
        const updatedUser = await fetchWithAuth("/users/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
        return updatedUser;
      },
    }),
    [fetchWithAuth]
  );

  // ✅ COMMENTS API - Pas encore migré en feature
  const commentsApi = useMemo(
    () => ({
      getByNoteId: async (noteId: number) => {
        setLoading("comments", true);
        try {
          const comments = await fetchWithAuth(`/comments/note/${noteId}`);
          dispatch({
            type: "SET_NOTE_COMMENTS",
            payload: { noteId, comments },
          });
          setLoading("comments", false);
          return comments;
        } catch (error) {
          setLoading(
            "comments",
            false,
            error instanceof Error ? error.message : "Erreur inconnue"
          );
          throw error;
        }
      },

      getMy: async (): Promise<Comment[]> => {
        return await fetchWithAuth("/comments/my");
      },

      create: async (noteId: number, content: string): Promise<Comment> => {
        const created = await fetchWithAuth(`/comments/note/${noteId}`, {
          method: "POST",
          body: JSON.stringify({ content }),
        });
        dispatch({ type: "ADD_COMMENT", payload: created });
        return created;
      },

      update: async (id: number, content: string): Promise<Comment> => {
        const updated = await fetchWithAuth(`/comments/${id}`, {
          method: "PUT",
          body: JSON.stringify({ content }),
        });
        dispatch({ type: "UPDATE_COMMENT", payload: { id, comment: updated } });
        return updated;
      },

      delete: async (id: number): Promise<void> => {
        await fetchWithAuth(`/comments/${id}`, { method: "DELETE" });
        dispatch({ type: "DELETE_COMMENT", payload: id });
      },
    }),
    [fetchWithAuth, setLoading, dispatch]
  );

  // ✅ BLOC NOTE API - Pas encore migré en feature
  const blocNoteApi = useMemo(
    () => ({
      get: async (): Promise<BlocNote> => {
        setLoading("blocNote", true);
        try {
          const blocNote = await fetchWithAuth("/bloc-note");
          dispatch({ type: "SET_BLOC_NOTE", payload: blocNote });
          setLoading("blocNote", false);
          return blocNote;
        } catch (error) {
          setLoading(
            "blocNote",
            false,
            error instanceof Error ? error.message : "Erreur inconnue"
          );
          throw error;
        }
      },

      update: async (content: string): Promise<BlocNote> => {
        const updated = await fetchWithAuth("/bloc-note", {
          method: "PUT",
          body: JSON.stringify({ content }),
        });

        dispatch({ type: "SET_BLOC_NOTE", payload: updated });

        return updated;
      },

      delete: async (): Promise<void> => {
        await fetchWithAuth("/bloc-note", { method: "DELETE" });
        dispatch({ type: "SET_BLOC_NOTE", payload: null });
      },
    }),
    [fetchWithAuth, setLoading, dispatch]
  );

  // ✅ CALENDAR API - Pas encore migré en feature
  const calendarApi = useMemo(
    () => ({
      getMonthView: async (
        year: number,
        month: number
      ): Promise<CalendarViewDto[]> => {
        return await fetchWithAuth(`/calendar/month/${year}/${month}`);
      },
      getDayView: async (date: string): Promise<CalendarViewDto> => {
        return await fetchWithAuth(`/calendar/day/${date}`);
      },
      getAllEvents: async (): Promise<EventDto[]> => {
        return await fetchWithAuth("/calendar/events");
      },
      getEventById: async (id: number): Promise<EventDto> => {
        return await fetchWithAuth(`/calendar/events/${id}`);
      },
      createEvent: async (event: CreateEventRequest): Promise<EventDto> => {
        const created = await fetchWithAuth("/calendar/events", {
          method: "POST",
          body: JSON.stringify(event),
        });
        return created;
      },
      updateEvent: async (
        id: number,
        event: CreateEventRequest
      ): Promise<EventDto> => {
        const updated = await fetchWithAuth(`/calendar/events/${id}`, {
          method: "PUT",
          body: JSON.stringify(event),
        });
        return updated;
      },
      deleteEvent: async (id: number): Promise<void> => {
        await fetchWithAuth(`/calendar/events/${id}`, {
          method: "DELETE",
        });
      },

      createTaskFromCalendar: async (taskData: {
        title: string;
        description?: string;
        scheduledDate?: string;
        dueDate?: string;
        priority?: number;
      }) => {
        const created = await fetchWithAuth("/calendar/create-task", {
          method: "POST",
          body: JSON.stringify(taskData),
        });
        dispatch({ type: "ADD_TASK", payload: created });
        return created;
      },
      testEmail: async (): Promise<string> => {
        return await fetchWithAuth("/calendar/test-email", {
          method: "POST",
        });
      },
      getEventsInRange: async (
        startDate: string,
        endDate: string
      ): Promise<EventDto[]> => {
        const params = new URLSearchParams({
          startDate,
          endDate,
        });
        return await fetchWithAuth(
          `/calendar/events/range?${params.toString()}`
        );
      },
      searchEvents: async (query: string): Promise<EventDto[]> => {
        const params = new URLSearchParams({ query });
        return await fetchWithAuth(
          `/calendar/events/search?${params.toString()}`
        );
      },
    }),
    [fetchWithAuth, dispatch]
  );

  // ✅ FILES API - Pas encore migré en feature
  const filesApi = useMemo(
    () => ({
      getAll: async (): Promise<FileInfo[]> => {
        return await fetchWithAuth("/files");
      },

      getById: async (id: number): Promise<FileInfo> => {
        return await fetchWithAuth(`/files/${id}`);
      },

      getImages: async (): Promise<FileInfo[]> => {
        return await fetchWithAuth("/files/images");
      },

      getStatistics: async (): Promise<FileStatistics> => {
        return await fetchWithAuth("/files/statistics");
      },

      upload: async (file: File): Promise<FileUploadResponse> => {
        const formData = new FormData();
        formData.append("file", file);
        return await fetchWithAuthMultipart("/files/upload", formData);
      },

      delete: async (id: number): Promise<void> => {
        await fetchWithAuth(`/files/${id}`, { method: "DELETE" });
      },

      getDownloadUrl: (id: number): string => {
        return `${API_BASE_URL}/files/${id}/download`;
      },

      download: async (id: number): Promise<Blob> => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/files/${id}/download`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors du téléchargement");
        }

        return response.blob();
      },
    }),
    [fetchWithAuth, fetchWithAuthMultipart, getToken]
  );

  // ✅ HEALTH API - Pas encore migré en feature
  const healthApi = useMemo(
    () => ({
      check: async (): Promise<{ status: string }> => {
        return await fetchWithAuth("/health");
      },
    }),
    [fetchWithAuth]
  );

  return useMemo(
    () => ({
      // ✅ APIs conservées (pas encore migrées en features)
      health: healthApi,
      user: userApi,
      notes: notesApi,
      comments: commentsApi,
      blocNote: blocNoteApi,
      calendar: calendarApi,
      files: filesApi,

      // ❌ SUPPRIMÉ : notebooks, labels, tasks, links, linkGroups
      // → Maintenant disponibles via leurs hooks respectifs :
      // → useNotebooks(), useLabels(), useTasks(), useLinks()
    }),
    [
      healthApi,
      userApi,
      notesApi,
      commentsApi,
      blocNoteApi,
      calendarApi,
      filesApi,
    ]
  );
};
