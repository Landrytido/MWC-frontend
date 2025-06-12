// src/components/dashboard/TaskCreationForm.tsx
import React, { useState } from "react";
import {
  CreateTaskForm,
  TaskPriority,
  ScheduleType,
  PRIORITY_LABELS,
  SCHEDULE_LABELS,
} from "../types";

interface TaskCreationFormProps {
  onSubmit: (taskData: CreateTaskForm) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
  editingTask?: any;
}

const TaskCreationForm: React.FC<TaskCreationFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  error = "",
  editingTask,
}) => {
  const [formData, setFormData] = useState<CreateTaskForm>({
    title: editingTask?.title || "",
    description: editingTask?.description || "",
    dueDate: editingTask?.dueDate ? editingTask.dueDate.slice(0, 16) : "",
    scheduledDate: editingTask?.scheduledDate || "",
    priority: editingTask?.priority || TaskPriority.MEDIUM,
  });

  const [scheduleType, setScheduleType] = useState<ScheduleType>(() => {
    if (editingTask?.scheduledDate) {
      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      if (editingTask.scheduledDate === today) return ScheduleType.TODAY;
      if (editingTask.scheduledDate === tomorrow) return ScheduleType.TOMORROW;
    }
    return ScheduleType.NONE;
  });

  const handleScheduleTypeChange = (type: ScheduleType) => {
    setScheduleType(type);

    let scheduledDate = "";
    if (type === ScheduleType.TODAY) {
      scheduledDate = new Date().toISOString().split("T")[0];
    } else if (type === ScheduleType.TOMORROW) {
      scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
    }

    setFormData((prev) => ({ ...prev, scheduledDate }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return;

    const taskData: CreateTaskForm = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      dueDate: formData.dueDate || undefined,
      scheduledDate: formData.scheduledDate || undefined,
    };

    await onSubmit(taskData);
  };

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
            value={formData.description}
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
            {Object.entries(PRIORITY_LABELS).map(([priority, config]) => {
              const priorityNum = parseInt(priority);
              const isSelected = formData.priority === priorityNum;

              return (
                <button
                  key={priority}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, priority: priorityNum }))
                  }
                  disabled={isLoading}
                  className={`p-3 text-sm font-medium rounded-md border-2 transition-colors ${
                    isSelected
                      ? `border-${config.color}-500 bg-${config.color}-50 text-${config.color}-700`
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

        {/* Date d'échéance (seulement si pas de planification quotidienne) */}
        {scheduleType === ScheduleType.NONE && (
          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date d'échéance (optionnelle)
            </label>
            <input
              id="dueDate"
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Laissez vide si vous voulez juste une tâche à faire sans date
              limite
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
