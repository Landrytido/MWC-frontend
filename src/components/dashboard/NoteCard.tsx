import React, { useState } from "react";
import { Note, LABEL_COLORS } from "../types";
import { LabelList } from "../common/LabelBadge";
import NotebookSelector from "../../features/notebooks/components/NotebookSelector";
import LabelSelector from "../../features/labels/components/LabelSelector";
import { useApiService } from "../services/apiService";
import { useConfirmation } from "../../shared/hooks/useConfirmation";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
  onView?: (note: Note) => void;
  showActions?: boolean;
  variant?: "default" | "compact" | "detailed";
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onView,
  showActions = true,
  variant = "default",
}) => {
  const api = useApiService();
  const { confirm, ConfirmationComponent } = useConfirmation();

  const [isEditingNotebook, setIsEditingNotebook] = useState(false);
  const [isEditingLabels, setIsEditingLabels] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formattedDate = note.createdAt
    ? new Date(note.createdAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const handleNotebookChange = async (notebookId: number | null) => {
    setIsLoading(true);
    try {
      await api.notes.moveToNotebook(note.id, notebookId);
      setIsEditingNotebook(false);
    } catch (error) {
      console.error("Erreur lors du déplacement de la note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLabelAdd = async (labelIds: string[]) => {
    const currentLabelIds = note.labels?.map((l) => l.id) || [];
    const newLabelIds = labelIds.filter((id) => !currentLabelIds.includes(id));

    setIsLoading(true);
    try {
      for (const labelId of newLabelIds) {
        await api.notes.addLabel(note.id, labelId);
      }
      setIsEditingLabels(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout des labels:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLabelRemove = async (labelId: string) => {
    const confirmed = await confirm({
      title: "Retirer le label",
      message: "Voulez-vous retirer ce label de la note ?",
      confirmText: "Retirer",
      cancelText: "Annuler",
      variant: "warning",
    });

    if (!confirmed) return;

    setIsLoading(true);
    try {
      await api.notes.removeLabel(note.id, labelId);
    } catch (error) {
      console.error("Erreur lors de la suppression du label:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCompactCard = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3
            className="font-medium text-gray-900 truncate cursor-pointer hover:text-teal-500 transition-colors"
            onClick={() => onView?.(note)}
            title={note.title}
          >
            {note.title}
          </h3>

          <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
            {note.notebookTitle && (
              <span className="flex items-center">
                <span className="mr-1">📓</span>
                {note.notebookTitle}
              </span>
            )}
            <span>•</span>
            <span>{formattedDate}</span>
          </div>

          {note.labels && note.labels.length > 0 && (
            <div className="mt-2">
              <LabelList
                labels={note.labels}
                removable={true}
                onRemove={handleLabelRemove}
                size="sm"
                maxDisplay={3}
                spacing="tight"
              />
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3">
            <button
              onClick={() => onEdit(note)}
              className="p-1 text-gray-400 hover:text-teal-500 rounded"
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
              onClick={() => onDelete(note.id)}
              className="p-1 text-gray-400 hover:text-red-500 rounded"
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
        )}
      </div>
    </div>
  );

  const renderDefaultCard = () => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow group relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div
            className={`w-6 h-6 border-2 ${LABEL_COLORS.teal.dot.replace(
              "bg-",
              "border-"
            )} border-t-transparent rounded-full animate-spin`}
          ></div>
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3
            className="font-semibold text-gray-800 cursor-pointer hover:text-teal-500 transition-colors flex-1 pr-2"
            onClick={() => onView?.(note)}
          >
            {note.title}
          </h3>

          {showActions && (
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(note)}
                className="p-2 text-gray-400 hover:text-teal-500 rounded-md transition-colors"
                title="Modifier la note"
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
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              <button
                onClick={() => onDelete(note.id)}
                className="p-2 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                title="Supprimer la note"
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
          )}
        </div>

        <div className="mb-3">
          {isEditingNotebook ? (
            <NotebookSelector
              selectedNotebookId={note.notebookId}
              onNotebookChange={handleNotebookChange}
              includeNone
              size="sm"
              placeholder="Choisir un carnet..."
            />
          ) : (
            <div className="flex items-center justify-between">
              {note.notebookTitle ? (
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${LABEL_COLORS.blue.default}`}
                >
                  <span className="mr-1">📓</span>
                  {note.notebookTitle}
                </span>
              ) : (
                <span className="text-sm text-gray-400 italic">
                  Aucun carnet
                </span>
              )}
              <button
                onClick={() => setIsEditingNotebook(true)}
                className="p-1 text-gray-400 hover:text-blue-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title={
                  note.notebookTitle
                    ? "Changer de carnet"
                    : "Ajouter à un carnet"
                }
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
            </div>
          )}
        </div>

        <div className="mb-3">
          {isEditingLabels ? (
            <div className="space-y-2">
              <LabelSelector
                selectedLabelIds={note.labels?.map((l) => l.id) || []}
                onLabelsChange={handleLabelAdd}
                size="sm"
                placeholder="Ajouter des labels..."
                maxSelections={10}
                creatable
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsEditingLabels(false)}
                  className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              {note.labels && note.labels.length > 0 ? (
                <LabelList
                  labels={note.labels}
                  removable
                  onRemove={handleLabelRemove}
                  size="sm"
                  maxDisplay={4}
                />
              ) : (
                <span className="text-sm text-gray-400 italic">
                  Aucun label
                </span>
              )}
              <button
                onClick={() => setIsEditingLabels(true)}
                className="p-1 text-gray-400 hover:text-teal-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="Gérer les labels"
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
            </div>
          )}
        </div>

        <p className="text-gray-600 mb-3 line-clamp-3 text-sm leading-relaxed">
          {note.content || "Aucun contenu..."}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <span>{formattedDate}</span>
            {(note.commentCount ?? 0) > 0 && (
              <span className="flex items-center">
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                {note.commentCount}
              </span>
            )}
          </div>

          {note.updatedAt !== note.createdAt && (
            <span className="text-amber-600">Modifiée</span>
          )}
        </div>
      </div>
      <ConfirmationComponent />
    </div>
  );
  if (variant === "compact") {
    return renderCompactCard();
  }

  return renderDefaultCard();
};

export default NoteCard;
