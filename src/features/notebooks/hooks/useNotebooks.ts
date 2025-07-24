import { useState, useEffect, useCallback } from "react";
import { Notebook } from "../types";
import { notebooksApi } from "../api";

interface UseNotebooksReturn {
  notebooks: Notebook[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createNotebook: (title: string) => Promise<Notebook>;
  updateNotebook: (id: number, title: string) => Promise<Notebook>;
  deleteNotebook: (id: number, forceDelete?: boolean) => Promise<void>;
}

export const useNotebooks = (): UseNotebooksReturn => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotebooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notebooksApi.getAll();
      setNotebooks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  const createNotebook = useCallback(
    async (title: string): Promise<Notebook> => {
      try {
        const newNotebook = await notebooksApi.create({ title });
        setNotebooks((prev) => [newNotebook, ...prev]);
        return newNotebook;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors de la création";
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  const updateNotebook = useCallback(
    async (id: number, title: string): Promise<Notebook> => {
      try {
        const updatedNotebook = await notebooksApi.update(id, { title });
        setNotebooks((prev) =>
          prev.map((notebook) =>
            notebook.id === id ? updatedNotebook : notebook
          )
        );
        return updatedNotebook;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors de la mise à jour";
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  const deleteNotebook = useCallback(
    async (id: number, forceDelete = true): Promise<void> => {
      try {
        await notebooksApi.delete(id, forceDelete);
        setNotebooks((prev) => prev.filter((notebook) => notebook.id !== id));
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors de la suppression";
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    fetchNotebooks();
  }, [fetchNotebooks]);

  return {
    notebooks,
    loading,
    error,
    refetch: fetchNotebooks,
    createNotebook,
    updateNotebook,
    deleteNotebook,
  };
};
