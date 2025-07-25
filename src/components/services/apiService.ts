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
import { Notebook, CreateNotebookForm } from "../../features/notebooks";
import { Label, CreateLabelForm } from "../../features/labels";
import {
  SavedLink,
  CreateLinkForm,
  LinkGroup,
  SavedLinkGroup,
} from "../../features/links";
import {
  Task,
  CreateTaskForm,
  UpdateTaskForm,
  ApiTaskSummary,
  ApiTaskStats,
} from "../../features/tasks";
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
  const labelsApi = useMemo(
    () => ({
      getAll: async (): Promise<Label[]> => {
        setLoading("labels", true);
        try {
          const labels = await fetchWithAuth("/labels");
          dispatch({ type: "SET_LABELS", payload: labels });
          setLoading("labels", false);
          return labels;
        } catch (error) {
          setLoading(
            "labels",
            false,
            error instanceof Error ? error.message : "Erreur inconnue"
          );
          throw error;
        }
      },

      getById: async (id: string): Promise<Label> => {
        return await fetchWithAuth(`/labels/${id}`);
      },
      getNotes: async (labelId: string): Promise<Note[]> => {
        return await fetchWithAuth(`/labels/${labelId}/notes`);
      },

      search: async (keyword: string): Promise<Label[]> => {
        return await fetchWithAuth(
          `/labels/search?keyword=${encodeURIComponent(keyword)}`
        );
      },

      create: async (label: CreateLabelForm): Promise<Label> => {
        const created = await fetchWithAuth(
          `/labels?name=${encodeURIComponent(label.name)}`,
          {
            method: "POST",
          }
        );
        dispatch({ type: "ADD_LABEL", payload: created });
        return created;
      },

      update: async (id: string, label: { name: string }): Promise<Label> => {
        const updated = await fetchWithAuth(
          `/labels/${id}?name=${encodeURIComponent(label.name)}`,
          { method: "PUT" }
        );
        dispatch({ type: "UPDATE_LABEL", payload: { id, label: updated } });
        return updated;
      },

      delete: async (id: string, forceDelete = false): Promise<void> => {
        await fetchWithAuth(`/labels/${id}?forceDelete=${forceDelete}`, {
          method: "DELETE",
        });
        dispatch({ type: "DELETE_LABEL", payload: id });
      },
      getUsageStats: async (): Promise<{
        totalLabels: number;
        mostUsedLabels: Array<{ label: Label; noteCount: number }>;
        unusedLabels: Label[];
      }> => {
        return await fetchWithAuth("/labels/stats");
      },
    }),
    [fetchWithAuth, setLoading, dispatch]
  );
  const notebooksApi = useMemo(
    () => ({
      getAll: async (): Promise<Notebook[]> => {
        setLoading("notebooks", true);
        try {
          const notebooks = await fetchWithAuth("/notebooks");
          dispatch({ type: "SET_NOTEBOOKS", payload: notebooks });
          setLoading("notebooks", false);
          return notebooks;
        } catch (error) {
          setLoading(
            "notebooks",
            false,
            error instanceof Error ? error.message : "Erreur inconnue"
          );
          throw error;
        }
      },

      getById: async (id: number): Promise<Notebook> => {
        return await fetchWithAuth(`/notebooks/${id}`);
      },
      getNotes: async (
        notebookId: number,
        params?: { limit?: number; offset?: number }
      ): Promise<{ notes: Note[]; total: number }> => {
        const searchParams = new URLSearchParams();
        if (params?.limit)
          searchParams.append("limit", params.limit.toString());
        if (params?.offset)
          searchParams.append("offset", params.offset.toString());

        const queryString = searchParams.toString();
        const url = `/notebooks/${notebookId}/notes${
          queryString ? `?${queryString}` : ""
        }`;

        return await fetchWithAuth(url);
      },

      create: async (notebook: CreateNotebookForm): Promise<Notebook> => {
        const created = await fetchWithAuth("/notebooks", {
          method: "POST",
          body: JSON.stringify(notebook),
        });
        dispatch({ type: "ADD_NOTEBOOK", payload: created });
        return created;
      },

      update: async (
        id: number,
        notebook: CreateNotebookForm
      ): Promise<Notebook> => {
        const updated = await fetchWithAuth(`/notebooks/${id}`, {
          method: "PUT",
          body: JSON.stringify(notebook),
        });
        dispatch({
          type: "UPDATE_NOTEBOOK",
          payload: { id, notebook: updated },
        });
        return updated;
      },

      delete: async (
        id: number,
        forceDelete: boolean = true
      ): Promise<void> => {
        await fetchWithAuth(`/notebooks/${id}?forceDelete=${forceDelete}`, {
          method: "DELETE",
        });
        dispatch({ type: "DELETE_NOTEBOOK", payload: id });
      },
      getUsageStats: async (): Promise<{
        totalNotebooks: number;
        notebooksWithMostNotes: Array<{
          notebook: Notebook;
          noteCount: number;
        }>;
        emptyNotebooks: Notebook[];
      }> => {
        return await fetchWithAuth("/notebooks/stats");
      },
    }),
    [fetchWithAuth, setLoading, dispatch]
  );
  const healthApi = useMemo(
    () => ({
      check: async (): Promise<{ status: string }> => {
        return await fetchWithAuth("/health");
      },
    }),
    [fetchWithAuth]
  );
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
  const tasksApi = useMemo(
    () => ({
      getAll: async (): Promise<Task[]> => {
        setLoading("tasks", true);
        try {
          const tasks = await fetchWithAuth("/tasks");
          dispatch({ type: "SET_TASKS", payload: tasks });
          setLoading("tasks", false);
          return tasks;
        } catch (error) {
          setLoading(
            "tasks",
            false,
            error instanceof Error ? error.message : "Erreur inconnue"
          );
          throw error;
        }
      },
      search: async (keyword: string): Promise<Task[]> => {
        if (!keyword.trim()) {
          return await fetchWithAuth("/tasks");
        }
        return await fetchWithAuth(
          `/tasks/search?keyword=${encodeURIComponent(keyword)}`
        );
      },
      getById: async (id: number): Promise<Task> => {
        return await fetchWithAuth(`/tasks/${id}`);
      },

      getPending: async (): Promise<Task[]> => {
        return await fetchWithAuth("/tasks/pending");
      },

      getCompleted: async (): Promise<Task[]> => {
        return await fetchWithAuth("/tasks/completed");
      },

      getOverdue: async (): Promise<Task[]> => {
        return await fetchWithAuth("/tasks/overdue");
      },

      getTodayTasks: async (): Promise<Task[]> => {
        return await fetchWithAuth("/tasks/today");
      },

      getTomorrowTasks: async (): Promise<Task[]> => {
        return await fetchWithAuth("/tasks/tomorrow");
      },

      getTasksByDate: async (date: string): Promise<Task[]> => {
        return await fetchWithAuth(`/tasks/by-date?date=${date}`);
      },

      getCarriedOverTasks: async (): Promise<Task[]> => {
        return await fetchWithAuth("/tasks/carried-over");
      },

      getTasksDueInDays: async (days: number = 7): Promise<Task[]> => {
        return await fetchWithAuth(`/tasks/due-in-days?days=${days}`);
      },

      searchTasks: async (keyword: string): Promise<Task[]> => {
        return await fetchWithAuth(
          `/tasks/search?keyword=${encodeURIComponent(keyword)}`
        );
      },

      getTasksByPriority: async (priority: number): Promise<Task[]> => {
        return await fetchWithAuth(`/tasks/by-priority?priority=${priority}`);
      },

      getPendingCount: async (): Promise<{ count: number }> => {
        return await fetchWithAuth("/tasks/pending/count");
      },

      getSummary: async (): Promise<ApiTaskSummary> => {
        return await fetchWithAuth("/tasks/summary");
      },

      getMonthlyStats: async (
        year: number,
        month: number
      ): Promise<ApiTaskStats> => {
        return await fetchWithAuth(
          `/tasks/stats/monthly?year=${year}&month=${month}`
        );
      },

      create: async (task: CreateTaskForm): Promise<Task> => {
        const created = await fetchWithAuth("/tasks", {
          method: "POST",
          body: JSON.stringify(task),
        });
        dispatch({ type: "ADD_TASK", payload: created });
        return created;
      },

      update: async (id: number, task: UpdateTaskForm): Promise<Task> => {
        const updated = await fetchWithAuth(`/tasks/${id}`, {
          method: "PUT",
          body: JSON.stringify(task),
        });
        dispatch({ type: "UPDATE_TASK", payload: { id, task: updated } });
        return updated;
      },

      toggle: async (id: number): Promise<Task> => {
        const updated = await fetchWithAuth(`/tasks/${id}/toggle`, {
          method: "PUT",
        });
        dispatch({ type: "UPDATE_TASK", payload: { id, task: updated } });
        return updated;
      },

      delete: async (id: number): Promise<void> => {
        await fetchWithAuth(`/tasks/${id}`, { method: "DELETE" });
        dispatch({ type: "DELETE_TASK", payload: id });
      },

      endDay: async (data: {
        date?: string;
        taskIdsToCarryOver?: number[];
        markDayAsCompleted?: boolean;
      }): Promise<Task[]> => {
        return await fetchWithAuth("/tasks/end-day", {
          method: "POST",
          body: JSON.stringify(data),
        });
      },

      reorderTasks: async (data: {
        taskIds: number[];
        scheduledDate?: string;
      }): Promise<Task[]> => {
        return await fetchWithAuth("/tasks/reorder", {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
    }),
    [fetchWithAuth, setLoading, dispatch]
  );
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
  const linksApi = useMemo(
    () => ({
      getAll: async (): Promise<SavedLink[]> => {
        setLoading("links", true);
        try {
          const links = await fetchWithAuth("/links");
          dispatch({ type: "SET_LINKS", payload: links });
          setLoading("links", false);
          return links;
        } catch (error) {
          setLoading(
            "links",
            false,
            error instanceof Error ? error.message : "Erreur inconnue"
          );
          throw error;
        }
      },
      search: async (keyword: string): Promise<SavedLink[]> => {
        if (!keyword.trim()) {
          return await fetchWithAuth("/links");
        }
        return await fetchWithAuth(
          `/links/search?keyword=${encodeURIComponent(keyword)}`
        );
      },
      getById: async (id: number): Promise<SavedLink> => {
        return await fetchWithAuth(`/links/${id}`);
      },

      create: async (link: CreateLinkForm): Promise<SavedLink> => {
        const created = await fetchWithAuth("/links", {
          method: "POST",
          body: JSON.stringify(link),
        });
        dispatch({ type: "ADD_LINK", payload: created });
        return created;
      },

      update: async (
        id: number,
        link: Partial<SavedLink>
      ): Promise<SavedLink> => {
        const updated = await fetchWithAuth(`/links/${id}`, {
          method: "PUT",
          body: JSON.stringify(link),
        });
        dispatch({ type: "UPDATE_LINK", payload: { id, link: updated } });
        return updated;
      },

      delete: async (id: number): Promise<void> => {
        await fetchWithAuth(`/links/${id}`, { method: "DELETE" });
        dispatch({ type: "DELETE_LINK", payload: id });
      },
    }),
    [fetchWithAuth, setLoading, dispatch]
  );
  const linkGroupsApi = useMemo(
    () => ({
      getAll: async (): Promise<LinkGroup[]> => {
        return await fetchWithAuth("/link-groups");
      },

      getById: async (id: string): Promise<LinkGroup> => {
        return await fetchWithAuth(`/link-groups/${id}`);
      },

      create: async (data: {
        title: string;
        description?: string;
      }): Promise<LinkGroup> => {
        return await fetchWithAuth("/link-groups", {
          method: "POST",
          body: JSON.stringify(data),
        });
      },

      update: async (
        id: string,
        data: { title: string; description?: string }
      ): Promise<LinkGroup> => {
        return await fetchWithAuth(`/link-groups/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      },

      delete: async (id: string): Promise<void> => {
        await fetchWithAuth(`/link-groups/${id}`, { method: "DELETE" });
      },

      getLinksInGroup: async (groupId: string): Promise<SavedLinkGroup[]> => {
        return await fetchWithAuth(`/link-groups/${groupId}/links`);
      },

      addLinkToGroup: async (
        groupId: string,
        linkId: number,
        linkName?: string
      ): Promise<SavedLinkGroup> => {
        return await fetchWithAuth(`/link-groups/${groupId}/links/${linkId}`, {
          method: "POST",
          body: JSON.stringify({ linkName }),
        });
      },

      updateLinkInGroup: async (
        groupId: string,
        linkId: number,
        linkName: string
      ): Promise<SavedLinkGroup> => {
        return await fetchWithAuth(`/link-groups/${groupId}/links/${linkId}`, {
          method: "PUT",
          body: JSON.stringify({ linkName }),
        });
      },

      removeLinkFromGroup: async (
        groupId: string,
        linkId: number
      ): Promise<void> => {
        await fetchWithAuth(`/link-groups/${groupId}/links/${linkId}`, {
          method: "DELETE",
        });
      },

      incrementClickCounter: async (
        groupId: string,
        linkId: number
      ): Promise<SavedLinkGroup> => {
        return await fetchWithAuth(
          `/link-groups/${groupId}/links/${linkId}/click`,
          {
            method: "POST",
          }
        );
      },

      getTopClickedLinks: async (
        groupId: string
      ): Promise<SavedLinkGroup[]> => {
        return await fetchWithAuth(`/link-groups/${groupId}/links/top-clicked`);
      },

      getGlobalTopClickedLinks: async (): Promise<SavedLinkGroup[]> => {
        return await fetchWithAuth("/link-groups/links/global-top-clicked");
      },
    }),
    [fetchWithAuth]
  );
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

  return useMemo(
    () => ({
      health: healthApi,
      user: userApi,
      notes: notesApi,
      notebooks: notebooksApi,
      labels: labelsApi,
      links: linksApi,
      linkGroups: linkGroupsApi,
      blocNote: blocNoteApi,
      tasks: tasksApi,
      comments: commentsApi,
      files: filesApi,
      calendar: calendarApi,
    }),
    [
      healthApi,
      userApi,
      notesApi,
      notebooksApi,
      labelsApi,
      linksApi,
      linkGroupsApi,
      blocNoteApi,
      tasksApi,
      commentsApi,
      filesApi,
      calendarApi,
    ]
  );
};
