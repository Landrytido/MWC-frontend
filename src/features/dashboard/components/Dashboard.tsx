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
import { Search, X, Plus, BookOpen, Tag, FileText, Link2, ListTodo, Calendar, Wrench } from "lucide-react";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const ui = useUI();
  const { notes, filteredNotes, loading, deleteNote, refetch } = useNotes({
    currentNotebook: ui.currentNotebook,
    selectedLabels: ui.selectedLabels,
    searchTerm: ui.searchTerm,
  });

  const { links } = useLinks();
  const { notebooks } = useNotebooks();
  const { labels } = useLabels();

  const { confirm, ConfirmationComponent } = useConfirmation();

  const [searchParams] = useSearchParams();

  const {
    activeTab,
    isSearching,
    hasActiveSearch,
    handleTabChange,
    clearAllSearches,
    getSearchConfig,
    getTabSearchResults,
    getNotesSearchResults,
    getLinksSearchResults,
    getTasksSearchResults,
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
    [navigate],
  );

  const handleViewNote = useCallback(
    (note: Note) => {
      navigate(`/dashboard/notes/${note.id}/view`);
    },
    [navigate],
  );

  const handleNoteUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

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
      } catch {
        // Erreur silencieuse
      }
    },
    [confirm, deleteNote],
  );

  const handleLabelSelect = useCallback(
    (labelId: string) => {
      const currentLabels = ui.selectedLabels;
      const isSelected = currentLabels.includes(labelId);

      if (isSelected) {
        ui.setSelectedLabels(currentLabels.filter((id) => id !== labelId));
      } else {
        ui.setSelectedLabels([...currentLabels, labelId]);
      }
      handleTabChange("notes");
    },
    [ui, handleTabChange],
  );

  const handleClearFilters = useCallback(() => {
    ui.clearAllSearchTerms();
    clearAllSearches();
  }, [ui, clearAllSearches]);

  const currentNotesResults = getNotesSearchResults();
  const currentLinksResults = getLinksSearchResults();
  const currentTasksResults = getTasksSearchResults();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="mb-8 rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Bonjour, {authState.user?.firstName || "utilisateur"} 👋
          </h1>
          <p className="mt-2 text-slate-600">
            Bienvenue sur votre tableau de bord My Web Companion
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <NotebookSidebar
              selectedNotebookId={ui.currentNotebook}
              onNotebookSelect={(id) => { ui.setCurrentNotebook(id); handleTabChange("notes"); }}
              totalNotes={notes.length}
            />
            <LabelManager
              selectedLabelIds={ui.selectedLabels}
              onLabelSelect={handleLabelSelect}
              showFilterMode={true}
            />
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
                    className={`w-full rounded-xl border py-3 pl-11 pr-4 text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                      searchConfig.hasError
                        ? "border-orange-300 bg-orange-50 focus:ring-orange-500"
                        : "border-slate-200 bg-white/85 focus:ring-teal-500"
                    }`}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  {(hasActiveSearch ||
                    ui.currentNotebook ||
                    ui.selectedLabels.length > 0) && (
                    <button
                      onClick={handleClearFilters}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      title="Effacer tous les filtres"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {import.meta.env.DEV &&
                  searchConfig.hasError &&
                  searchConfig.errorMessage && (
                    <div className="mt-2 text-xs text-gray-400 flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {searchConfig.errorMessage}
                    </div>
                  )}

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
                        <BookOpen className="w-3 h-3 mr-1" />
                        {
                          notebooks.find((n) => n.id === ui.currentNotebook)
                            ?.title
                        }
                        <button
                          onClick={() => ui.setCurrentNotebook(null)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
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
                          <Tag className="w-3 h-3 mr-1" />
                          {label.name}
                          <button
                            onClick={() => {
                              const updatedLabels = ui.selectedLabels.filter(
                                (id) => id !== labelId,
                              );
                              ui.setSelectedLabels(updatedLabels);
                            }}
                            className="ml-1 text-teal-600 hover:text-teal-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ) : null;
                    })}

                    {hasActiveSearch && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        <Search className="w-3 h-3 mr-1" />
                        "{searchConfig.value}"
                        <button
                          onClick={() => clearAllSearches()}
                          className="ml-1 text-purple-600 hover:text-purple-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200/80 bg-white/75 p-2 backdrop-blur-sm">
              <button
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors inline-flex items-center ${
                  activeTab === "notes"
                    ? "bg-teal-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                }`}
                onClick={() => handleTabChange("notes")}
              >
                <FileText className="w-4 h-4 mr-1.5" />
                Notes (
                {hasActiveSearch && activeTab === "notes"
                  ? getTabSearchResults("notes").length
                  : filteredNotes.length}
                )
              </button>
              <button
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors inline-flex items-center ${
                  activeTab === "links"
                    ? "bg-teal-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                }`}
                onClick={() => handleTabChange("links")}
              >
                <Link2 className="w-4 h-4 mr-1.5" />
                Liens Sauvegardés (
                {hasActiveSearch && activeTab === "links"
                  ? getTabSearchResults("links").length
                  : links.length}
                )
              </button>
              <button
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors inline-flex items-center ${
                  activeTab === "tasks"
                    ? "bg-teal-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                }`}
                onClick={() => handleTabChange("tasks")}
              >
                <ListTodo className="w-4 h-4 mr-1.5" />
                Tâches{" "}
                {hasActiveSearch && activeTab === "tasks"
                  ? `(${getTabSearchResults("tasks").length})`
                  : ""}
              </button>
              <button
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors inline-flex items-center ${
                  activeTab === "calendar"
                    ? "bg-teal-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                }`}
                onClick={() =>
                  navigate(`/dashboard/calendar?returnTo=${activeTab}`)
                }
              >
                <Calendar className="w-4 h-4 mr-1.5" />
                Calendrier
              </button>
              <button
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors inline-flex items-center ${
                  activeTab === "tools"
                    ? "bg-teal-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                }`}
                onClick={() => handleTabChange("tools")}
              >
                <Wrench className="w-4 h-4 mr-1.5" />
                Outils
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
                      ` (${currentNotesResults.length} résultats)`}
                  </h2>
                  <button
                    onClick={() => navigate("/dashboard/notes/new")}
                    className="btn btn-primary px-4 py-2"
                  >
                    <Plus className="w-5 h-5 mr-1" />
                    Nouvelle note
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="text-gray-500">Chargement des notes...</div>
                  </div>
                ) : (hasActiveSearch ? currentNotesResults : filteredNotes)
                    .length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(hasActiveSearch
                      ? currentNotesResults
                      : filteredNotes
                    ).map((note: Note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={handleEditNote}
                        onDelete={() => handleDeleteNote(note.id)}
                        onView={handleViewNote}
                        onUpdate={handleNoteUpdate}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/60 py-10 text-center text-slate-500">
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
                searchResults={
                  hasActiveSearch ? currentLinksResults : undefined
                }
                isSearching={isSearching}
              />
            )}

            {activeTab === "tasks" && (
              <TaskManager
                searchResults={
                  hasActiveSearch ? currentTasksResults : undefined
                }
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
