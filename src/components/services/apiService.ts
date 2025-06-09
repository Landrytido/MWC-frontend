import { useAuth } from "../contexts/AuthContext";
import { useApp, AppState } from "../contexts/AppContext";
import { useCallback, useMemo } from "react";
import { authService } from "./authService";
import {
  Note,
  SavedLink,
  Notebook,
  Label,
  BlocNote,
  CreateNoteForm,
  CreateLinkForm,
  CreateNotebookForm,
  CreateLabelForm,
  Task,
  CreateTaskForm,
  Comment,
  NoteTask,
} from "../types";

// API Base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const useApiService = () => {
  const { getToken } = useAuth();
  const { dispatch } = useApp();

  // ✅ Utility function for authenticated requests with JWT
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
          {
            ...options,
            headers,
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message ||
              `Erreur ${response.status}: ${response.statusText}`
          );
        }

        return response.status !== 204 ? await response.json() : null;
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

  // ✅ NOTES API
  const notesApi = useMemo(
    () => ({
      getAll: async () => {
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

      create: async (note: CreateNoteForm): Promise<Note> => {
        const created = await fetchWithAuth("/notes", {
          method: "POST",
          body: JSON.stringify(note),
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

      delete: async (id: number): Promise<void> => {
        await fetchWithAuth(`/notes/${id}`, { method: "DELETE" });
        dispatch({ type: "DELETE_NOTE", payload: id });
      },
    }),
    [fetchWithAuth, setLoading, dispatch]
  );

  const notebooksApi = useMemo(
    () => ({
      getAll: async () => {
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

      create: async (notebook: CreateNotebookForm): Promise<Notebook> => {
        const created = await fetchWithAuth("/notebooks", {
          method: "POST",
          body: JSON.stringify(notebook),
        });
        dispatch({ type: "ADD_NOTEBOOK", payload: created });
        return created;
      },

      delete: async (id: number): Promise<void> => {
        await fetchWithAuth(`/notebooks/${id}`, { method: "DELETE" });
        dispatch({ type: "DELETE_NOTEBOOK", payload: id });
      },
    }),
    [fetchWithAuth, setLoading, dispatch]
  );

  // ✅ LABELS API - CORRIGÉ pour éviter les boucles
  const labelsApi = useMemo(
    () => ({
      getAll: async () => {
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

      update: async (id: string, label: Partial<Label>): Promise<Label> => {
        const updated = await fetchWithAuth(
          `/labels/${id}?name=${encodeURIComponent(label.name!)}`,
          {
            method: "PUT",
          }
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
    }),
    [fetchWithAuth, setLoading, dispatch]
  );

  // ✅ LINKS API
  const linksApi = useMemo(
    () => ({
      getAll: async () => {
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

  // ✅ BLOC NOTE API
  const blocNoteApi = useMemo(
    () => ({
      get: async () => {
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
        dispatch({ type: "UPDATE_BLOC_NOTE", payload: { content } });
        return updated;
      },

      delete: async (): Promise<void> => {
        await fetchWithAuth("/bloc-note", { method: "DELETE" });
        dispatch({ type: "SET_BLOC_NOTE", payload: null });
      },
    }),
    [fetchWithAuth, setLoading, dispatch]
  );

  // ✅ TASKS API
  const tasksApi = useMemo(
    () => ({
      getAll: async () => {
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

      create: async (task: CreateTaskForm): Promise<Task> => {
        const created = await fetchWithAuth("/tasks", {
          method: "POST",
          body: JSON.stringify(task),
        });
        dispatch({ type: "ADD_TASK", payload: created });
        return created;
      },

      update: async (id: number, task: Partial<Task>): Promise<Task> => {
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
    }),
    [fetchWithAuth, setLoading, dispatch]
  );

  // ✅ USER API
  const userApi = useMemo(
    () => ({
      getProfile: async () => {
        const profile = await fetchWithAuth("/users/profile");
        return profile;
      },

      updateProfile: async (userData: {
        firstName?: string;
        lastName?: string;
      }) => {
        const updated = await fetchWithAuth("/users/profile", {
          method: "PUT",
          body: JSON.stringify(userData),
        });
        return updated;
      },
    }),
    [fetchWithAuth]
  );

  // ✅ COMMENTS API
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
        dispatch({
          type: "UPDATE_COMMENT",
          payload: { id, comment: updated },
        });
        return updated;
      },

      delete: async (id: number): Promise<void> => {
        await fetchWithAuth(`/comments/${id}`, { method: "DELETE" });
        dispatch({ type: "DELETE_COMMENT", payload: id });
      },
    }),
    [fetchWithAuth, setLoading, dispatch]
  );

  // ✅ NOTE TASKS API
  const noteTasksApi = useMemo(
    () => ({
      getByNoteId: async (noteId: number) => {
        setLoading("noteTasks", true);
        try {
          const tasks = await fetchWithAuth(`/note-tasks/note/${noteId}`);
          dispatch({
            type: "SET_NOTE_TASKS_FOR_NOTE",
            payload: { noteId, tasks },
          });
          setLoading("noteTasks", false);
          return tasks;
        } catch (error) {
          setLoading(
            "noteTasks",
            false,
            error instanceof Error ? error.message : "Erreur inconnue"
          );
          throw error;
        }
      },

      getMyTasks: async () => {
        setLoading("noteTasks", true);
        try {
          const tasks = await fetchWithAuth("/note-tasks");
          dispatch({ type: "SET_NOTE_TASKS", payload: tasks });
          setLoading("noteTasks", false);
          return tasks;
        } catch (error) {
          setLoading(
            "noteTasks",
            false,
            error instanceof Error ? error.message : "Erreur inconnue"
          );
          throw error;
        }
      },

      create: async (
        noteId: number,
        title: string,
        parentId?: number
      ): Promise<NoteTask> => {
        const params = new URLSearchParams({ title });
        if (parentId) {
          params.append("parentId", parentId.toString());
        }

        const created = await fetchWithAuth(
          `/note-tasks/note/${noteId}?${params}`,
          {
            method: "POST",
          }
        );
        dispatch({ type: "ADD_NOTE_TASK", payload: created });
        return created;
      },

      update: async (
        id: number,
        data: Partial<NoteTask>
      ): Promise<NoteTask> => {
        const updated = await fetchWithAuth(`/note-tasks/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        dispatch({ type: "UPDATE_NOTE_TASK", payload: { id, task: updated } });
        return updated;
      },

      toggle: async (id: number): Promise<NoteTask> => {
        const updated = await fetchWithAuth(`/note-tasks/${id}/toggle`, {
          method: "PATCH",
        });
        dispatch({ type: "UPDATE_NOTE_TASK", payload: { id, task: updated } });
        return updated;
      },

      delete: async (id: number): Promise<void> => {
        await fetchWithAuth(`/note-tasks/${id}`, { method: "DELETE" });
        dispatch({ type: "DELETE_NOTE_TASK", payload: id });
      },
    }),
    [fetchWithAuth, setLoading, dispatch]
  );

  // ✅ Return ALL memoized APIs
  return useMemo(
    () => ({
      notes: notesApi,
      notebooks: notebooksApi,
      labels: labelsApi,
      links: linksApi,
      blocNote: blocNoteApi,
      user: userApi,
      tasks: tasksApi,
      comments: commentsApi,
      noteTasks: noteTasksApi,
    }),
    [
      notesApi,
      notebooksApi,
      labelsApi,
      linksApi,
      blocNoteApi,
      userApi,
      tasksApi,
      commentsApi,
      noteTasksApi,
    ]
  );
};
