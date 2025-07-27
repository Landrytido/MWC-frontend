import { useState, useEffect, useCallback } from "react";
import { Comment } from "../types";
import { commentsApi } from "../api";

interface UseCommentsReturn {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getCommentsByNoteId: (noteId: number) => Promise<Comment[]>;
  createComment: (noteId: number, content: string) => Promise<Comment>;
  updateComment: (id: number, content: string) => Promise<Comment>;
  deleteComment: (id: number) => Promise<void>;
  getMyComments: () => Promise<Comment[]>;

  // Pour un usage spécifique à une note
  getCommentsForNote: (noteId: number) => Comment[];
  loadCommentsForNote: (noteId: number) => Promise<void>;
}

export const useComments = (noteId?: number): UseCommentsReturn => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!noteId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await commentsApi.getByNoteId(noteId);
      setComments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  const getCommentsByNoteId = useCallback(
    async (targetNoteId: number): Promise<Comment[]> => {
      try {
        const data = await commentsApi.getByNoteId(targetNoteId);
        // Si c'est pour la note courante, mettre à jour l'état
        if (targetNoteId === noteId) {
          setComments(data);
        }
        return data;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors de la récupération";
        setError(errorMsg);
        throw err;
      }
    },
    [noteId]
  );

  const loadCommentsForNote = useCallback(
    async (targetNoteId: number): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const data = await commentsApi.getByNoteId(targetNoteId);
        setComments(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors du chargement"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createComment = useCallback(
    async (targetNoteId: number, content: string): Promise<Comment> => {
      try {
        const newComment = await commentsApi.create(targetNoteId, content);
        // Si c'est pour la note courante, ajouter à l'état
        if (targetNoteId === noteId) {
          setComments((prev) => [newComment, ...prev]);
        }
        return newComment;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors de la création";
        setError(errorMsg);
        throw err;
      }
    },
    [noteId]
  );

  const updateComment = useCallback(
    async (id: number, content: string): Promise<Comment> => {
      try {
        const updatedComment = await commentsApi.update(id, content);
        setComments((prev) =>
          prev.map((c) => (c.id === id ? updatedComment : c))
        );
        return updatedComment;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors de la mise à jour";
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  const deleteComment = useCallback(async (id: number): Promise<void> => {
    try {
      await commentsApi.delete(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erreur lors de la suppression";
      setError(errorMsg);
      throw err;
    }
  }, []);

  const getMyComments = useCallback(async (): Promise<Comment[]> => {
    try {
      const data = await commentsApi.getMy();
      return data;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erreur lors de la récupération";
      setError(errorMsg);
      throw err;
    }
  }, []);

  const getCommentsForNote = useCallback(
    (targetNoteId: number): Comment[] => {
      return comments.filter((comment) => comment.noteId === targetNoteId);
    },
    [comments]
  );

  useEffect(() => {
    if (noteId) {
      fetchComments();
    }
  }, [fetchComments, noteId]);

  return {
    comments,
    loading,
    error,
    refetch: fetchComments,
    getCommentsByNoteId,
    createComment,
    updateComment,
    deleteComment,
    getMyComments,
    getCommentsForNote,
    loadCommentsForNote,
  };
};
