import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../components/contexts/AuthContext";
import { useComments } from "../hooks/useComments";
import CommentCard from "./CommentCard";
import { useConfirmation } from "../../../shared/hooks/useConfirmation";

interface CommentsSectionProps {
  noteId: number;
  className?: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  noteId,
  className = "",
}) => {
  const { state } = useAuth();
  const {
    comments,
    loading,
    createComment,
    updateComment,
    deleteComment,
    loadCommentsForNote,
  } = useComments(noteId);

  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { confirm } = useConfirmation();

  useEffect(() => {
    loadCommentsForNote(noteId);
  }, [noteId, loadCommentsForNote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      setError("Le commentaire ne peut pas être vide");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await createComment(noteId, newComment.trim());
      setNewComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = useCallback(
    async (commentId: number, content: string) => {
      try {
        await updateComment(commentId, content);
      } catch (error) {
        console.error("Error updating comment:", error);
      }
    },
    [updateComment]
  );

  const handleDelete = useCallback(
    async (commentId: number) => {
      const confirmed = await confirm({
        title: "Supprimer le commentaire",
        message:
          "Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.",
        confirmText: "Supprimer",
        cancelText: "Annuler",
        variant: "danger",
      });

      if (!confirmed) return;

      try {
        await deleteComment(commentId);
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    },
    [confirm, deleteComment]
  );

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "?";
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          💬 Commentaires ({comments.length})
        </h3>
      </div>

      <div className="mb-6">
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {getInitials(state.user?.firstName, state.user?.lastName)}
              </div>
            </div>

            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajoutez un commentaire..."
                className="w-full p-3 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                rows={3}
              />

              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

              {newComment.trim() && (
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewComment("");
                      setError("");
                    }}
                    className="px-3 py-1 text-xs text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-3 py-1 text-xs text-white bg-teal-500 rounded hover:bg-teal-600 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Publication..." : "Publier"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-4">
            <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-500">
              Chargement des commentaires...
            </p>
          </div>
        ) : comments.length > 0 ? (
          comments
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-2">💬</div>
            <p>Aucun commentaire pour cette note.</p>
            <p className="text-sm">Soyez le premier à commenter !</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
