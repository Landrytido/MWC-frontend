import { useState, useEffect, useCallback } from "react";
import {
  Note,
  CreateNoteForm,
  UpdateNoteForm,
  NotesSearchParams,
} from "../types";
import { notesApi } from "../api";

interface UseNotesReturn {
  notes: Note[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;

  createNote: (note: CreateNoteForm) => Promise<Note>;
  updateNote: (id: number, note: UpdateNoteForm) => Promise<Note>;
  deleteNote: (id: number) => Promise<void>;

  moveToNotebook: (id: number, notebookId: number | null) => Promise<Note>;
  addLabel: (noteId: number, labelId: string) => Promise<Note>;
  removeLabel: (noteId: number, labelId: string) => Promise<Note>;
  batchAddLabels: (noteId: number, labelIds: string[]) => Promise<Note>;
  batchRemoveLabels: (noteId: number, labelIds: string[]) => Promise<Note>;

  searchNotes: (
    params: NotesSearchParams
  ) => Promise<{ notes: Note[]; total?: number }>;
  getRecentNotes: (limit?: number) => Promise<Note[]>;
  toggleFavorite: (noteId: number) => Promise<Note>;
  getNoteById: (id: number) => Note | undefined;

  filteredNotes: Note[];
  setCurrentNotebook: (notebookId: number | null) => void;
  setSelectedLabels: (labelIds: string[]) => void;
  setSearchTerm: (term: string) => void;
  currentNotebook: number | null;
  selectedLabels: string[];
  searchTerm: string;
}

export const useNotes = (): UseNotesReturn => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentNotebook, setCurrentNotebook] = useState<number | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNotes = notes.filter((note) => {
    const matchesNotebook =
      !currentNotebook || note.notebookId === currentNotebook;

    const matchesSearch =
      !searchTerm ||
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLabels =
      selectedLabels.length === 0 ||
      selectedLabels.some((labelId) =>
        note.labels?.some((label) => label.id === labelId)
      );

    return matchesNotebook && matchesSearch && matchesLabels;
  });

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notesApi.getAll();
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  const createNote = useCallback(
    async (note: CreateNoteForm): Promise<Note> => {
      try {
        const newNote = await notesApi.create(note);
        setNotes((prev) => [newNote, ...prev]);
        return newNote;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors de la création";
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  const updateNote = useCallback(
    async (id: number, note: UpdateNoteForm): Promise<Note> => {
      try {
        const updatedNote = await notesApi.update(id, note);
        setNotes((prev) => prev.map((n) => (n.id === id ? updatedNote : n)));
        return updatedNote;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors de la mise à jour";
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  const deleteNote = useCallback(async (id: number): Promise<void> => {
    try {
      await notesApi.delete(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erreur lors de la suppression";
      setError(errorMsg);
      throw err;
    }
  }, []);

  const moveToNotebook = useCallback(
    async (id: number, notebookId: number | null): Promise<Note> => {
      try {
        const updatedNote = await notesApi.moveToNotebook(id, notebookId);
        setNotes((prev) => prev.map((n) => (n.id === id ? updatedNote : n)));
        return updatedNote;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors du déplacement";
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  const addLabel = useCallback(
    async (noteId: number, labelId: string): Promise<Note> => {
      try {
        const updatedNote = await notesApi.addLabel(noteId, labelId);
        setNotes((prev) =>
          prev.map((n) => (n.id === noteId ? updatedNote : n))
        );
        return updatedNote;
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Erreur lors de l'ajout du label";
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  const removeLabel = useCallback(
    async (noteId: number, labelId: string): Promise<Note> => {
      try {
        const updatedNote = await notesApi.removeLabel(noteId, labelId);
        setNotes((prev) =>
          prev.map((n) => (n.id === noteId ? updatedNote : n))
        );
        return updatedNote;
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Erreur lors de la suppression du label";
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  const batchAddLabels = useCallback(
    async (noteId: number, labelIds: string[]): Promise<Note> => {
      try {
        const updatedNote = await notesApi.batchAddLabels(noteId, labelIds);
        setNotes((prev) =>
          prev.map((n) => (n.id === noteId ? updatedNote : n))
        );
        return updatedNote;
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Erreur lors de l'ajout des labels";
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  const batchRemoveLabels = useCallback(
    async (noteId: number, labelIds: string[]): Promise<Note> => {
      try {
        const updatedNote = await notesApi.batchRemoveLabels(noteId, labelIds);
        setNotes((prev) =>
          prev.map((n) => (n.id === noteId ? updatedNote : n))
        );
        return updatedNote;
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Erreur lors de la suppression des labels";
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  const searchNotes = useCallback(
    async (
      params: NotesSearchParams
    ): Promise<{ notes: Note[]; total?: number }> => {
      try {
        const results = await notesApi.search(params);
        return results;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors de la recherche";
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  const getRecentNotes = useCallback(async (limit = 10): Promise<Note[]> => {
    try {
      const results = await notesApi.getRecentNotes(limit);
      return results;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erreur lors de la récupération";
      setError(errorMsg);
      throw err;
    }
  }, []);

  const toggleFavorite = useCallback(async (noteId: number): Promise<Note> => {
    try {
      const updatedNote = await notesApi.toggleFavorite(noteId);
      setNotes((prev) => prev.map((n) => (n.id === noteId ? updatedNote : n)));
      return updatedNote;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erreur lors du toggle favori";
      setError(errorMsg);
      throw err;
    }
  }, []);

  const getNoteById = useCallback(
    (id: number): Note | undefined => {
      return notes.find((note) => note.id === id);
    },
    [notes]
  );

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    loading,
    error,
    refetch: fetchNotes,

    createNote,
    updateNote,
    deleteNote,

    moveToNotebook,
    addLabel,
    removeLabel,
    batchAddLabels,
    batchRemoveLabels,

    searchNotes,
    getRecentNotes,
    toggleFavorite,
    getNoteById,

    filteredNotes,
    setCurrentNotebook,
    setSelectedLabels,
    setSearchTerm,
    currentNotebook,
    selectedLabels,
    searchTerm,
  };
};
