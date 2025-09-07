import React, { useState, useEffect, useCallback, useRef } from "react";
import { useBlocNote } from "../hooks/useBlocNote";
import { useConfirmation } from "../../../shared/hooks/useConfirmation";

interface BlocNoteWidgetProps {
  className?: string;
}

const BlocNoteWidget: React.FC<BlocNoteWidgetProps> = ({ className = "" }) => {
  const {
    blocNote,
    loading,
    error,
    saveStatus,
    updateBlocNote,
    deleteBlocNote,
    autoSave,
  } = useBlocNote();

  const { confirm, ConfirmationComponent } = useConfirmation();

  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [editingMode, setEditingMode] = useState<"click" | "button" | null>(
    null
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const expandedTextareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync content with blocNote
  useEffect(() => {
    if (blocNote) {
      setContent(blocNote.content);
    }
  }, [blocNote]);

  // Focus management for expanded mode
  useEffect(() => {
    if (isExpanded && expandedTextareaRef.current) {
      expandedTextareaRef.current.focus();
      expandedTextareaRef.current.setSelectionRange(
        cursorPosition,
        cursorPosition
      );
    }
  }, [isExpanded, cursorPosition]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);

    // Sauvegarder la position du curseur
    const textarea = isExpanded
      ? expandedTextareaRef.current
      : textareaRef.current;
    if (textarea) {
      setCursorPosition(textarea.selectionStart);
    }

    if (isEditing || isExpanded) {
      autoSave(newContent);
    }
  };

  const handleExpandToggle = () => {
    // Sauvegarder la position du curseur avant de changer de mode
    const currentTextarea = isExpanded
      ? expandedTextareaRef.current
      : textareaRef.current;
    if (currentTextarea) {
      setCursorPosition(currentTextarea.selectionStart);
    }

    setIsExpanded(!isExpanded);
  };

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setLocalError("");

    try {
      await updateBlocNote(content);
      setIsEditing(false);
      setEditingMode(null);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSaving(false);
    }
  }, [content, updateBlocNote]);

  const handleCancel = useCallback(() => {
    setContent(blocNote?.content || "");
    setIsEditing(false);
    setEditingMode(null);
    setLocalError("");
  }, [blocNote]);

  // Fonction pour démarrer l'édition avec tracking du mode
  const startEditing = useCallback((mode: "click" | "button") => {
    setIsEditing(true);
    setEditingMode(mode);
  }, []);

  // Fonction pour arrêter l'édition automatiquement (seulement si mode "click")
  const stopEditingAuto = useCallback(() => {
    if (editingMode === "click") {
      setIsEditing(false);
      setEditingMode(null);
    }
  }, [editingMode]);

  // Gestion du clic en dehors et de la touche Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        isEditing &&
        editingMode === "click"
      ) {
        stopEditingAuto();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isEditing && editingMode === "click") {
        stopEditingAuto();
      }
    };

    if (isEditing && editingMode === "click") {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isEditing, editingMode, stopEditingAuto]);

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
      await deleteBlocNote();
      setContent("");
      setIsEditing(false);
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
    }
  }, [confirm, deleteBlocNote]);

  const isEmpty = !content.trim();

  const SaveIndicator = () => {
    if (!saveStatus) return null;

    const indicators = {
      saving: { icon: "⏳", text: "Sauvegarde...", color: "text-blue-600" },
      saved: { icon: "✅", text: "Sauvegardé", color: "text-green-600" },
      unsaved: { icon: "⚪", text: "Non sauvegardé", color: "text-gray-500" },
    };

    const current = indicators[saveStatus];

    return (
      <div className={`flex items-center text-xs ${current.color} ml-2`}>
        <span className="mr-1">{current.icon}</span>
        {current.text}
      </div>
    );
  };

  const ExpandedModal = () => {
    if (!isExpanded) return null;

    return (
      <>
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleExpandToggle}
        />

        <div className="fixed inset-0 flex items-center justify-center p-8 z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[600px] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  ✏️ Bloc-notes rapide (Mode étendu)
                </h3>
                <SaveIndicator />
              </div>

              <div className="flex items-center space-x-2">
                {!isEmpty && (
                  <button
                    onClick={handleDelete}
                    className="p-2 text-gray-400 hover:text-red-500 rounded"
                    title="Vider le bloc-notes"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}

                <button
                  onClick={handleExpandToggle}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded"
                  title="Fermer"
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
              </div>
            </div>

            {(error || localError) && (
              <div className="mx-4 mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
                {error || localError}
              </div>
            )}

            <div className="flex-1 p-4 overflow-hidden">
              <textarea
                ref={expandedTextareaRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Prenez des notes rapides ici..."
                className="w-full h-full p-4 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-3 py-1 bg-teal-500 text-white text-sm rounded hover:bg-teal-600 disabled:opacity-50 flex items-center"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 mr-1"
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
                        Sauvegarder
                      </>
                    )}
                  </button>

                  <SaveIndicator />
                </div>

                {blocNote?.updatedAt && (
                  <div className="text-xs text-gray-400">
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
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  if (loading) {
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
    <>
      <div
        ref={containerRef}
        className={`bg-yellow-50 rounded-lg shadow-md p-4 border border-yellow-200 ${className}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              ✏️ Bloc-notes rapide
            </h3>
            <SaveIndicator />
          </div>

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

            <button
              onClick={handleExpandToggle}
              className="p-1 text-gray-400 hover:text-blue-500 rounded"
              title="Mode étendu"
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
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>

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
                onClick={() => startEditing("button")}
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

        {(error || localError) && (
          <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded-md">
            {error || localError}
          </div>
        )}

        <div className="relative">
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Prenez des notes rapides ici..."
              className="w-full h-40 p-3 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              autoFocus
            />
          ) : (
            <div
              onClick={() => startEditing("click")}
              className="h-40 p-3 text-sm text-gray-700 bg-gray-50 rounded-md cursor-text hover:bg-gray-100 transition-colors overflow-y-auto"
            >
              {isEmpty ? (
                <p className="text-gray-400 italic">
                  Cliquez ici pour commencer à prendre des notes rapides...
                </p>
              ) : (
                <div className="whitespace-pre-wrap font-sans break-words">
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
      </div>

      <ExpandedModal />

      <ConfirmationComponent />
    </>
  );
};

export default BlocNoteWidget;
