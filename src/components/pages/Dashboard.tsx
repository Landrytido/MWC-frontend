import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth";
import Layout from "../layout/Layout";
import NoteCard from "../../features/notes/components/NoteCard";
import LinkManager from "../../features/links/components/LinkManager";
import { NotebookSidebar } from "../../features/notebooks";
import { LabelManager } from "../../features/labels";
import { BlocNoteWidget } from "../../features/bloc-note";
import { useApp } from "../contexts/AppContext";
import { Task } from "../../features/tasks";
import { SavedLink } from "../../features/links";
import { TaskManager } from "../../features/tasks";
import { useConfirmation } from "../../shared/hooks/useConfirmation";
import ToolsManager from "../dashboard/ToolsManager";
import { useSearchParams } from "react-router-dom";
import { tasksApi } from "../../features/tasks";
import { linksApi } from "../../features/links";
import { useLinks } from "../../features/links";
import { useNotebooks } from "../../features/notebooks";
import { useLabels } from "../../features/labels";
import { useNotes } from "../../features/notes";
import { Note } from "../../features/notes/types";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { state, dispatch } = useApp();
  const { notes, filteredNotes, loading, deleteNote } = useNotes();

  const { links } = useLinks();
  const { notebooks } = useNotebooks();
  const { labels } = useLabels();

  const { confirm, ConfirmationComponent } = useConfirmation();

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<
    "notes" | "links" | "tasks" | "tools" | "calendar"
  >("notes");

  const [searchedTasks, setSearchedTasks] = useState<Task[]>([]);
  const [searchedLinks, setSearchedLinks] = useState<SavedLink[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "links" || tab === "tasks" || tab === "tools") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const getSearchConfig = (activeTab: string) => {
    switch (activeTab) {
      case "notes":
        return {
          show: true,
          placeholder: "Rechercher dans les notes...",
          value: state.ui.searchTerm,
          onChange: (term: string) =>
            dispatch({ type: "SET_SEARCH_TERM", payload: term }),
        };
      case "tasks":
        return {
          show: true,
          placeholder: "Rechercher dans les tâches...",
          value: state.ui.taskSearchTerm,
          onChange: (term: string) => {
            dispatch({ type: "SET_TASK_SEARCH_TERM", payload: term });
            handleTaskSearch(term);
          },
        };
      case "links":
        return {
          show: true,
          placeholder: "Rechercher dans les liens...",
          value: state.ui.linkSearchTerm,
          onChange: (term: string) => {
            dispatch({ type: "SET_LINK_SEARCH_TERM", payload: term });
            handleLinkSearch(term);
          },
        };
      case "tools":
      case "calendar":
        return { show: false };
      default:
        return { show: true, placeholder: "Rechercher..." };
    }
  };

  // Recherche de tâches
  const handleTaskSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchedTasks([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await tasksApi.search(term);
      setSearchedTasks(results);
    } catch (error) {
      console.error("Erreur lors de la recherche de tâches:", error);
      setSearchedTasks([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 🔧 CORRIGÉ: Recherche de liens avec la nouvelle API
  const handleLinkSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchedLinks([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await linksApi.search(term);
      setSearchedLinks(results);
    } catch (error) {
      console.error("Erreur lors de la recherche de liens:", error);
      setSearchedLinks([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTabChange = (
    tab: "notes" | "links" | "tasks" | "tools" | "calendar"
  ) => {
    setActiveTab(tab);
    setSearchedTasks([]);
    setSearchedLinks([]);
  };

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
    dispatch({ type: "CLEAR_ALL_SEARCH_TERMS" });
    setSearchedTasks([]);
    setSearchedLinks([]);
  }, [dispatch]);

  const searchConfig = getSearchConfig(activeTab);

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
              selectedNotebookId={state.ui.currentNotebook}
              onNotebookSelect={(id) =>
                dispatch({ type: "SET_CURRENT_NOTEBOOK", payload: id })
              }
              totalNotes={notes.length}
            />
            <LabelManager />
            <BlocNoteWidget />
          </div>

          {/* Main Content */}
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
                  {(state.ui.searchTerm ||
                    state.ui.taskSearchTerm ||
                    state.ui.linkSearchTerm ||
                    state.ui.currentNotebook ||
                    state.ui.selectedLabels.length > 0) && (
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

                {/* Indicateur de recherche en cours */}
                {isSearching && (
                  <div className="mt-2 text-sm text-gray-500 flex items-center">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin mr-2"></div>
                    Recherche en cours...
                  </div>
                )}

                {/* Active Filters Display */}
                {(state.ui.currentNotebook ||
                  state.ui.selectedLabels.length > 0 ||
                  (activeTab === "tasks" && state.ui.taskSearchTerm) ||
                  (activeTab === "links" && state.ui.linkSearchTerm)) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {/* 🔧 CORRIGÉ: Filtre carnet */}
                    {state.ui.currentNotebook && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        📓{" "}
                        {
                          notebooks.find(
                            (n) => n.id === state.ui.currentNotebook
                          )?.title
                        }
                        <button
                          onClick={() =>
                            dispatch({
                              type: "SET_CURRENT_NOTEBOOK",
                              payload: null,
                            })
                          }
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

                    {/* 🔧 CORRIGÉ: Labels */}
                    {state.ui.selectedLabels.map((labelId) => {
                      const label = labels.find((l) => l.id === labelId);
                      return label ? (
                        <span
                          key={labelId}
                          className="inline-flex items-center px-2 py-1 text-xs bg-teal-100 text-teal-800 rounded-full"
                        >
                          🏷️ {label.name}
                          <button
                            onClick={() => {
                              const updatedLabels =
                                state.ui.selectedLabels.filter(
                                  (id) => id !== labelId
                                );
                              dispatch({
                                type: "SET_SELECTED_LABELS",
                                payload: updatedLabels,
                              });
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

                    {/* Recherche tâches */}
                    {activeTab === "tasks" && state.ui.taskSearchTerm && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        🔍 "{state.ui.taskSearchTerm}"
                        <button
                          onClick={() => {
                            dispatch({
                              type: "SET_TASK_SEARCH_TERM",
                              payload: "",
                            });
                            setSearchedTasks([]);
                          }}
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

                    {/* Recherche liens */}
                    {activeTab === "links" && state.ui.linkSearchTerm && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                        🔍 "{state.ui.linkSearchTerm}"
                        <button
                          onClick={() => {
                            dispatch({
                              type: "SET_LINK_SEARCH_TERM",
                              payload: "",
                            });
                            setSearchedLinks([]);
                          }}
                          className="ml-1 text-indigo-600 hover:text-indigo-800"
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

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "notes"
                    ? "text-teal-500 border-b-2 border-teal-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleTabChange("notes")}
              >
                Notes ({filteredNotes.length})
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
                {state.ui.linkSearchTerm ? searchedLinks.length : links.length})
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "tasks"
                    ? "text-teal-500 border-b-2 border-teal-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleTabChange("tasks")}
              >
                Tâches {state.ui.taskSearchTerm && `(${searchedTasks.length})`}
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

            {/* Content */}
            {activeTab === "notes" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {state.ui.currentNotebook
                      ? `Notes - ${
                          notebooks.find(
                            (n) => n.id === state.ui.currentNotebook
                          )?.title
                        }`
                      : "Toutes les notes"}
                    {state.ui.selectedLabels.length > 0 &&
                      ` (${state.ui.selectedLabels.length} label(s) filtrés)`}
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
                ) : filteredNotes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredNotes.map((note) => (
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
                      : "Aucune note ne correspond aux filtres sélectionnés."}
                  </div>
                )}
              </div>
            )}

            {activeTab === "links" && (
              <LinkManager
                searchResults={
                  state.ui.linkSearchTerm ? searchedLinks : undefined
                }
                isSearching={isSearching}
              />
            )}

            {activeTab === "tasks" && (
              <TaskManager
                searchResults={
                  state.ui.taskSearchTerm ? searchedTasks : undefined
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
