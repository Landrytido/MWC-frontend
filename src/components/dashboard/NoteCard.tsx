import React from "react";
import { Note } from "../types/index";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete }) => {
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
        <h3 className="font-semibold text-gray-800">{note.title}</h3>
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

      <p className="text-xs text-gray-400">{formattedDate}</p>
    </div>
  );
};

export default NoteCard;
