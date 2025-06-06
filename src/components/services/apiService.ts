import { useAuth } from "@clerk/clerk-react";
import { useApp, AppState } from "../contexts/AppContext";
import { useCallback, useMemo } from "react";
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
} from "../types";

// API Base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  window.ENV?.API_URL ||
  "http://localhost:8080/api";

export const useApiService = () => {
  const { getToken } = useAuth();
  const { dispatch } = useApp();

  // ✅ Utility function for authenticated requests (memoized)
  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const token = await getToken();

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      };

      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Erreur ${response.status}: ${response.statusText}`
        );
      }

      return response.status !== 204 ? await response.json() : null;
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

  // ✅ NOTES API avec useMemo
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

      createInNotebook: async (
        notebookId: number,
        note: CreateNoteForm
      ): Promise<Note> => {
        const created = await fetchWithAuth(`/notes/notebooks/${notebookId}`, {
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

      moveToNotebook: async (
        noteId: number,
        notebookId: number | null
      ): Promise<Note> => {
        const updated = await fetchWithAuth(`/notes/${noteId}/notebook`, {
          method: "PUT",
          body: JSON.stringify({ notebookId }),
        });
        dispatch({
          type: "UPDATE_NOTE",
          payload: { id: noteId, note: updated },
        });
        return updated;
      },

      delete: async (id: number): Promise<void> => {
        await fetchWithAuth(`/notes/${id}`, { method: "DELETE" });
        dispatch({ type: "DELETE_NOTE", payload: id });
      },
    }),
    [fetchWithAuth, setLoading, dispatch]
  );
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

      getPending: async () => {
        setLoading("tasks", true);
        try {
          const tasks = await fetchWithAuth("/tasks/pending");
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

      getCompleted: async () => {
        return await fetchWithAuth("/tasks/completed");
      },

      getOverdue: async () => {
        return await fetchWithAuth("/tasks/overdue");
      },

      getDueInDays: async (days: number = 7) => {
        return await fetchWithAuth(`/tasks/due-in-days?days=${days}`);
      },

      getById: async (id: number): Promise<Task> => {
        return await fetchWithAuth(`/tasks/${id}`);
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

      getPendingCount: async (): Promise<{ count: number }> => {
        return await fetchWithAuth("/tasks/pending/count");
      },
    }),
    [fetchWithAuth, setLoading, dispatch]
  );
  // ✅ NOTEBOOKS API avec useMemo
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

      getById: async (id: number): Promise<Notebook> => {
        return await fetchWithAuth(`/notebooks/${id}`);
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
        notebook: Partial<Notebook>
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

      delete: async (id: number): Promise<void> => {
        await fetchWithAuth(`/notebooks/${id}`, { method: "DELETE" });
        dispatch({ type: "DELETE_NOTEBOOK", payload: id });
      },

      getNotes: async (notebookId: number): Promise<Note[]> => {
        return await fetchWithAuth(`/notes/notebooks/${notebookId}/notes`);
      },
    }),
    [fetchWithAuth, setLoading, dispatch]
  );

  // ✅ LABELS API avec useMemo
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

      getById: async (id: string): Promise<Label> => {
        return await fetchWithAuth(`/labels/${id}`);
      },

      create: async (label: CreateLabelForm): Promise<Label> => {
        const created = await fetchWithAuth("/labels", {
          method: "POST",
          body: JSON.stringify(label),
        });
        dispatch({ type: "ADD_LABEL", payload: created });
        return created;
      },

      update: async (id: string, label: Partial<Label>): Promise<Label> => {
        const updated = await fetchWithAuth(`/labels/${id}`, {
          method: "PUT",
          body: JSON.stringify(label),
        });
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

  // ✅ LINKS API avec useMemo
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

  // ✅ BLOC NOTE API avec useMemo
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

  // ✅ USER API avec useMemo
  const userApi = useMemo(
    () => ({
      syncUser: async (userData: {
        clerkId: string;
        email: string;
        firstName?: string;
        lastName?: string;
      }) => {
        const user = await fetch(`${API_BASE_URL}/users/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }).then((res) => {
          if (!res.ok) {
            throw new Error(`Erreur ${res.status}: ${res.statusText}`);
          }
          return res.json();
        });

        dispatch({ type: "SET_USER", payload: user });
        return user;
      },

      getProfile: async () => {
        const profile = await fetchWithAuth("/users/profile");
        dispatch({ type: "SET_USER", payload: profile });
        return profile;
      },
    }),
    [fetchWithAuth, dispatch]
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
    }),
    [
      notesApi,
      notebooksApi,
      labelsApi,
      linksApi,
      blocNoteApi,
      userApi,
      tasksApi,
    ]
  );
};
