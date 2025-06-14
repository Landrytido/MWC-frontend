import React from "react";
import { Note } from "../types/index";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
  onView?: (note: Note) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onView,
}) => {
  const formattedDate = note.createdAt
    ? new Date(note.createdAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="bg-white p-4 rounded-md shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3
          className="font-semibold text-gray-800 cursor-pointer hover:text-teal-600 transition-colors"
          onClick={() => onView?.(note)}
        >
          {note.title}
        </h3>{" "}
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(note)}
            className="text-gray-500 hover:text-teal-500"
            aria-label="Modifier la note"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
          <button
            onClick={() => note.id && onDelete(note.id)}
            className="text-gray-500 hover:text-red-500"
            aria-label="Supprimer la note"
          >
            <svg
              className="w-4 h-4"
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
      </div>

      <p className="text-gray-600 mb-3 whitespace-pre-line">{note.content}</p>
      {((note.commentCount ?? 0) > 0 || (note.taskCount ?? 0) > 0) && (
        <div className="flex items-center space-x-4 mb-2 text-xs text-gray-500">
          {(note.commentCount ?? 0) > 0 && (
            <span className="flex items-center space-x-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>
                {note.commentCount} commentaire
                {(note.commentCount ?? 0) > 1 ? "s" : ""}
              </span>
            </span>
          )}

          {(note.taskCount ?? 0) > 0 && (
            <span className="flex items-center space-x-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <span>
                {note.completedTaskCount || 0}/{note.taskCount} tâches
              </span>
            </span>
          )}
        </div>
      )}
      <p className="text-xs text-gray-400">{formattedDate}</p>
    </div>
  );
};

export default NoteCard;
