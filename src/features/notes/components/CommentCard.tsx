import React, { useState } from "react";
import { useAuth } from "../../../components/contexts/AuthContext";
import { Comment } from "../../../components/types/index";

interface CommentCardProps {
  comment: Comment;
  onEdit: (id: number, content: string) => void;
  onDelete: (id: number) => void;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onEdit,
  onDelete,
}) => {
  const { state } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const isOwnComment = comment.author.id === state.user?.id;

  const handleSave = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit(comment.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "?";
  };

  return (
    <div className="flex space-x-3 p-4 bg-gray-50 rounded-lg">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
          {getInitials(comment.author.firstName, comment.author.lastName)}
        </div>
      </div>

      {/* Contenu du commentaire */}
      <div className="flex-1 min-w-0">
        {/* Header avec nom et date */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">
              {comment.author.firstName && comment.author.lastName
                ? `${comment.author.firstName} ${comment.author.lastName}`
                : comment.author.email}
            </span>
            {isOwnComment && (
              <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Vous
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {formatDate(comment.createdAt)}
            </span>

            {/* Actions (uniquement pour ses propres commentaires) */}
            {isOwnComment && !isEditing && (
              <div className="flex space-x-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 hover:text-blue-500 rounded"
                  title="Modifier"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(comment.id)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded"
                  title="Supprimer"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contenu */}
        {isEditing ? (
          <div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-xs text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-xs text-white bg-teal-500 rounded hover:bg-teal-600 transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {comment.content}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentCard;
