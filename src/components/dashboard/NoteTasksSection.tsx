// src/components/dashboard/NoteTasksSection.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNoteTasks } from "../contexts/AppContext";
import { useApiService } from "../services/apiService";
import NoteTaskCard from "./NoteTaskCard";
import { useConfirmation } from "./useConfirmation";

interface NoteTasksSectionProps {
  noteId: number;
  className?: string;
}

const NoteTasksSection: React.FC<NoteTasksSectionProps> = ({
  noteId,
  className = "",
}) => {
  const { getTasksByNoteId, loading } = useNoteTasks();
  const api = useApiService();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { confirm, ConfirmationComponent } = useConfirmation();

  const tasks = getTasksByNoteId(noteId);

  useEffect(() => {
    api.noteTasks.getByNoteId(noteId);
  }, [noteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTaskTitle.trim()) {
      setError("Le titre de la tâche ne peut pas être vide");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await api.noteTasks.create(noteId, newTaskTitle.trim());
      setNewTaskTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = useCallback(
    async (taskId: number, title: string) => {
      try {
        await api.noteTasks.update(taskId, { title });
      } catch (error) {
        console.error("Error updating note task:", error);
      }
    },
    [api.noteTasks]
  );

  const handleDelete = useCallback(
    async (taskId: number) => {
      const confirmed = await confirm({
        title: "Supprimer la tâche",
        message:
          "Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.",
        confirmText: "Supprimer",
        cancelText: "Annuler",
        variant: "danger",
      });

      if (!confirmed) return;

      try {
        await api.noteTasks.delete(taskId);
      } catch (error) {
        console.error("Error deleting note task:", error);
      }
    },
    [confirm, api.noteTasks]
  );

  const handleToggle = useCallback(
    async (taskId: number) => {
      try {
        await api.noteTasks.toggle(taskId);
      } catch (error) {
        console.error("Error toggling note task:", error);
      }
    },
    [api.noteTasks]
  );

  const handleCreateSubtask = useCallback(
    async (parentId: number, title: string) => {
      try {
        await api.noteTasks.createSubtask(parentId, title);
      } catch (error) {
        console.error("Error creating subtask:", error);
      }
    },
    [api.noteTasks]
  );

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-medium text-gray-800">
            ✅ Tâches ({completedTasks}/{totalTasks})
          </h3>

          {totalTasks > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Formulaire d'ajout de tâche */}
      <div className="mb-6">
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Ajouter une nouvelle tâche..."
              className="flex-1 p-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newTaskTitle.trim()}
              className="px-4 py-3 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              )}
            </button>
          </div>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </form>
      </div>

      {/* Liste des tâches */}
      <div className="space-y-3">
        {loading.isLoading ? (
          <div className="text-center py-4">
            <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-500">
              Chargement des tâches...
            </p>
          </div>
        ) : tasks.length > 0 ? (
          <div className="group">
            {tasks.map((task) => (
              <NoteTaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
                onCreateSubtask={handleCreateSubtask}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-2">✅</div>
            <p>Aucune tâche pour cette note.</p>
            <p className="text-sm">Ajoutez votre première tâche ci-dessus !</p>
          </div>
        )}
      </div>

      {/* Statistiques détaillées si il y a des tâches */}
      {totalTasks > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-800">
                {totalTasks}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {completedTasks}
              </div>
              <div className="text-xs text-gray-500">Terminées</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {totalTasks - completedTasks}
              </div>
              <div className="text-xs text-gray-500">En cours</div>
            </div>
          </div>
        </div>
      )}
      <ConfirmationComponent />
    </div>
  );
};

export default NoteTasksSection;
