import React from "react";
import { SavedLink } from "../types";
import { Pencil, Trash2 } from "lucide-react";

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
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => link.id && onDelete(link.id.toString())}
            className="text-gray-500 hover:text-red-500"
            aria-label="Supprimer le lien"
          >
            <Trash2 className="w-4 h-4" />
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
