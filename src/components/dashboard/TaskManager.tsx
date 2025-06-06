import React, { useState, useEffect, useCallback } from "react";
import { useTasks } from "../contexts/AppContext";
import { useApiService } from "../services/apiService";
import TaskCard from "./TaskCard";
import { Task, CreateTaskForm } from "../types";

interface TaskManagerProps {
  className?: string;
}

const TaskManager: React.FC<TaskManagerProps> = ({ className = "" }) => {
  const { tasks, pendingTasks, completedTasks, overdueTasks, loading } =
    useTasks();
  const api = useApiService();

  const [activeFilter, setActiveFilter] = useState<
    "all" | "pending" | "completed" | "overdue"
  >("pending");
  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState<CreateTaskForm>({
    title: "",
    description: "",
    dueDate: "",
  });

  // Charger les tâches au montage
  useEffect(() => {
    if (tasks.length === 0 && !loading.isLoading) {
      api.tasks.getAll();
    }
  }, [tasks.length, loading.isLoading]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      dueDate: "",
    });
    setIsCreating(false);
    setEditingTask(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Le titre est requis");
      return;
    }

    try {
      const taskData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        dueDate: formData.dueDate || undefined,
      };

      if (editingTask) {
        await api.tasks.update(editingTask.id, taskData);
      } else {
        await api.tasks.create(taskData);
      }

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 16) : "", // Format datetime-local
    });
    setIsCreating(true);
  }, []);

  const handleDelete = useCallback(
    async (id: number) => {
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
        return;
      }

      try {
        await api.tasks.delete(id);
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    },
    [api.tasks]
  );

  const handleToggle = useCallback(
    async (id: number) => {
      try {
        await api.tasks.toggle(id);
      } catch (error) {
        console.error("Error toggling task:", error);
      }
    },
    [api.tasks]
  );

  const getFilteredTasks = () => {
    switch (activeFilter) {
      case "pending":
        return pendingTasks;
      case "completed":
        return completedTasks;
      case "overdue":
        return overdueTasks;
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">📋 Mes Tâches</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center text-sm font-medium text-teal-500 hover:text-teal-600"
        >
          <svg
            className="w-5 h-5 mr-1"
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
          Nouvelle tâche
        </button>
      </div>

      {/* Filtres */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {[
          {
            key: "pending",
            label: "À faire",
            count: pendingTasks.length,
            icon: "📝",
          },
          {
            key: "overdue",
            label: "En retard",
            count: overdueTasks.length,
            icon: "⚠️",
          },
          {
            key: "completed",
            label: "Terminées",
            count: completedTasks.length,
            icon: "✅",
          },
          { key: "all", label: "Toutes", count: tasks.length, icon: "📋" },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key as any)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === filter.key
                ? "bg-teal-100 text-teal-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span className="mr-2">{filter.icon}</span>
            {filter.label}
            <span className="ml-2 bg-white px-2 py-1 rounded-full text-xs">
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Formulaire de création/édition */}
      {isCreating && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-4">
            {editingTask ? "Modifier la tâche" : "Nouvelle tâche"}
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Titre de la tâche"
                required
              />
            </div>

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
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Description optionnelle"
              />
            </div>

            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date d'échéance
              </label>
              <input
                id="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
              >
                {editingTask ? "Mettre à jour" : "Créer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des tâches */}
      <div className="space-y-4">
        {loading.isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-500">Chargement des tâches...</p>
          </div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            {activeFilter === "pending" &&
              "Aucune tâche en attente. Bravo ! 🎉"}
            {activeFilter === "completed" &&
              "Aucune tâche terminée pour le moment."}
            {activeFilter === "overdue" &&
              "Aucune tâche en retard. Excellent ! 👏"}
            {activeFilter === "all" &&
              "Aucune tâche créée. Commencez par en ajouter une !"}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManager;
