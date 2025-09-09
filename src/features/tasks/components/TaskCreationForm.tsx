import React, { useState } from "react";
import {
  CreateTaskForm,
  ScheduleType,
  SCHEDULE_LABELS,
  Task,
  getPriorityConfig,
} from "../types";
import {
  convertDateToEndOfDay,
  extractDateOnly,
  isDateInPast,
  getTodayDateString,
  getTomorrowDateString,
} from "../utils";

interface TaskCreationFormProps {
  onSubmit: (taskData: CreateTaskForm) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
  editingTask?: Task;
  defaultDate?: string;
  confirm?: (config: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
  }) => Promise<boolean>;
}

const TaskCreationForm: React.FC<TaskCreationFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  error = "",
  editingTask,
  defaultDate,
  confirm,
}) => {
  const [formData, setFormData] = useState<CreateTaskForm>({
    title: editingTask?.title || "",
    description: editingTask?.description || "",
    dueDate: editingTask?.dueDate
      ? extractDateOnly(editingTask.dueDate)
      : defaultDate || "",
    priority: editingTask?.priority || 2,
  });

  const [scheduleType, setScheduleType] = useState<ScheduleType>(() => {
    if (editingTask?.dueDate) {
      const today = getTodayDateString();
      const tomorrow = getTomorrowDateString();

      const taskDate = extractDateOnly(editingTask.dueDate);
      if (taskDate === today) return ScheduleType.TODAY;
      if (taskDate === tomorrow) return ScheduleType.TOMORROW;
    }
    return ScheduleType.NONE;
  });

  const handleScheduleTypeChange = (type: ScheduleType) => {
    setScheduleType(type);

    let dueDate = "";
    if (type === ScheduleType.TODAY) {
      // Utiliser la date locale (pas UTC)
      dueDate = getTodayDateString();
    } else if (type === ScheduleType.TOMORROW) {
      // Utiliser la date locale de demain
      dueDate = getTomorrowDateString();
    }

    setFormData((prev) => ({ ...prev, dueDate }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return;

    if (formData.dueDate && isDateInPast(formData.dueDate) && confirm) {
      const confirmed = await confirm({
        title: "Date passée",
        message: "⚠️ Vous créez une tâche pour une date passée. Continuer ?",
        confirmText: "Continuer",
        cancelText: "Modifier",
        variant: "warning",
      });

      if (!confirmed) {
        return;
      }
    }

    const taskData: CreateTaskForm = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      // Convertir la date en fin de journée pour le backend
      dueDate: formData.dueDate
        ? convertDateToEndOfDay(formData.dueDate)
        : undefined,
    };

    await onSubmit(taskData);
  };
  const priorityOptions = [
    { value: 1, config: getPriorityConfig(1) }, // LOW
    { value: 2, config: getPriorityConfig(2) }, // MEDIUM
    { value: 3, config: getPriorityConfig(3) }, // HIGH
  ];

  return (
    <div className="bg-gray-50 p-6 rounded-lg border">
      <h3 className="text-lg font-medium mb-4 text-gray-800">
        {editingTask ? "Modifier la tâche" : "Nouvelle tâche"}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Titre */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Titre de la tâche"
            required
            disabled={isLoading}
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Description optionnelle"
            disabled={isLoading}
          />
        </div>

        {/* Priorité */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priorité *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {priorityOptions.map(({ value, config }) => {
              const isSelected = formData.priority === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, priority: value }))
                  }
                  disabled={isLoading}
                  className={`p-3 text-sm font-medium rounded-md border-2 transition-colors ${
                    isSelected
                      ? value === 3
                        ? "border-red-500 bg-red-50 text-red-700"
                        : value === 2
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-500 bg-gray-50 text-gray-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Planification */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Planification
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(SCHEDULE_LABELS).map(([type, label]) => {
              const isSelected = scheduleType === type;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleScheduleTypeChange(type as ScheduleType)}
                  disabled={isLoading}
                  className={`p-2 text-sm font-medium rounded-md border transition-colors ${
                    isSelected
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date de réalisation (seulement si pas de planification quotidienne) */}
        {scheduleType === ScheduleType.NONE && (
          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date de réalisation (optionnelle)
            </label>
            <input
              id="dueDate"
              type="date"
              value={formData.dueDate || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Laissez vide pour une tâche sans date d'échéance spécifique
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
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
                {editingTask ? "Modification..." : "Création..."}
              </div>
            ) : editingTask ? (
              "Mettre à jour"
            ) : (
              "Créer"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskCreationForm;
