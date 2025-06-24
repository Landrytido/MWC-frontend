import React, { useState, useEffect, useRef } from "react";
import { useApp, useLabels } from "../contexts/AppContext";
import { useApiService } from "../services/apiService";
import { useConfirmation } from "./useConfirmation";
import { getLabelColor, getLabelColorClasses, Label } from "../types";

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
  const [showAllLabels, setShowAllLabels] = useState(false);
  const { confirm, ConfirmationComponent } = useConfirmation();

  const labelsLoadedRef = useRef(false);

  useEffect(() => {
    const shouldLoadLabels =
      !labelsLoadedRef.current && labels.length === 0 && !loading.isLoading;

    if (shouldLoadLabels) {
      console.log("🚀 Loading labels...");
      labelsLoadedRef.current = true;

      api.labels.getAll().catch((error) => {
        console.error("❌ Error loading labels:", error);
        labelsLoadedRef.current = false;
      });
    }
  }, []);

  const getLabelDisplayClasses = (labelId: string) => {
    const color = getLabelColor(labelId);
    return getLabelColorClasses(color);
  };

  useEffect(() => {
    if (labels.length > 0) {
      labelsLoadedRef.current = true;
    }
  }, [labels.length]);

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

  const handleDeleteLabel = async (id: string) => {
    const label = labels.find((l) => l.id === id);
    if (!label) return;

    const hasNotes = (label.noteCount || 0) > 0;

    const confirmed = await confirm({
      title: "Supprimer le label",
      message: hasNotes
        ? `Ce label est utilisé par ${label.noteCount} note(s). Voulez-vous vraiment le supprimer ? Cela le retirera de toutes les notes.`
        : "Êtes-vous sûr de vouloir supprimer ce label ?",
      confirmText: "Supprimer",
      cancelText: "Annuler",
      variant: hasNotes ? "warning" : "danger",
    });

    if (!confirmed) return;

    try {
      await api.labels.delete(id, true);
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

  // Composant pour afficher un label individuel
  const LabelItem: React.FC<{ label: Label }> = ({ label }) => {
    const colorClasses = getLabelDisplayClasses(label.id);
    const isSelected = state.ui.selectedLabels.includes(label.id);

    return (
      <div className="group relative flex items-center space-x-2 p-1.5 rounded-md hover:bg-gray-50">
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
              value={editingLabel?.name || ""}
              onChange={(e) =>
                setEditingLabel(
                  editingLabel
                    ? {
                        ...editingLabel,
                        name: e.target.value,
                      }
                    : null
                )
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
              className={`flex-1 flex items-center justify-between text-left text-sm py-1 px-2 rounded transition-colors min-w-0 ${
                isSelected
                  ? colorClasses.default
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="flex items-center min-w-0 flex-1">
                <span
                  className={`w-3 h-3 rounded-full ${colorClasses.dot} mr-2 flex-shrink-0`}
                ></span>
                <span className="truncate">{label.name}</span>
              </span>
              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                {label.noteCount || 0}
              </span>
            </button>

            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  if (label.id) {
                    setEditingLabel({ id: label.id, name: label.name });
                  }
                }}
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
    );
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

      <div className="relative space-y-1">
        {loading.isLoading ? (
          <div className="p-3 text-sm text-gray-500 text-center">
            Chargement...
          </div>
        ) : labels.length === 0 ? (
          <div className="p-3 text-sm text-gray-500 text-center">
            Aucun label
          </div>
        ) : (
          <>
            {/* Affichage des 3 premiers labels */}
            <div className="space-y-1">
              {labels.slice(0, 3).map((label) => (
                <LabelItem key={label.id} label={label} />
              ))}
            </div>

            {/* Bouton pour afficher les autres labels */}
            {labels.length > 3 && (
              <div className="relative">
                <button
                  onClick={() => setShowAllLabels(!showAllLabels)}
                  className="w-full p-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors text-center border border-dashed border-gray-300"
                >
                  {showAllLabels ? (
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
                      +{labels.length - 3} autres labels
                    </>
                  )}
                </button>

                {/* Overlay avec tous les autres labels */}
                {showAllLabels && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                    <div className="p-1 space-y-1">
                      {labels.slice(3).map((label) => (
                        <LabelItem key={label.id} label={label} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {state.ui.selectedLabels.length > 0 && (
        <div className="mt-4 p-2 bg-teal-50 rounded-md">
          <p className="text-xs text-teal-700">
            {state.ui.selectedLabels.length} label(s) sélectionné(s)
          </p>
        </div>
      )}

      <ConfirmationComponent />
    </div>
  );
};

export default LabelManager;
