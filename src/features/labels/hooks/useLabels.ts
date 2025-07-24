import { useState, useEffect, useCallback } from "react";
import { Label } from "../types";
import { labelsApi } from "../api";

interface UseLabelsReturn {
  labels: Label[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createLabel: (name: string) => Promise<Label>;
  updateLabel: (id: string, name: string) => Promise<Label>;
  deleteLabel: (id: string, forceDelete?: boolean) => Promise<void>;
}

export const useLabels = (): UseLabelsReturn => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLabels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await labelsApi.getAll();
      setLabels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  const createLabel = useCallback(async (name: string): Promise<Label> => {
    try {
      const newLabel = await labelsApi.create({ name });
      setLabels((prev) => [newLabel, ...prev]);
      return newLabel;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erreur lors de la création";
      setError(errorMsg);
      throw err;
    }
  }, []);

  const updateLabel = useCallback(
    async (id: string, name: string): Promise<Label> => {
      try {
        const updatedLabel = await labelsApi.update(id, { name });
        setLabels((prev) =>
          prev.map((label) => (label.id === id ? updatedLabel : label))
        );
        return updatedLabel;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors de la mise à jour";
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  const deleteLabel = useCallback(
    async (id: string, forceDelete = false): Promise<void> => {
      try {
        await labelsApi.delete(id, forceDelete);
        setLabels((prev) => prev.filter((label) => label.id !== id));
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
    fetchLabels();
  }, [fetchLabels]);

  return {
    labels,
    loading,
    error,
    refetch: fetchLabels,
    createLabel,
    updateLabel,
    deleteLabel,
  };
};
