import React from "react";
import { SavedLink } from "../types";

interface LinkCardProps {
  link: SavedLink;
  onEdit: (link: SavedLink) => void;
  onDelete: (id: string) => void;
}

const LinkCard: React.FC<LinkCardProps> = ({ link, onEdit, onDelete }) => {
  const formattedDate = link.createdAt
    ? new Date(link.createdAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-teal-500 hover:text-teal-600 hover:underline block"
          >
            {link.title}
          </a>
          <p className="text-xs text-gray-400 mb-2">{formatUrl(link.url)}</p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(link)}
            className="text-gray-500 hover:text-teal-500"
            aria-label="Modifier le lien"
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
            onClick={() => link.id && onDelete(link.id.toString())}
            className="text-gray-500 hover:text-red-500"
            aria-label="Supprimer le lien"
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

      {link.description && (
        <p className="text-gray-600 mb-2">{link.description}</p>
      )}

      <p className="text-xs text-gray-400">{formattedDate}</p>
    </div>
  );
};

export default LinkCard;
