import React, { useState, useEffect, useCallback } from "react";
import { useTasks } from "../contexts/AppContext";
import { useApiService } from "../services/apiService";
import TaskCard from "./TaskCard";
import TaskCreationForm from "./TaskCreationForm";
import MonthlyTaskReport from "./MonthlyTaskReport";
import { Task, CreateTaskForm, TaskPriority, PRIORITY_LABELS } from "../types";

interface TaskManagerProps {
  className?: string;
}

type FilterType =
  | "all"
  | "pending"
  | "overdue"
  | "today"
  | "tomorrow"
  | "completed"
  | "report";

const TaskManager: React.FC<TaskManagerProps> = ({ className = "" }) => {
  const { tasks, pendingTasks, completedTasks, overdueTasks, loading } =
    useTasks();
  const api = useApiService();

  const [activeFilter, setActiveFilter] = useState<FilterType>("pending");
  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState("");

  // Charger les tâches au montage
  useEffect(() => {
    if (tasks.length === 0 && !loading.isLoading) {
      api.tasks.getAll();
    }
  }, [tasks.length, loading.isLoading, api.tasks]);

  // Calculer les tâches pour aujourd'hui et demain
  const getTodayTasks = () => {
    const today = new Date().toISOString().split("T")[0];
    return tasks.filter(
      (task) => !task.completed && task.scheduledDate === today
    );
  };

  const getTomorrowTasks = () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    return tasks.filter(
      (task) => !task.completed && task.scheduledDate === tomorrow
    );
  };

  const todayTasks = getTodayTasks();
  const tomorrowTasks = getTomorrowTasks();

  const getFilteredTasks = () => {
    switch (activeFilter) {
      case "pending":
        return pendingTasks;
      case "completed":
        return completedTasks;
      case "overdue":
        return overdueTasks;
      case "today":
        return todayTasks;
      case "tomorrow":
        return tomorrowTasks;
      case "all":
        return tasks;
      case "report":
        return []; // Pas de tâches à afficher pour l'onglet rapport
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  const handleSubmit = async (taskData: CreateTaskForm) => {
    try {
      if (editingTask) {
        await api.tasks.update(editingTask.id, taskData);
      } else {
        await api.tasks.create(taskData);
      }
      setIsCreating(false);
      setEditingTask(null);
      setError("");
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

  const resetForm = () => {
    setIsCreating(false);
    setEditingTask(null);
    setError("");
  };

  // ✅ Configuration des filtres avec l'ajout du rapport mensuel
  const filters = [
    {
      key: "pending",
      label: "À faire",
      count: pendingTasks.length,
      icon: "🔹",
      hasCount: true,
    },
    {
      key: "overdue",
      label: "En retard",
      count: overdueTasks.length,
      icon: "⚠️",
      hasCount: true,
    },
    {
      key: "all",
      label: "Toutes",
      count: tasks.length,
      icon: "📋",
      hasCount: true,
    },
    {
      key: "today",
      label: "Aujourd'hui",
      count: todayTasks.length,
      icon: "📅",
      hasCount: true,
    },
    {
      key: "tomorrow",
      label: "Demain",
      count: tomorrowTasks.length,
      icon: "🗓️",
      hasCount: true,
    },
    {
      key: "completed",
      label: "Terminées",
      count: completedTasks.length,
      icon: "✅",
      hasCount: true,
    },
    { key: "report", label: "Rapport", count: 0, icon: "📊", hasCount: false }, // ← Nouveau filtre sans compteur
  ];

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">📋 Mes Tâches</h2>
        {/* Masquer le bouton "Nouvelle tâche" sur l'onglet rapport */}
        {activeFilter !== "report" && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center text-sm font-medium text-teal-500 hover:text-teal-600 transition-colors"
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
            + Nouvelle tâche
          </button>
        )}
      </div>

      {/* Filtres horizontaux - Style similaire à votre image */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key as FilterType)}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === filter.key
                ? "bg-teal-500 text-white shadow-md"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="mr-2">{filter.icon}</span>
            {filter.label}
            {filter.hasCount && (
              <span
                className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                  activeFilter === filter.key
                    ? "bg-white bg-opacity-20 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                {filter.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenu conditionnel selon l'onglet sélectionné */}
      {activeFilter === "report" ? (
        // ✅ Affichage du rapport mensuel
        <div className="mt-4">
          <MonthlyTaskReport tasks={tasks} />
        </div>
      ) : (
        // ✅ Affichage normal des tâches
        <>
          {/* Formulaire de création/édition */}
          {isCreating && (
            <div className="mb-6">
              <TaskCreationForm
                onSubmit={handleSubmit}
                onCancel={resetForm}
                error={error}
                editingTask={editingTask ?? undefined}
              />
            </div>
          )}

          {/* Liste des tâches */}
          <div className="space-y-3">
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
                  showScheduleInfo={activeFilter === "all"}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">{getEmptyIcon()}</div>
                <p className="text-lg font-medium mb-2">{getEmptyMessage()}</p>
                <p className="text-sm">{getEmptySubMessage()}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  function getEmptyIcon() {
    switch (activeFilter) {
      case "pending":
        return "🎯";
      case "completed":
        return "🎉";
      case "overdue":
        return "⏰";
      case "today":
        return "📅";
      case "tomorrow":
        return "🗓️";
      default:
        return "📋";
    }
  }

  function getEmptyMessage() {
    switch (activeFilter) {
      case "pending":
        return "Aucune tâche en attente";
      case "completed":
        return "Aucune tâche terminée";
      case "overdue":
        return "Aucune tâche en retard";
      case "today":
        return "Aucune tâche pour aujourd'hui";
      case "tomorrow":
        return "Aucune tâche pour demain";
      case "all":
        return "Aucune tâche créée";
      default:
        return "Aucune tâche trouvée";
    }
  }

  function getEmptySubMessage() {
    switch (activeFilter) {
      case "pending":
        return "Bravo ! Toutes vos tâches sont terminées.";
      case "completed":
        return "Commencez à accomplir vos tâches pour voir vos succès ici.";
      case "overdue":
        return "Excellent ! Vous êtes à jour sur toutes vos tâches.";
      case "today":
        return "Profitez de cette journée libre !";
      case "tomorrow":
        return "Rien de prévu pour demain pour l'instant.";
      case "all":
        return "Cliquez sur '+ Nouvelle tâche' pour commencer.";
      default:
        return "";
    }
  }
};

export default TaskManager;
