import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useConfirmation } from "../../../shared/hooks/useConfirmation";
import { useLinks } from "../hooks/useLinks";
import type { SavedLink } from "../types";

interface LinkManagerProps {
  className?: string;
  searchResults?: SavedLink[];
  isSearching?: boolean;
}

const LinkManager: React.FC<LinkManagerProps> = ({
  className = "",
  searchResults,
  isSearching = false,
}) => {
  const navigate = useNavigate();
  const { links, loading, error, deleteLink } = useLinks();

  const { confirm, ConfirmationComponent } = useConfirmation();
  const [currentPage, setCurrentPage] = useState(1);

  const LINKS_PER_PAGE = 10;
  const displayedLinks = searchResults || links;

  const handleDeleteLink = useCallback(
    async (id: string) => {
      const confirmed = await confirm({
        title: "Supprimer le lien",
        message:
          "Êtes-vous sûr de vouloir supprimer ce lien ? Cette action est irréversible.",
        confirmText: "Supprimer",
        cancelText: "Annuler",
        variant: "danger",
      });

      if (!confirmed) return;

      try {
        await deleteLink(parseInt(id));
      } catch {
        // Erreur silencieuse
      }
    },
    [confirm, deleteLink]
  );

  const startIndex = (currentPage - 1) * LINKS_PER_PAGE;
  const endIndex = startIndex + LINKS_PER_PAGE;
  const currentLinks = displayedLinks.slice(startIndex, endIndex);

  React.useEffect(() => {
    const maxPages = Math.ceil(displayedLinks.length / LINKS_PER_PAGE);
    if (currentPage > maxPages && maxPages > 0) {
      setCurrentPage(maxPages);
    }
  }, [displayedLinks.length, currentPage]);

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Mes Liens Sauvegardés
          {searchResults && ` (${searchResults.length} résultat(s))`}
        </h2>
        <button
          onClick={() => navigate("/dashboard/links/new")}
          className="flex items-center text-sm font-medium text-teal-500 hover:text-teal-600"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nouveau lien
        </button>
      </div>

      {isSearching && (
        <div className="flex items-center justify-center py-8">
          <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin mr-2"></div>
          <span className="text-sm text-gray-500">Recherche en cours...</span>
        </div>
      )}

      {loading && !searchResults ? (
        <div className="flex items-center justify-center py-8">
          <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin mr-2"></div>
          <span className="text-sm text-gray-500">Chargement des liens...</span>
        </div>
      ) : displayedLinks.length > 0 ? (
        <div className="space-y-3">
          {currentLinks.map((link) => (
            <div
              key={link.id}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-teal-600 transition-colors"
                    >
                      {link.title}
                    </a>
                  </h3>
                  {link.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {link.description}
                    </p>
                  )}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-600 hover:text-teal-700"
                  >
                    {link.url}
                  </a>
                </div>
                <button
                  onClick={() => handleDeleteLink(link.id.toString())}
                  className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                  title="Supprimer le lien"
                >
                  <svg
                    className="w-5 h-5"
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
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="mb-2">🔗</div>
          <p>Aucun lien sauvegardé.</p>
          <p className="text-sm">Commencez par ajouter votre premier lien !</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <ConfirmationComponent />
    </div>
  );
};

export default LinkManager;
