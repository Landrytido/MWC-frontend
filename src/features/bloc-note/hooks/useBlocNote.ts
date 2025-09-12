import { useState, useEffect, useCallback, useRef } from "react";
import { BlocNoteState } from "../types";
import { blocNoteApi } from "../api";

export const useBlocNote = () => {
  const [state, setState] = useState<BlocNoteState>({
    blocNote: null,
    loading: false,
    error: null,
    saveStatus: null,
  });

  const autoSaveTimeoutRef = useRef<number | null>(null);
  const loadedRef = useRef(false);

  const setLoading = useCallback((loading: boolean, error?: string) => {
    setState((prev) => ({ ...prev, loading, error: error || null }));
  }, []);

  const setSaveStatus = useCallback(
    (saveStatus: BlocNoteState["saveStatus"]) => {
      setState((prev) => ({ ...prev, saveStatus }));
    },
    []
  );

  const fetchBlocNote = useCallback(async () => {
    if (loadedRef.current) return;

    setLoading(true);
    try {
      const blocNote = await blocNoteApi.get();
      setState((prev) => ({ ...prev, blocNote, loading: false }));
      loadedRef.current = true;
    } catch (error) {
      setLoading(
        false,
        error instanceof Error ? error.message : "Erreur inconnue"
      );
      loadedRef.current = false;
    }
  }, [setLoading]);

  const updateBlocNote = useCallback(
    async (content: string): Promise<void> => {
      setSaveStatus("saving");
      try {
        const updated = await blocNoteApi.update({ content });
        setState((prev) => ({ ...prev, blocNote: updated }));
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus(null), 2000);
      } catch (error) {
        setSaveStatus(null);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Erreur de sauvegarde",
        }));
        throw error;
      }
    },
    [setSaveStatus]
  );

  const deleteBlocNote = useCallback(async (): Promise<void> => {
    try {
      await blocNoteApi.delete();
      setState((prev) => ({ ...prev, blocNote: null }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Erreur de suppression",
      }));
      throw error;
    }
  }, []);

  const autoSave = useCallback(
    async (content: string) => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      if (content === (state.blocNote?.content || "")) {
        setSaveStatus(null);
        return;
      }

      setSaveStatus("unsaved");

      autoSaveTimeoutRef.current = setTimeout(async () => {
        if (content.trim() === "" && !state.blocNote?.content) return;

        try {
          setSaveStatus("saving");
          const updated = await blocNoteApi.update({ content });
          setState((prev) => ({ ...prev, blocNote: updated }));
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus(null), 2000);
        } catch (error) {
          setSaveStatus(null);
          setState((prev) => ({
            ...prev,
            error:
              error instanceof Error
                ? error.message
                : "Erreur d'auto-sauvegarde",
          }));
        }
      }, 2000);
    },
    [state.blocNote?.content, setSaveStatus]
  );

  useEffect(() => {
    fetchBlocNote();
  }, [fetchBlocNote]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    fetchBlocNote,
    updateBlocNote,
    deleteBlocNote,
    autoSave,
  };
};
