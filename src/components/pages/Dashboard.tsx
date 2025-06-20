import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../layout/Layout";
import NoteCard from "../dashboard/NoteCard";
import LinkCard from "../dashboard/LinkCard";
import NotebookSidebar from "../dashboard/NotebookSidebar";
import LabelManager from "../dashboard/LabelManager";
import BlocNoteWidget from "../dashboard/BlocNoteWidget";
import { useApp, useNotes, useLinks, useUI } from "../contexts/AppContext";
import { useApiService } from "../services/apiService";
import { Note, SavedLink } from "../types";
import TaskManager from "../dashboard/TaskManager";
import { useConfirmation } from "../dashboard/useConfirmation";
import ToolsManager from "../dashboard/ToolsManager";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { state, dispatch } = useApp();
  const { notes, filteredNotes, loading: notesLoading } = useNotes();
  const { links, loading: linksLoading } = useLinks();
  const api = useApiService();
  const { confirm, ConfirmationComponent } = useConfirmation();

  const [activeTab, setActiveTab] = useState<
    "notes" | "links" | "tasks" | "tools"
  >("notes");

  const initializationRef = useRef(false);
  const { searchTerm } = useUI();
  useEffect(() => {
    if (!initializationRef.current && authState.user) {
      console.log("🚀 Initializing dashboard data...");
      initializationRef.current = true;

      const initializeData = async () => {
        try {
          Promise.allSettled([
            api.notes.getAll(),
            api.notebooks.getAll(),
            api.labels.getAll(),
            api.links.getAll(),
            api.blocNote.get(),
            api.tasks.getAll(),
          ]).then(() => {
            console.log("✅ Dashboard data initialized");
          });
        } catch (error) {
          console.error("❌ Error initializing dashboard data:", error);
        }
      };

      initializeData();
    }
  }, [
    authState.user?.id,
    authState.user,
    api.notes,
    api.tasks,
    api.links,
    api.notebooks,
    api.labels,
    api.blocNote,
  ]);

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
        await api.notes.delete(id);
      } catch (error) {
        console.error("Error deleting note:", error);
      }
    },
    [confirm, api.notes]
  );

  const handleEditLink = useCallback(
    (link: SavedLink) => {
      navigate(`/dashboard/links/${link.id}`);
    },
    [navigate]
  );

  const handleDeleteLink = useCallback(
    async (id: number) => {
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
        await api.links.delete(id);
      } catch (error) {
        console.error("Error deleting link:", error);
      }
    },
    [confirm, api.links]
  );
  const handleClearFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
  }, [dispatch]);

  if (!initializationRef.current) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-teal-500 rounded-full animate-spin mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Chargement de votre tableau de bord...
              </h2>
              <p className="text-gray-500">
                Nous préparons vos données, veuillez patienter.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Bonjour, {authState.user?.firstName || "utilisateur"} 👋
          </h1>
          <p className="text-gray-600">
            Bienvenue sur votre tableau de bord My Web Companion
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <NotebookSidebar />
            <LabelManager />
            <BlocNoteWidget />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_SEARCH_TERM",
                      payload: e.target.value,
                    })
                  }
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
                {(searchTerm ||
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

              {/* Active Filters Display */}
              {(state.ui.currentNotebook ||
                state.ui.selectedLabels.length > 0) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {state.ui.currentNotebook && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      📔{" "}
                      {
                        state.notebooks.find(
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
                  {state.ui.selectedLabels.map((labelId) => {
                    const label = state.labels.find((l) => l.id === labelId);
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
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "notes"
                    ? "text-teal-500 border-b-2 border-teal-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("notes")}
              >
                Notes ({filteredNotes.length})
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "links"
                    ? "text-teal-500 border-b-2 border-teal-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("links")}
              >
                Liens Sauvegardés ({links.length})
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "tasks"
                    ? "text-teal-500 border-b-2 border-teal-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("tasks")}
              >
                Tâches
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "tools"
                    ? "text-teal-500 border-b-2 border-teal-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("tools")}
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
                          state.notebooks.find(
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

                {notesLoading.isLoading ? (
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
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Mes Liens Sauvegardés
                  </h2>
                  <button
                    onClick={() => navigate("/dashboard/links/new")}
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
                    Nouveau lien
                  </button>
                </div>

                {linksLoading.isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="text-gray-500">Chargement des liens...</div>
                  </div>
                ) : links.length > 0 ? (
                  <div className="space-y-4">
                    {links.map((link) => (
                      <LinkCard
                        key={link.id}
                        link={link}
                        onEdit={handleEditLink}
                        onDelete={() => handleDeleteLink(link.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Vous n'avez pas encore de liens sauvegardés. Commencez par
                    en ajouter un !
                  </div>
                )}
              </div>
            )}
            {activeTab === "tasks" && <TaskManager />}
            {activeTab === "tools" && <ToolsManager />}
          </div>
        </div>
      </div>
      <ConfirmationComponent />
    </Layout>
  );
};

export default Dashboard;
