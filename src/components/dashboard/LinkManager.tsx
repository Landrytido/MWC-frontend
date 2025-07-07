import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLinks } from "../contexts/AppContext";
import { useApiService } from "../services/apiService";
import { useConfirmation } from "./useConfirmation";
import { SavedLink } from "../types";
import LinkCard from "./LinkCard";
import Pagination from "../common/Pagination";

interface LinkManagerProps {
  className?: string;
}

const LinkManager: React.FC<LinkManagerProps> = ({ className = "" }) => {
  const LINKS_PER_PAGE = 5;
  const { links, loading } = useLinks();
  const api = useApiService();
  const navigate = useNavigate();
  const { confirm, ConfirmationComponent } = useConfirmation();

  const [currentPage, setCurrentPage] = useState(1);

  const handleEditLink = useCallback(
    (link: SavedLink) => {
      navigate(`/dashboard/links/${link.id}`);
    },
    [navigate]
  );

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
        await api.links.delete(parseInt(id));
      } catch (error) {
        console.error("Error deleting link:", error);
      }
    },
    [confirm, api.links]
  );
  const startIndex = (currentPage - 1) * LINKS_PER_PAGE;
  const endIndex = startIndex + LINKS_PER_PAGE;
  const currentLinks = links.slice(startIndex, endIndex);
  React.useEffect(() => {
    const maxPages = Math.ceil(links.length / LINKS_PER_PAGE);
    if (currentPage > maxPages && maxPages > 0) {
      setCurrentPage(maxPages);
    }
  }, [links.length, currentPage, LINKS_PER_PAGE]);

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Mes Liens Sauvegardés
        </h2>
        <button
          onClick={() => navigate("/dashboard/links/new")}
          className="flex items-center text-sm font-medium text-teal-500 hover:text-teal-600 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-1"
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

      {loading.isLoading ? (
        <div className="flex justify-center py-8">
          <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-500">Chargement des liens...</p>
        </div>
      ) : links.length > 0 ? (
        <>
          <div className="space-y-4">
            {currentLinks.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onEdit={handleEditLink}
                onDelete={handleDeleteLink}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={links.length}
            itemsPerPage={LINKS_PER_PAGE}
            onPageChange={setCurrentPage}
            itemName="liens"
          />
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🔗</div>
          <p className="text-lg font-medium mb-2">Aucun lien sauvegardé</p>
          <p className="text-sm">
            Commencez par ajouter un lien pour organiser vos ressources web !
          </p>
        </div>
      )}

      <ConfirmationComponent />
    </div>
  );
};

export default LinkManager;
