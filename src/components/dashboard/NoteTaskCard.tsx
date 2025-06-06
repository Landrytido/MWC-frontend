// src/components/dashboard/NoteTaskCard.tsx
import React, { useState } from "react";
import { NoteTask } from "../types/index";

interface NoteTaskCardProps {
  task: NoteTask;
  onEdit: (id: number, title: string) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
  onCreateSubtask: (parentId: number, title: string) => void;
  level?: number; // Pour l'indentation des sous-tâches
}

const NoteTaskCard: React.FC<NoteTaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onToggle,
  onCreateSubtask,
  level = 0,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const indentClass = level > 0 ? `ml-${level * 6}` : "";
  const isParentTask = !task.parentId;
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onEdit(task.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };

  const handleCreateSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onCreateSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle("");
      setIsAddingSubtask(false);
    }
  };

  const getProgressInfo = () => {
    if (!hasSubtasks) return null;

    const completed = task.completedSubtasks ?? 0;
    const total = task.totalSubtasks ?? 0;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return { completed, total, percentage };
  };

  const progress = getProgressInfo();

  return (
    <div className={`${indentClass}`}>
      {/* Tâche principale */}
      <div
        className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
          task.completed
            ? "bg-green-50 border-green-200"
            : "bg-white border-gray-200 hover:bg-gray-50"
        }`}
      >
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 hover:border-green-500"
          }`}
        >
          {task.completed && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Contenu de la tâche */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") handleCancelEdit();
                }}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Sauver
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${
                    task.completed
                      ? "line-through text-gray-500"
                      : "text-gray-800"
                  }`}
                >
                  {task.title}
                </span>

                {/* Actions */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isParentTask && (
                    <button
                      onClick={() => setIsAddingSubtask(true)}
                      className="p-1 text-gray-400 hover:text-blue-500 rounded"
                      title="Ajouter une sous-tâche"
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
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-400 hover:text-blue-500 rounded"
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
                    onClick={() => onDelete(task.id)}
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
              </div>

              {/* Barre de progression pour les tâches parent avec sous-tâches */}
              {progress && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Progression</span>
                    <span>
                      {progress.completed}/{progress.total} sous-tâches
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Formulaire d'ajout de sous-tâche */}
      {isAddingSubtask && (
        <div className="ml-8 mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="space-y-2">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Titre de la sous-tâche"
              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === "Enter") handleCreateSubtask();
                if (e.key === "Escape") setIsAddingSubtask(false);
              }}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleCreateSubtask}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Ajouter
              </button>
              <button
                onClick={() => setIsAddingSubtask(false)}
                className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sous-tâches */}
      {hasSubtasks && (
        <div className="mt-2 space-y-2">
          {task.subtasks!.map((subtask) => (
            <NoteTaskCard
              key={subtask.id}
              task={subtask}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
              onCreateSubtask={onCreateSubtask}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteTaskCard;
