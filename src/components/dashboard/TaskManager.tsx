import React, { useState, useEffect, useCallback } from "react";
import { useTasks } from "../contexts/AppContext";
import { useApiService } from "../services/apiService";
import TaskCard from "./TaskCard";
import TaskCreationForm from "./TaskCreationForm";
import { Task, CreateTaskForm, TaskPriority, PRIORITY_LABELS } from "../types";

interface TaskManagerProps {
  className?: string;
}

const TaskManager: React.FC<TaskManagerProps> = ({ className = "" }) => {
  const { tasks, pendingTasks, completedTasks, overdueTasks, loading } =
    useTasks();
  const api = useApiService();

  // États pour la gestion des tâches
  const [activeFilter, setActiveFilter] = useState<
    "all" | "pending" | "completed" | "overdue" | TaskPriority
  >("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState("");

  // Charger les tâches et statistiques au montage
  useEffect(() => {
    if (tasks.length === 0 && !loading.isLoading) {
      api.tasks.getAll();
      loadStatistics();
    }
  }, [tasks.length, loading.isLoading]);

  const loadStatistics = async () => {
    try {
      const taskStats = await api.tasks.getStatistics();
      setStats(taskStats);
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingTask(null);
    setError("");
  };

  const handleSubmit = async (taskData: CreateTaskForm) => {
    try {
      if (editingTask) {
        await api.tasks.update(editingTask.id, taskData);
      } else {
        await api.tasks.create(taskData);
      }
      resetForm();
      loadStatistics();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setIsCreating(true);
  }, []);

  const handleDelete = useCallback(
    async (id: number) => {
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
        return;
      }

      try {
        await api.tasks.delete(id);
        loadStatistics();
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
        loadStatistics();
      } catch (error) {
        console.error("Error toggling task:", error);
      }
    },
    [api.tasks]
  );

  // Gestion de la sélection
  const handleSelectTask = (taskId: number, selected: boolean) => {
    if (selected) {
      setSelectedTasks((prev) => [...prev, taskId]);
    } else {
      setSelectedTasks((prev) => prev.filter((id) => id !== taskId));
    }
  };

  const handleSelectAll = () => {
    const allTaskIds = getFilteredTasks().map((task) => task.id);
    setSelectedTasks(allTaskIds);
  };

  const handleDeselectAll = () => {
    setSelectedTasks([]);
  };

  // Filtrage des tâches
  const getFilteredTasks = () => {
    let filtered = tasks;

    // Filtre par statut/type
    switch (activeFilter) {
      case "pending":
        filtered = pendingTasks;
        break;
      case "completed":
        filtered = completedTasks;
        break;
      case "overdue":
        filtered = overdueTasks;
        break;
      case TaskPriority.LOW:
      case TaskPriority.MEDIUM:
      case TaskPriority.HIGH:
        filtered = tasks.filter((task) => task.priority === activeFilter);
        break;
      default:
        filtered = tasks;
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return "bg-red-100 text-red-800 border-red-200";
      case TaskPriority.MEDIUM:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case TaskPriority.LOW:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header avec statistiques */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">📋 Mes Tâches</h2>
          {stats && (
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span>Total: {stats.totalTasks}</span>
              <span>En cours: {stats.pendingTasks}</span>
              <span>Terminées: {stats.completedTasks}</span>
              <span>Productivité: {stats.productivityScore}%</span>
            </div>
          )}
        </div>
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

      {/* Barre de recherche */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher par titre, description ou tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Filtres étendus */}
      <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto">
        {/* Filtres de base */}
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
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
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

        {/* Filtres par statut */}
        <div className="border-l border-gray-300 pl-2 ml-2">
          {Object.values(TaskStatus).map((status) => (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`mr-2 mb-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeFilter === status
                  ? getStatusColor(status)
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Filtres par priorité */}
        <div className="border-l border-gray-300 pl-2 ml-2">
          {Object.values(TaskPriority).map((priority) => (
            <button
              key={priority}
              onClick={() => setActiveFilter(priority)}
              className={`mr-2 mb-2 px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                activeFilter === priority
                  ? getPriorityColor(priority)
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200"
              }`}
            >
              {priority}
            </button>
          ))}
        </div>
      </div>

      {/* Actions en masse */}
      {selectedTasks.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              {selectedTasks.length} tâche(s) sélectionnée(s)
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkStatusUpdate(TaskStatus.COMPLETED)}
                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
              >
                Marquer comme terminées
              </button>
              <button
                onClick={() => handleBulkStatusUpdate(TaskStatus.IN_PROGRESS)}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                En cours
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              >
                Supprimer
              </button>
              <button
                onClick={handleDeselectAll}
                className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Désélectionner
              </button>
            </div>
          </div>
        </div>
      )}

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

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Titre */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre *
              </label>
              <input
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

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Description optionnelle"
              />
            </div>

            {/* Priorité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as TaskPriority,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {Object.values(TaskPriority).map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as TaskStatus,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {Object.values(TaskStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Date d'échéance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'échéance
              </label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Rappel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rappel
              </label>
              <input
                type="datetime-local"
                value={formData.reminderDate}
                onChange={(e) =>
                  setFormData({ ...formData, reminderDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Estimation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temps estimé (minutes)
              </label>
              <input
                type="number"
                value={formData.estimatedMinutes || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedMinutes: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="60"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (séparés par des virgules)
              </label>
              <input
                type="text"
                value={formData.tags?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tags: e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter((tag) => tag),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="urgent, travail, projet"
              />
            </div>

            {/* Actions */}
            <div className="md:col-span-2 flex justify-end space-x-3 pt-4">
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

      {/* Actions de sélection */}
      {filteredTasks.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Tout sélectionner
            </button>
            {selectedTasks.length > 0 && (
              <button
                onClick={handleDeselectAll}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Tout désélectionner
              </button>
            )}
          </div>
          <span className="text-sm text-gray-500">
            {filteredTasks.length} tâche(s) trouvée(s)
          </span>
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
              isSelected={selectedTasks.includes(task.id)}
              onSelect={(selected) => handleSelectTask(task.id, selected)}
              showSelection={true}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? (
              <div>
                <p>Aucune tâche ne correspond à votre recherche.</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-teal-600 hover:text-teal-800 underline"
                >
                  Effacer la recherche
                </button>
              </div>
            ) : (
              getNoTasksMessage()
            )}
          </div>
        )}
      </div>
    </div>
  );

  function getNoTasksMessage() {
    switch (activeFilter) {
      case "pending":
        return "Aucune tâche en attente. Bravo ! 🎉";
      case "completed":
        return "Aucune tâche terminée pour le moment.";
      case "overdue":
        return "Aucune tâche en retard. Excellent ! 👏";
      case "all":
        return "Aucune tâche créée. Commencez par en ajouter une !";
      default:
        return `Aucune tâche avec le filtre "${activeFilter}".`;
    }
  }
};

export default TaskManager;
