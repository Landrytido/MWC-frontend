import React, { useState } from "react";
import { useApp, useNotebooks } from "../contexts/AppContext";
import { useApiService } from "../services/apiService";
import { CreateNotebookForm } from "../types";
import { useConfirmation } from "../dashboard/useConfirmation";

interface NotebookSidebarProps {
  className?: string;
}

const NotebookSidebar: React.FC<NotebookSidebarProps> = ({
  className = "",
}) => {
  const { state, dispatch } = useApp();
  const { notebooks, loading } = useNotebooks();
  const api = useApiService();
  const [isCreating, setIsCreating] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState("");
  const [error, setError] = useState("");
  const { confirm } = useConfirmation();

  const handleCreateNotebook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newNotebookTitle.trim()) {
      setError("Le titre est requis");
      return;
    }

    try {
      const notebookData: CreateNotebookForm = {
        title: newNotebookTitle.trim(),
      };

      await api.notebooks.create(notebookData);
      setNewNotebookTitle("");
      setIsCreating(false);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const handleSelectNotebook = (notebookId: number | null) => {
    dispatch({ type: "SET_CURRENT_NOTEBOOK", payload: notebookId });
  };

  const handleDeleteNotebook = async (notebookId: number) => {
    const confirmed = await confirm({
      title: "Supprimer le carnet",
      message:
        "Êtes-vous sûr de vouloir supprimer ce carnet ? Cette action est irréversible.",
      confirmText: "Supprimer",
      cancelText: "Annuler",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      await api.notebooks.delete(notebookId);
      if (state.ui.currentNotebook === notebookId) {
        dispatch({ type: "SET_CURRENT_NOTEBOOK", payload: null });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Carnets</h3>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="p-1 text-gray-500 hover:text-teal-500 rounded"
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
      </div>

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

      <div className="space-y-1">
        {/* All Notes option */}
        <button
          onClick={() => handleSelectNotebook(null)}
          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
            state.ui.currentNotebook === null
              ? "bg-teal-50 text-teal-700 border border-teal-200"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span>📝 Toutes les notes</span>
            <span className="text-xs text-gray-500">{state.notes.length}</span>
          </div>
        </button>

        {/* Notebooks list */}
        {loading.isLoading ? (
          <div className="p-3 text-sm text-gray-500 text-center">
            Chargement...
          </div>
        ) : notebooks.length === 0 ? (
          <div className="p-3 text-sm text-gray-500 text-center">
            Aucun carnet
          </div>
        ) : (
          notebooks.map((notebook) => (
            <div
              key={notebook.id}
              className={`group relative rounded-md transition-colors ${
                state.ui.currentNotebook === notebook.id
                  ? "bg-teal-50 text-teal-700 border border-teal-200"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <button
                onClick={() => handleSelectNotebook(notebook.id)}
                className="w-full text-left px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span>📔 {notebook.title}</span>
                  <span className="text-xs text-gray-500">
                    {notebook.noteCount || 0}
                  </span>
                </div>
              </button>

              {/* Delete button (appears on hover) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNotebook(notebook.id);
                }}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Supprimer le carnet"
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
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotebookSidebar;
