import React, { useState, useEffect, useCallback, useRef } from "react";
import { useBlocNote } from "../contexts/AppContext";
import { useApiService } from "../services/apiService";
import { useConfirmation } from "./useConfirmation";

interface BlocNoteWidgetProps {
  className?: string;
}

const BlocNoteWidget: React.FC<BlocNoteWidgetProps> = ({ className = "" }) => {
  const { blocNote, loading } = useBlocNote();
  const api = useApiService();
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const loadedRef = useRef(false);
  const { confirm, ConfirmationComponent } = useConfirmation();

  useEffect(() => {
    if (!loadedRef.current && !blocNote && !loading.isLoading) {
      console.log("🚀 Loading bloc note...");
      loadedRef.current = true;
      api.blocNote.get().catch((error) => {
        console.error("❌ Error loading bloc note:", error);
        loadedRef.current = false;
      });
    }
  }, [loading.isLoading]);

  useEffect(() => {
    if (blocNote) {
      setContent(blocNote.content);
    }
  }, [blocNote]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError("");

    try {
      await api.blocNote.update(content);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSaving(false);
    }
  }, [content]);

  const handleCancel = useCallback(() => {
    setContent(blocNote?.content || "");
    setIsEditing(false);
    setError("");
  }, [blocNote]);

  const handleDelete = useCallback(async () => {
    const confirmed = await confirm({
      title: "Vider le bloc-notes",
      message:
        "Êtes-vous sûr de vouloir vider le bloc-notes ? Tout le contenu sera définitivement supprimé.",
      confirmText: "Vider",
      cancelText: "Annuler",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      await api.blocNote.delete();
      setContent("");
      setIsEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
    }
  }, [confirm, api.blocNote]);

  const isEmpty = !content.trim();

  if (!loadedRef.current && loading.isLoading) {
    return (
      <div
        className={`bg-yellow-50 rounded-lg shadow-md p-4 border border-yellow-200 ${className}`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            ✏️ Bloc-notes rapide
          </h3>
        </div>
        <div className="p-4 text-center text-gray-500">
          <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin"></div>
          <p className="mt-2 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-yellow-50 rounded-lg shadow-md p-4 border border-yellow-200 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          ✏️ Bloc-notes rapide
        </h3>
        <div className="flex space-x-2">
          {!isEmpty && (
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-500 rounded"
              title="Vider le bloc-notes"
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
          )}
          {isEditing ? (
            <div className="flex space-x-1">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="p-1 text-gray-500 hover:text-gray-700 rounded"
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
                onClick={handleSave}
                disabled={isSaving}
                className="p-1 text-green-600 hover:text-green-700 rounded"
                title="Sauvegarder"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
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
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-500 hover:text-teal-500 rounded"
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
          )}
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="relative">
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Prenez des notes rapides ici..."
            className="w-full h-40 p-3 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="min-h-[10rem] p-3 text-sm text-gray-700 bg-gray-50 rounded-md cursor-text hover:bg-gray-100 transition-colors overflow-hidden"
          >
            {isEmpty ? (
              <p className="text-gray-400 italic">
                Cliquez ici pour commencer à prendre des notes rapides...
              </p>
            ) : (
              <div className="whitespace-pre-wrap font-sans break-words overflow-wrap-anywhere">
                {content}
              </div>
            )}
          </div>
        )}
      </div>

      {blocNote?.updatedAt && !isEditing && (
        <div className="mt-3 text-xs text-gray-400">
          Dernière modification :{" "}
          {new Date(blocNote.updatedAt).toLocaleString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}
      <ConfirmationComponent />
    </div>
  );
};

export default BlocNoteWidget;
