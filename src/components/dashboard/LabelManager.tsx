import React, { useState, useEffect } from "react";
import { useApp, useLabels } from "../contexts/AppContext";
import { useApiService } from "../services/apiService";

interface LabelManagerProps {
  className?: string;
}

const LabelManager: React.FC<LabelManagerProps> = ({ className = "" }) => {
  const { state, dispatch } = useApp();
  const { labels, loading } = useLabels();
  const api = useApiService();
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [editingLabel, setEditingLabel] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (labels.length === 0 && !loading.isLoading) {
      api.labels.getAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labels.length, loading.isLoading, api.labels.getAll]);

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newLabelName.trim()) {
      setError("Le nom est requis");
      return;
    }

    try {
      await api.labels.create({ name: newLabelName.trim() });
      setNewLabelName("");
      setIsCreating(false);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const handleUpdateLabel = async (id: string, name: string) => {
    if (!name.trim()) {
      setError("Le nom est requis");
      return;
    }

    try {
      await api.labels.update(id, { name: name.trim() });
      setEditingLabel(null);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const handleDeleteLabel = async (id: string, forceDelete = false) => {
    const label = labels.find((l) => l.id === id);
    if (!label) return;

    const hasNotes = (label.noteCount || 0) > 0;

    if (hasNotes && !forceDelete) {
      const confirmMessage = `Ce label est utilisé par ${label.noteCount} note(s). Voulez-vous vraiment le supprimer ? Cela le retirera de toutes les notes.`;
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    try {
      await api.labels.delete(id, hasNotes);
      // Remove from selected labels if it was selected
      const updatedSelectedLabels = state.ui.selectedLabels.filter(
        (labelId) => labelId !== id
      );
      dispatch({ type: "SET_SELECTED_LABELS", payload: updatedSelectedLabels });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
    }
  };

  const handleToggleLabel = (labelId: string) => {
    const isSelected = state.ui.selectedLabels.includes(labelId);
    const updatedLabels = isSelected
      ? state.ui.selectedLabels.filter((id) => id !== labelId)
      : [...state.ui.selectedLabels, labelId];

    dispatch({ type: "SET_SELECTED_LABELS", payload: updatedLabels });
  };

  const handleClearFilters = () => {
    dispatch({ type: "SET_SELECTED_LABELS", payload: [] });
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Labels</h3>
        <div className="flex space-x-2">
          {state.ui.selectedLabels.length > 0 && (
            <button
              onClick={handleClearFilters}
              className="p-1 text-gray-500 hover:text-red-500 rounded"
              title="Effacer les filtres"
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
          )}
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="p-1 text-gray-500 hover:text-teal-500 rounded"
            title="Créer un label"
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
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      {isCreating && (
        <form onSubmit={handleCreateLabel} className="mb-4">
          <input
            type="text"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            placeholder="Nom du label"
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            autoFocus
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewLabelName("");
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

      <div className="space-y-2">
        {loading.isLoading ? (
          <div className="p-3 text-sm text-gray-500 text-center">
            Chargement...
          </div>
        ) : labels.length === 0 ? (
          <div className="p-3 text-sm text-gray-500 text-center">
            Aucun label
          </div>
        ) : (
          labels.map((label) => (
            <div
              key={label.id}
              className="group relative flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50"
            >
              {editingLabel?.id === label.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateLabel(label.id, editingLabel.name);
                  }}
                  className="flex-1 flex items-center space-x-2"
                >
                  <input
                    type="text"
                    value={editingLabel.name}
                    onChange={(e) =>
                      setEditingLabel({ ...editingLabel, name: e.target.value })
                    }
                    className="flex-1 p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    autoFocus
                  />
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
                  <button
                    type="button"
                    onClick={() => setEditingLabel(null)}
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
                </form>
              ) : (
                <>
                  <button
                    onClick={() => handleToggleLabel(label.id)}
                    className={`flex-1 flex items-center justify-between text-left text-sm py-1 px-2 rounded transition-colors ${
                      state.ui.selectedLabels.includes(label.id)
                        ? "bg-teal-100 text-teal-800"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-teal-500 mr-2"></span>
                      {label.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {label.noteCount || 0}
                    </span>
                  </button>

                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() =>
                        setEditingLabel({ id: label.id, name: label.name })
                      }
                      className="p-1 text-gray-400 hover:text-blue-500"
                      title="Modifier"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteLabel(label.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Supprimer"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {state.ui.selectedLabels.length > 0 && (
        <div className="mt-4 p-2 bg-teal-50 rounded-md">
          <p className="text-xs text-teal-700">
            {state.ui.selectedLabels.length} label(s) sélectionné(s)
          </p>
        </div>
      )}
    </div>
  );
};

export default LabelManager;
