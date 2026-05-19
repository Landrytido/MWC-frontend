import React, { useState } from "react";
import { Note } from "../types";
import { LABEL_COLORS } from "../../labels";
import { LabelList } from "../../labels";
import NotebookSelector from "../../notebooks/components/NotebookSelector";
import LabelSelector from "../../labels/components/LabelSelector";
import { useNotes } from "../hooks/useNotes";
import { useConfirmation } from "../../../shared/hooks/useConfirmation";
import { Pencil, Trash2, Plus, MessageCircle, Notebook } from "lucide-react";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
  onView?: (note: Note) => void;
  onUpdate?: () => void;
  showActions?: boolean;
  variant?: "default" | "compact" | "detailed";
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onView,
  onUpdate,
  showActions = true,
  variant = "default",
}) => {
  const { moveToNotebook, addLabel, removeLabel } = useNotes();
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
      await moveToNotebook(note.id, notebookId);
      setIsEditingNotebook(false);
      onUpdate?.();
    } catch {
      // Erreur silencieuse
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
        await addLabel(note.id, labelId);
      }
      setIsEditingLabels(false);
      onUpdate?.();
    } catch {
      // Erreur silencieuse
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
      await removeLabel(note.id, labelId);
      onUpdate?.();
    } catch {
      // Erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isButton = target.tagName === "BUTTON" || target.closest("button");
    const isInput =
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT";

    if (!isButton && !isInput && onView) {
      onView(note);
    }
  };

  const renderCompactCard = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow group"></div>
  );

  const renderDefaultCard = () => (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow group relative cursor-pointer"
      onClick={handleCardClick}
    >
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
          <h3 className="font-semibold text-gray-800 flex-1 pr-2">
            {note.title}
          </h3>

          {showActions && (
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(note);
                }}
                className="p-2 text-gray-400 hover:text-teal-500 rounded-md transition-colors"
                title="Modifier la note"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note.id);
                }}
                className="p-2 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                title="Supprimer la note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="mb-3">
          {isEditingNotebook ? (
            <div onClick={(e) => e.stopPropagation()}>
              <NotebookSelector
                selectedNotebookId={note.notebookId}
                onNotebookChange={handleNotebookChange}
                includeNone
                size="sm"
                placeholder="Choisir un carnet..."
              />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              {note.notebookTitle ? (
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${LABEL_COLORS.blue.default}`}
                >
                  <Notebook className="w-3 h-3 mr-1" />
                  {note.notebookTitle}
                </span>
              ) : (
                <span className="text-sm text-gray-400 italic">
                  Aucun carnet
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingNotebook(true);
                }}
                className="p-1 text-gray-400 hover:text-blue-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title={
                  note.notebookTitle
                    ? "Changer de carnet"
                    : "Ajouter à un carnet"
                }
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="mb-3">
          {isEditingLabels ? (
            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingLabels(false);
                  }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingLabels(true);
                }}
                className="p-1 text-gray-400 hover:text-teal-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="Gérer les labels"
              >
                <Plus className="w-3 h-3" />
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
                <MessageCircle className="w-3 h-3 mr-1" />
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
