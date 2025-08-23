import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";
import Layout from "../../../shared/components/layout/Layout";
import NoteCard from "../../notes/components/NoteCard";
import LinkManager from "../../links/components/LinkManager";
import { NotebookSidebar } from "../../notebooks";
import { LabelManager } from "../../labels";
import { BlocNoteWidget } from "../../bloc-note";
import { useUI } from "../../../shared/contexts/AppContext";
import { TaskManager } from "../../tasks";
import { useConfirmation } from "../../../shared/hooks/useConfirmation";
import ToolsManager from "../../../features/tools/components/ToolsManager";
import { useSearchParams } from "react-router-dom";
import { useLinks } from "../../links";
import { useNotebooks } from "../../notebooks";
import { useLabels } from "../../labels";
import { useNotes } from "../../notes";
import { useDashboard } from "../hooks/useDashboard";
import { Note } from "../../notes/types";
import type { TabType } from "../types";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const ui = useUI();
  const { notes, filteredNotes, loading, deleteNote } = useNotes();

  const { links } = useLinks();
  const { notebooks } = useNotebooks();
  const { labels } = useLabels();

  const { confirm, ConfirmationComponent } = useConfirmation();

  const [searchParams] = useSearchParams();

  const {
    activeTab,
    currentSearchResults,
    isSearching,
    hasActiveSearch,
    handleTabChange,
    clearAllSearches,
    getSearchConfig,
  } = useDashboard();

  React.useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "links" || tab === "tasks" || tab === "tools") {
      handleTabChange(tab as TabType);
    }
  }, [searchParams, handleTabChange]);

  const searchConfig = getSearchConfig(activeTab);

  const handleEditNote = useCallback(
    (note: Note) => {
      navigate(`/dashboard/notes/${note.id}`);
    },
    [navigate]
  );

  const handleViewNote = useCallback(
    (note: Note) => {
      navigate(`/dashboard/notes/${note.id}/view`);
    },
    [navigate]
  );

  const handleDeleteNote = useCallback(
    async (id: number) => {
      const confirmed = await confirm({
        title: "Supprimer la note",
        message:
          "Êtes-vous sûr de vouloir supprimer cette note ? Cette action est irréversible.",
        confirmText: "Supprimer",
        cancelText: "Annuler",
        variant: "danger",
      });

      if (!confirmed) return;

      try {
        await deleteNote(id);
      } catch (error) {
        console.error("Error deleting note:", error);
      }
    },
    [confirm, deleteNote]
  );

  const handleClearFilters = useCallback(() => {
    ui.clearAllSearchTerms();
    clearAllSearches();
  }, [ui, clearAllSearches]);

  const displayedSearchResults = hasActiveSearch
    ? currentSearchResults
    : undefined;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Bonjour, {authState.user?.firstName || "utilisateur"} 👋
          </h1>
          <p className="text-gray-600">
            Bienvenue sur votre tableau de bord My Web Companion
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <NotebookSidebar
              selectedNotebookId={ui.currentNotebook}
              onNotebookSelect={(id) => ui.setCurrentNotebook(id)}
              totalNotes={notes.length}
            />
            <LabelManager />
            <BlocNoteWidget />
          </div>

          <div className="lg:col-span-3">
            {searchConfig.show && (
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={searchConfig.placeholder}
                    value={searchConfig.value}
                    onChange={(e) => searchConfig.onChange?.(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {(hasActiveSearch ||
                    ui.currentNotebook ||
                    ui.selectedLabels.length > 0) && (
                    <button
                      onClick={handleClearFilters}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      title="Effacer tous les filtres"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {isSearching && (
                  <div className="mt-2 text-sm text-gray-500 flex items-center">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin mr-2"></div>
                    Recherche en cours...
                  </div>
                )}

                {(ui.currentNotebook ||
                  ui.selectedLabels.length > 0 ||
                  hasActiveSearch) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ui.currentNotebook && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        📓{" "}
                        {
                          notebooks.find((n) => n.id === ui.currentNotebook)
                            ?.title
                        }
                        <button
                          onClick={() => ui.setCurrentNotebook(null)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </span>
                    )}

                    {ui.selectedLabels.map((labelId) => {
                      const label = labels.find((l) => l.id === labelId);
                      return label ? (
                        <span
                          key={labelId}
                          className="inline-flex items-center px-2 py-1 text-xs bg-teal-100 text-teal-800 rounded-full"
                        >
                          🏷️ {label.name}
                          <button
                            onClick={() => {
                              const updatedLabels = ui.selectedLabels.filter(
                                (id) => id !== labelId
                              );
                              ui.setSelectedLabels(updatedLabels);
                            }}
                            className="ml-1 text-teal-600 hover:text-teal-800"
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </span>
                      ) : null;
                    })}

                    {hasActiveSearch && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        🔍 "{searchConfig.value}"
                        <button
                          onClick={() => clearAllSearches()}
                          className="ml-1 text-purple-600 hover:text-purple-800"
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "notes"
                    ? "text-teal-500 border-b-2 border-teal-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleTabChange("notes")}
              >
                Notes (
                {hasActiveSearch
                  ? currentSearchResults.length
                  : filteredNotes.length}
                )
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "links"
                    ? "text-teal-500 border-b-2 border-teal-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleTabChange("links")}
              >
                Liens Sauvegardés (
                {hasActiveSearch ? currentSearchResults.length : links.length})
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "tasks"
                    ? "text-teal-500 border-b-2 border-teal-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleTabChange("tasks")}
              >
                Tâches {hasActiveSearch && `(${currentSearchResults.length})`}
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "calendar"
                    ? "text-teal-500 border-b-2 border-teal-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => navigate("/dashboard/calendar")}
              >
                📅 Calendrier
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "tools"
                    ? "text-teal-500 border-b-2 border-teal-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleTabChange("tools")}
              >
                🛠️ Outils
              </button>
            </div>

            {activeTab === "notes" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {ui.currentNotebook
                      ? `Notes - ${
                          notebooks.find((n) => n.id === ui.currentNotebook)
                            ?.title
                        }`
                      : "Toutes les notes"}
                    {ui.selectedLabels.length > 0 &&
                      ` (${ui.selectedLabels.length} label(s) filtrés)`}
                    {hasActiveSearch &&
                      ` (${currentSearchResults.length} résultats)`}
                  </h2>
                  <button
                    onClick={() => navigate("/dashboard/notes/new")}
                    className="flex items-center text-sm font-medium text-teal-500 hover:text-teal-600"
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
                    Nouvelle note
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="text-gray-500">Chargement des notes...</div>
                  </div>
                ) : (hasActiveSearch ? currentSearchResults : filteredNotes)
                    .length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(hasActiveSearch
                      ? currentSearchResults
                      : filteredNotes
                    ).map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={handleEditNote}
                        onDelete={() => handleDeleteNote(note.id)}
                        onView={handleViewNote}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {notes.length === 0
                      ? "Vous n'avez pas encore de notes. Commencez par en créer une !"
                      : hasActiveSearch
                      ? "Aucun résultat trouvé pour votre recherche."
                      : "Aucune note ne correspond aux filtres sélectionnés."}
                  </div>
                )}
              </div>
            )}

            {activeTab === "links" && (
              <LinkManager
                searchResults={displayedSearchResults}
                isSearching={isSearching}
              />
            )}

            {activeTab === "tasks" && (
              <TaskManager
                searchResults={displayedSearchResults}
                isSearching={isSearching}
              />
            )}

            {activeTab === "tools" && <ToolsManager />}
          </div>
        </div>
      </div>
      <ConfirmationComponent />
    </Layout>
  );
};

export default Dashboard;
