import React from "react";
import { Task, getPriorityConfig } from "../types";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
  showScheduleInfo?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onToggle,
  showScheduleInfo = false,
}) => {
  const priorityConfig = getPriorityConfig(task.priority);

  const status = task.status;

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const formattedScheduledDate = task.scheduledDate
    ? new Date(task.scheduledDate).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      })
    : null;

  const getPriorityBadgeColor = () => {
    switch (task.priority) {
      case 3:
        return "bg-red-50 text-red-700 border border-red-200";
      case 2:
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case 1:
        return "bg-gray-50 text-gray-700 border border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case "completed":
        return { text: "✓ Terminée", color: "text-green-600", show: true };
      case "overdue":
        return {
          text: "⚠️ En retard",
          color: "text-red-600 font-medium",
          show: true,
        };
      case "today":
        return {
          text: "📅 Aujourd'hui",
          color: "text-blue-600",
          show: showScheduleInfo,
        };
      case "tomorrow":
        return {
          text: "🗓️ Demain",
          color: "text-purple-600",
          show: showScheduleInfo,
        };
      case "upcoming":
        return {
          text: "⏰ À venir",
          color: "text-gray-600",
          show: showScheduleInfo,
        };
      default:
        return { text: "", color: "", show: false };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div
      className={`group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
        task.completed ? "bg-gray-50 opacity-90" : "hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={() => onToggle(task.id)}
            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.completed
                ? "bg-green-500 border-green-500 text-white"
                : "border-gray-300 hover:border-green-400 hover:bg-green-50"
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

          <div className="flex-1 min-w-0">
            <div className="flex items-start flex-wrap gap-2 mb-2">
              <h3
                className={`font-medium text-base leading-tight ${
                  task.completed
                    ? "line-through text-gray-500"
                    : "text-gray-900"
                }`}
              >
                {task.title}
              </h3>

              {priorityConfig && (
                <span
                  className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${getPriorityBadgeColor()}`}
                >
                  {priorityConfig.icon} {priorityConfig.label}
                </span>
              )}

              {statusDisplay.show && (
                <span className={`text-xs ${statusDisplay.color}`}>
                  {statusDisplay.text}
                </span>
              )}

              {task.carriedOver && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                  📅 Reportée
                </span>
              )}
            </div>

            {task.description && (
              <p
                className={`text-sm mt-2 leading-relaxed ${
                  task.completed ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {task.description}
              </p>
            )}

            {(formattedDueDate ||
              (showScheduleInfo && formattedScheduledDate)) && (
              <div className="flex items-center space-x-4 mt-3 text-xs">
                {formattedDueDate && (
                  <span
                    className={`flex items-center ${
                      status === "overdue"
                        ? "text-red-600 font-medium"
                        : "text-gray-500"
                    }`}
                  >
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Échéance: {formattedDueDate}
                  </span>
                )}

                {showScheduleInfo && formattedScheduledDate && (
                  <span className="flex items-center text-gray-500">
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Planifiée: {formattedScheduledDate}
                  </span>
                )}

                {task.carriedOver && task.originalDate && (
                  <span className="text-orange-600">
                    Initialement:{" "}
                    {new Date(task.originalDate).toLocaleDateString("fr-FR")}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
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
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
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

      <div className="mt-3 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            Créée le {new Date(task.createdAt).toLocaleDateString("fr-FR")}
          </span>
          {task.completedAt && (
            <span>
              Terminée le{" "}
              {new Date(task.completedAt).toLocaleDateString("fr-FR")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
