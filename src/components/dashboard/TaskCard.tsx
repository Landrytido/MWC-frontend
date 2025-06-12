// src/components/dashboard/TaskCard.tsx - Version corrigée
import React from "react";
import { Task, PRIORITY_LABELS, getTaskStatus } from "../types";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
  showScheduleInfo?: boolean;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  showSelection?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onToggle,
  showScheduleInfo = false,
  isSelected = false,
  onSelect,
  showSelection = false,
}) => {
  const status = getTaskStatus(task);
  const priorityConfig = PRIORITY_LABELS[task.priority];

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const formattedScheduledDate = task.scheduledDate
    ? new Date(task.scheduledDate).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
      })
    : null;

  const getStatusDisplay = () => {
    switch (status) {
      case "completed":
        return { text: "✅ Terminée", color: "text-green-600 bg-green-50" };
      case "overdue":
        return { text: "⚠️ En retard", color: "text-red-600 bg-red-50" };
      case "today":
        return { text: "📅 Aujourd'hui", color: "text-blue-600 bg-blue-50" };
      case "tomorrow":
        return { text: "🗓️ Demain", color: "text-purple-600 bg-purple-50" };
      default:
        return { text: "📝 À faire", color: "text-gray-600 bg-gray-50" };
    }
  };

  const statusDisplay = getStatusDisplay();

  const getPriorityBorderColor = () => {
    switch (task.priority) {
      case 3:
        return "border-red-500"; // Haute
      case 2:
        return "border-blue-500"; // Moyenne
      case 1:
        return "border-gray-500"; // Basse
      default:
        return "border-gray-300";
    }
  };

  return (
    <div
      className={`bg-white p-4 rounded-md shadow-md hover:shadow-lg transition-shadow border-l-4 ${getPriorityBorderColor()} ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start space-x-3 flex-1">
          {/* Checkbox de sélection */}
          {showSelection && onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          )}

          {/* Checkbox pour toggle */}
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

          <div className="flex-1">
            {/* Titre et priorité */}
            <div className="flex items-center space-x-2 mb-1">
              <h3
                className={`font-semibold ${
                  task.completed
                    ? "line-through text-gray-500"
                    : "text-gray-800"
                }`}
              >
                {task.title}
              </h3>

              {/* Badge de priorité */}
              <span
                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                  task.priority === 3
                    ? "bg-red-100 text-red-800"
                    : task.priority === 2
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {priorityConfig.icon} {priorityConfig.label}
              </span>

              {/* Badge "Reportée" si carriedOver */}
              {task.carriedOver && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                  📅 Reportée
                </span>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <p
                className={`text-sm mt-1 ${
                  task.completed ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => onEdit(task)}
            className="text-gray-400 hover:text-blue-500 transition-colors"
            title="Modifier la tâche"
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
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Supprimer la tâche"
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

      {/* Informations de statut et dates */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-3">
          {/* Statut */}
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}
          >
            {statusDisplay.text}
          </span>

          {/* Infos de planification (seulement dans l'onglet "Toutes") */}
          {showScheduleInfo && task.scheduledDate && (
            <span className="text-xs text-gray-500">
              📅 Planifiée: {formattedScheduledDate}
            </span>
          )}
        </div>

        {/* Date d'échéance */}
        {formattedDueDate && (
          <span
            className={`text-xs ${
              status === "overdue"
                ? "text-red-600 font-medium"
                : "text-gray-500"
            }`}
          >
            ⏰ {formattedDueDate}
          </span>
        )}
      </div>

      {/* Date de création et infos supplémentaires */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <span>
          Créée le {new Date(task.createdAt).toLocaleDateString("fr-FR")}
        </span>

        {/* Afficher la date originale si reportée */}
        {task.carriedOver && task.originalDate && (
          <span className="text-orange-600">
            Initialement:{" "}
            {new Date(task.originalDate).toLocaleDateString("fr-FR")}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
