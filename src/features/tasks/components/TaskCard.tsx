import React from "react";
import { Task, getPriorityConfig } from "../types";
import { formatDateForDisplay } from "../utils";
import {
  Pencil,
  Trash2,
  Clock,
  Check,
  Calendar,
  AlertTriangle,
  CalendarDays,
  Timer,
  RotateCcw,
} from "lucide-react";

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
    ? formatDateForDisplay(task.dueDate)
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
        return {
          icon: <Check className="w-3 h-3 mr-1" />,
          text: "Terminée",
          color: "text-green-600",
          show: true,
        };
      case "overdue":
        return {
          icon: <AlertTriangle className="w-3 h-3 mr-1" />,
          text: "En retard",
          color: "text-red-600 font-medium",
          show: true,
        };
      case "today":
        return {
          icon: <Calendar className="w-3 h-3 mr-1" />,
          text: "Aujourd'hui",
          color: "text-blue-600",
          show: showScheduleInfo,
        };
      case "tomorrow":
        return {
          icon: <CalendarDays className="w-3 h-3 mr-1" />,
          text: "Demain",
          color: "text-purple-600",
          show: showScheduleInfo,
        };
      case "upcoming":
        return {
          icon: <Timer className="w-3 h-3 mr-1" />,
          text: "À venir",
          color: "text-gray-600",
          show: showScheduleInfo,
        };
      default:
        return { icon: null, text: "", color: "", show: false };
    }
  };

  const statusDisplay = getStatusDisplay();

  const PriorityIcon = priorityConfig?.icon;

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
            {task.completed && <Check className="w-3 h-3" />}
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

              {priorityConfig && PriorityIcon && (
                <span
                  className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${getPriorityBadgeColor()}`}
                >
                  <PriorityIcon className="w-3 h-3 mr-1" />
                  {priorityConfig.label}
                </span>
              )}

              {statusDisplay.show && (
                <span
                  className={`text-xs flex items-center ${statusDisplay.color}`}
                >
                  {statusDisplay.icon}
                  {statusDisplay.text}
                </span>
              )}

              {task.carriedOver && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reportée
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

            {formattedDueDate && (
              <div className="flex items-center space-x-4 mt-3 text-xs">
                <span
                  className={`flex items-center ${
                    status === "overdue"
                      ? "text-red-600 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Prévue: {formattedDueDate}
                </span>

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
            <Pencil className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Supprimer la tâche"
          >
            <Trash2 className="w-4 h-4" />
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
