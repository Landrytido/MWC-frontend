import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLinks } from "../../../components/contexts/AppContext";
import { useApiService } from "../../../components/services/apiService";
import { useConfirmation } from "../../../shared/hooks/useConfirmation";
import { SavedLink } from "../types";
import LinkCard from "./LinkCard";
import Pagination from "../../../components/common/Pagination";

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
  const LINKS_PER_PAGE = 5;
  const { links, loading } = useLinks();
  const api = useApiService();
  const navigate = useNavigate();
  const { confirm, ConfirmationComponent } = useConfirmation();

  const [currentPage, setCurrentPage] = useState(1);

  // MODIFIÉ: Utiliser searchResults si disponible
  const displayedLinks = searchResults || links;

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

  // MODIFIÉ: Utiliser displayedLinks au lieu de links
  const startIndex = (currentPage - 1) * LINKS_PER_PAGE;
  const endIndex = startIndex + LINKS_PER_PAGE;
  const currentLinks = displayedLinks.slice(startIndex, endIndex);

  // MODIFIÉ: Utiliser displayedLinks pour la pagination
  React.useEffect(() => {
    const maxPages = Math.ceil(displayedLinks.length / LINKS_PER_PAGE);
    if (currentPage > maxPages && maxPages > 0) {
      setCurrentPage(maxPages);
    }
  }, [displayedLinks.length, currentPage, LINKS_PER_PAGE]);

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Mes Liens Sauvegardés
          {searchResults && (
            <span className="text-sm text-gray-600 ml-2">
              ({searchResults.length} résultat
              {searchResults.length > 1 ? "s" : ""})
            </span>
          )}
        </h2>
        {!searchResults && (
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
        )}
      </div>

      {/* NOUVEAU: Indicateur de recherche */}
      {isSearching && (
        <div className="text-center py-4">
          <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin mr-2"></div>
          Recherche en cours...
        </div>
      )}

      {loading.isLoading && !searchResults ? (
        <div className="flex justify-center py-8">
          <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-500">Chargement des liens...</p>
        </div>
      ) : displayedLinks.length > 0 ? (
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

          {/* MODIFIÉ: Pagination adaptée aux résultats de recherche */}
          <Pagination
            currentPage={currentPage}
            totalItems={displayedLinks.length}
            itemsPerPage={LINKS_PER_PAGE}
            onPageChange={setCurrentPage}
            itemName={searchResults ? "résultats" : "liens"}
          />
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">{searchResults ? "🔍" : "🔗"}</div>
          <p className="text-lg font-medium mb-2">
            {searchResults ? "Aucun résultat trouvé" : "Aucun lien sauvegardé"}
          </p>
          <p className="text-sm">
            {searchResults
              ? "Essayez de modifier vos termes de recherche"
              : "Commencez par ajouter un lien pour organiser vos ressources web !"}
          </p>
        </div>
      )}

      <ConfirmationComponent />
    </div>
  );
};

export default LinkManager;
