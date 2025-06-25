import React, { useState, useEffect } from "react";
import { useNotebooks, useLabels } from "../contexts/AppContext";
import { useApiService } from "../services/apiService";
import NotebookSelector from "../common/NotebookSelector";
import LabelSelector from "../common/LabelSelector";
import { Note, CreateNoteForm, Notebook } from "../types";

interface NoteFormProps {
  note?: Note; // Pour l'édition
  onSubmit: (noteData: CreateNoteForm) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
  defaultNotebookId?: number | null;
  defaultLabelIds?: string[];
}

const NoteForm: React.FC<NoteFormProps> = ({
  note,
  onSubmit,
  onCancel,
  isLoading = false,
  error = "",
  defaultNotebookId = null,
  defaultLabelIds = [],
}) => {
  const { notebooks } = useNotebooks();
  const { labels } = useLabels();
  const api = useApiService();

  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    notebookId: number | null;
    labelIds: string[];
  }>({
    title: note?.title || "",
    content: note?.content || "",
    notebookId: note?.notebookId || defaultNotebookId,
    labelIds: note?.labels?.map((l) => l.id) || defaultLabelIds,
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Marquer le formulaire comme modifié
  useEffect(() => {
    if (note) {
      const hasChanges =
        formData.title !== note.title ||
        formData.content !== note.content ||
        formData.notebookId !== (note.notebookId || null) ||
        JSON.stringify(formData.labelIds.sort()) !==
          JSON.stringify((note.labels?.map((l) => l.id) || []).sort());
      setIsDirty(hasChanges);
    } else {
      setIsDirty(
        formData.title.trim() !== "" || formData.content.trim() !== ""
      );
    }
  }, [formData, note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return;
    }

    const noteData: CreateNoteForm = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      notebookId: formData.notebookId,
      labelIds: formData.labelIds,
    };

    await onSubmit(noteData);
  };

  const handleNotebookCreate = async (title: string): Promise<Notebook> => {
    return await api.notebooks.create({ title });
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmDiscard = window.confirm(
        "Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?"
      );
      if (!confirmDiscard) return;
    }
    onCancel();
  };

  const renderPreview = () => {
    return (
      <div className="prose max-w-none">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {formData.title || "Titre de la note"}
        </h1>

        {formData.notebookId && (
          <div className="mb-4">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              📓 {notebooks.find((nb) => nb.id === formData.notebookId)?.title}
            </span>
          </div>
        )}

        {formData.labelIds.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {formData.labelIds.map((labelId) => {
              const label = labels.find((l) => l.id === labelId);
              return label ? (
                <span
                  key={labelId}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800"
                >
                  <span className="w-2 h-2 rounded-full bg-teal-500 mr-1"></span>
                  {label.name}
                </span>
              ) : null;
            })}
          </div>
        )}

        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
          {formData.content || "Contenu de la note..."}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header avec onglets */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            {note ? "Modifier la note" : "Créer une nouvelle note"}
          </h2>

          <div className="flex items-center space-x-4">
            {/* Indicateur de modifications */}
            {isDirty && (
              <span className="text-sm text-amber-600 flex items-center">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                Non sauvegardé
              </span>
            )}

            {/* Onglets de mode */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setPreviewMode(false)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  !previewMode
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                ✏️ Édition
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode(true)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  previewMode
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                👁️ Aperçu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu du formulaire */}
      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        {previewMode ? (
          renderPreview()
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Titre *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Titre de la note"
                required
                disabled={isLoading}
              />
            </div>

            {/* Sélecteur de carnet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carnet
              </label>
              <NotebookSelector
                selectedNotebookId={formData.notebookId}
                onNotebookChange={(notebookId) =>
                  setFormData((prev) => ({ ...prev, notebookId }))
                }
                includeNone
                disabled={isLoading}
                placeholder="Choisir un carnet (optionnel)"
                allowCreate
                onCreateNotebook={handleNotebookCreate}
              />
              <p className="mt-1 text-xs text-gray-500">
                Organisez vos notes en les plaçant dans des carnets thématiques
              </p>
            </div>

            {/* Sélecteur de labels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Labels
              </label>
              <LabelSelector
                selectedLabelIds={formData.labelIds}
                onLabelsChange={(labelIds) =>
                  setFormData((prev) => ({ ...prev, labelIds }))
                }
                disabled={isLoading}
                placeholder="Ajouter des labels pour catégoriser..."
                maxSelections={10}
                creatable
                showCount
              />
              <p className="mt-1 text-xs text-gray-500">
                Utilisez les labels pour retrouver facilement vos notes
              </p>
            </div>

            {/* Contenu */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Contenu
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y"
                placeholder="Écrivez votre note ici..."
                disabled={isLoading}
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>Utilisez l'aperçu pour voir le rendu final</span>
                <span>{formData.content.length} caractères</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {note && (
                  <span>
                    Créée le{" "}
                    {new Date(note.createdAt).toLocaleDateString("fr-FR")}
                    {note.updatedAt !== note.createdAt && (
                      <span className="ml-2">
                        • Modifiée le{" "}
                        {new Date(note.updatedAt).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                  </span>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.title.trim()}
                  className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {note ? "Modification..." : "Création..."}
                    </div>
                  ) : note ? (
                    "Mettre à jour"
                  ) : (
                    "Créer la note"
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default NoteForm;
