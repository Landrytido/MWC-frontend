import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotebooks } from "../hooks/useNotebooks";
import { useConfirmation } from "../../../shared/hooks/useConfirmation";
import { Notebook } from "../types";

interface NotebookSidebarProps {
  className?: string;
  variant?: "default" | "compact";
  showCreateButton?: boolean;
  showStats?: boolean;
  selectedNotebookId?: number | null;
  onNotebookSelect?: (notebookId: number | null) => void;
  totalNotes?: number;
}

const NotebookSidebar: React.FC<NotebookSidebarProps> = ({
  className = "",
  variant = "default",
  showCreateButton = true,
  showStats = true,
  selectedNotebookId = null,
  onNotebookSelect,
  totalNotes = 0,
}) => {
  const { notebooks, loading, createNotebook, updateNotebook, deleteNotebook } =
    useNotebooks();
  const navigate = useNavigate();
  const { confirm, ConfirmationComponent } = useConfirmation();

  const [isCreating, setIsCreating] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState("");
  const [editingNotebook, setEditingNotebook] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllNotebooks, setShowAllNotebooks] = useState(false);

  const filteredNotebooks = notebooks.filter((notebook) =>
    notebook.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNotebook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newNotebookTitle.trim()) {
      setError("Le titre est requis");
      return;
    }

    try {
      await createNotebook(newNotebookTitle.trim());
      setNewNotebookTitle("");
      setIsCreating(false);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const handleEditNotebook = async (id: number, title: string) => {
    if (!title.trim()) {
      setError("Le titre est requis");
      return;
    }

    try {
      await updateNotebook(id, title.trim());
      setEditingNotebook(null);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const handleSelectNotebook = (notebookId: number | null) => {
    if (onNotebookSelect) {
      onNotebookSelect(notebookId);
    }
  };

  const handleDeleteNotebook = async (notebookId: number) => {
    const notebook = notebooks.find((n) => n.id === notebookId);
    if (!notebook) return;

    const hasNotes = (notebook.noteCount || 0) > 0;

    const confirmed = await confirm({
      title: "Supprimer le carnet",
      message: hasNotes
        ? `Ce carnet contient ${notebook.noteCount} note(s). Êtes-vous sûr de vouloir le supprimer ? Les notes seront déplacées vers "Aucun carnet".`
        : "Êtes-vous sûr de vouloir supprimer ce carnet ?",
      confirmText: "Supprimer",
      cancelText: "Annuler",
      variant: hasNotes ? "warning" : "danger",
    });

    if (!confirmed) return;

    try {
      await deleteNotebook(notebookId, true);
      if (selectedNotebookId === notebookId) {
        handleSelectNotebook(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
    }
  };

  const handleCreateNoteInNotebook = (notebookId: number) => {
    navigate(`/dashboard/notes/new?notebookId=${notebookId}`);
  };

  const totalNotesCalculated = notebooks.reduce(
    (sum, nb) => sum + (nb.noteCount || 0),
    0
  );

  const NotebookItem: React.FC<{ notebook: Notebook }> = ({ notebook }) => {
    return (
      <div
        className={`group relative rounded-md transition-colors ${
          selectedNotebookId === notebook.id
            ? "bg-teal-50 text-teal-700 border border-teal-200"
            : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        {editingNotebook?.id === notebook.id ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingNotebook) {
                handleEditNotebook(notebook.id, editingNotebook.title);
              }
            }}
            className="p-3"
          >
            <input
              type="text"
              value={editingNotebook?.title || ""}
              onChange={(e) =>
                setEditingNotebook(
                  editingNotebook
                    ? {
                        ...editingNotebook,
                        title: e.target.value,
                      }
                    : null
                )
              }
              className="w-full p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoFocus
            />
            <div className="flex justify-end space-x-1 mt-2">
              <button
                type="button"
                onClick={() => setEditingNotebook(null)}
                className="p-1 text-gray-500 hover:text-gray-700"
                title="Annuler"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <button
                type="submit"
                className="p-1 text-green-600 hover:text-green-700"
                title="Sauvegarder"
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
            </div>
          </form>
        ) : (
          <>
            <button
              onClick={() => handleSelectNotebook(notebook.id)}
              className="w-full text-left px-3 py-2 pr-20 text-sm min-w-0"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center min-w-0 flex-1">
                  <span className="mr-2 flex-shrink-0">📓</span>
                  <span className="truncate">{notebook.title}</span>
                </span>
                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                  {notebook.noteCount || 0}
                </span>
              </div>
            </button>

            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-sm shadow-sm px-1">
              <button
                onClick={() => handleCreateNoteInNotebook(notebook.id)}
                className="p-1 text-gray-400 hover:text-teal-500"
                title="Créer une note dans ce carnet"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              <button
                onClick={() =>
                  setEditingNotebook({
                    id: notebook.id,
                    title: notebook.title,
                  })
                }
                className="p-1 text-gray-400 hover:text-blue-500"
                title="Modifier"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={() => handleDeleteNotebook(notebook.id)}
                className="p-1 text-gray-400 hover:text-red-500"
                title="Supprimer"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  if (variant === "compact") {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-3 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-800">Carnets</h3>
          {showCreateButton && (
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="p-1 text-gray-500 hover:text-teal-500 rounded"
              title="Créer un carnet"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="space-y-1">
          <button
            onClick={() => handleSelectNotebook(null)}
            className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${
              selectedNotebookId === null
                ? "bg-teal-50 text-teal-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            📝 Toutes ({totalNotes})
          </button>

          {filteredNotebooks.slice(0, 3).map((notebook) => (
            <button
              key={notebook.id}
              onClick={() => handleSelectNotebook(notebook.id)}
              className={`w-full text-left px-2 py-1 text-xs rounded transition-colors truncate ${
                selectedNotebookId === notebook.id
                  ? "bg-teal-50 text-teal-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              title={notebook.title}
            >
              📓 {notebook.title} ({notebook.noteCount || 0})
            </button>
          ))}

          {filteredNotebooks.length > 3 && (
            <div className="relative">
              <button
                onClick={() => setShowAllNotebooks(!showAllNotebooks)}
                className="w-full p-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors text-center border border-dashed border-gray-300"
              >
                {showAllNotebooks ? (
                  <>
                    <svg
                      className="w-3 h-3 inline mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                    Masquer les autres
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3 h-3 inline mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    +{filteredNotebooks.length - 3} autres carnets
                  </>
                )}
              </button>

              {showAllNotebooks && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                  <div className="p-1 space-y-1">
                    {filteredNotebooks.slice(3).map((notebook) => (
                      <button
                        key={notebook.id}
                        onClick={() => handleSelectNotebook(notebook.id)}
                        className={`w-full text-left px-2 py-1 text-xs rounded transition-colors truncate ${
                          selectedNotebookId === notebook.id
                            ? "bg-teal-50 text-teal-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                        title={notebook.title}
                      >
                        📓 {notebook.title} ({notebook.noteCount || 0})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          📓 Carnets
          {showStats && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({notebooks.length})
            </span>
          )}
        </h3>
        {showCreateButton && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="p-1 text-gray-500 hover:text-teal-500 rounded transition-colors"
            title="Créer un carnet"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        )}
      </div>

      {showStats && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Total notes:</span>
              <span className="ml-1 font-medium">{totalNotesCalculated}</span>
            </div>
            <div>
              <span className="text-gray-600">Carnets:</span>
              <span className="ml-1 font-medium">{notebooks.length}</span>
            </div>
          </div>
        </div>
      )}

      {notebooks.length > 3 && (
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un carnet..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
      )}

      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      {isCreating && (
        <form onSubmit={handleCreateNotebook} className="mb-4">
          <input
            type="text"
            value={newNotebookTitle}
            onChange={(e) => setNewNotebookTitle(e.target.value)}
            placeholder="Nom du carnet"
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            autoFocus
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewNotebookTitle("");
                setError("");
              }}
              className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-xs bg-teal-500 text-white rounded hover:bg-teal-600"
            >
              Créer
            </button>
          </div>
        </form>
      )}

      <div className="relative space-y-1">
        <div
          className={`group relative rounded-md transition-colors ${
            selectedNotebookId === null
              ? "bg-teal-50 text-teal-700 border border-teal-200"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <button
            onClick={() => handleSelectNotebook(null)}
            className="w-full text-left px-3 py-2 text-sm"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <span className="mr-2">📝</span>
                Toutes les notes
              </span>
              <span className="text-xs text-gray-500">{totalNotes}</span>
            </div>
          </button>
        </div>

        {filteredNotebooks.length > 0 && (
          <div className="border-t border-gray-200 my-2"></div>
        )}

        {loading ? (
          <div className="p-3 text-sm text-gray-500 text-center">
            Chargement...
          </div>
        ) : filteredNotebooks.length === 0 ? (
          <div className="p-3 text-sm text-gray-500 text-center">
            {searchTerm ? "Aucun carnet trouvé" : "Aucun carnet"}
          </div>
        ) : (
          <>
            <div className="space-y-1">
              {filteredNotebooks.slice(0, 3).map((notebook) => (
                <NotebookItem key={notebook.id} notebook={notebook} />
              ))}
            </div>

            {filteredNotebooks.length > 3 && (
              <div className="relative">
                <button
                  onClick={() => setShowAllNotebooks(!showAllNotebooks)}
                  className="w-full p-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors text-center border border-dashed border-gray-300"
                >
                  {showAllNotebooks ? (
                    <>
                      <svg
                        className="w-3 h-3 inline mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                      Masquer les autres
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3 h-3 inline mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      +{filteredNotebooks.length - 3} autres carnets
                    </>
                  )}
                </button>

                {showAllNotebooks && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                    <div className="p-1 space-y-1">
                      {filteredNotebooks.slice(3).map((notebook) => (
                        <NotebookItem key={notebook.id} notebook={notebook} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {selectedNotebookId && (
        <div className="mt-4 p-2 bg-teal-50 rounded-md">
          <p className="text-xs text-teal-700">
            Affichage:{" "}
            {notebooks.find((n) => n.id === selectedNotebookId)?.title}
          </p>
        </div>
      )}
      <ConfirmationComponent />
    </div>
  );
};

export default NotebookSidebar;
