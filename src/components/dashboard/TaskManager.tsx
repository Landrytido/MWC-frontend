import React, { useState, useEffect, useCallback } from "react";
import { useTasks } from "../contexts/AppContext";
import { useApiService } from "../services/apiService";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import MonthlyTaskReport from "./MonthlyTaskReport";
import { Task, CreateTaskForm } from "../types";
import { useConfirmation } from "./useConfirmation";

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
  const TASKS_PER_PAGE = 3;
  const { tasks, pendingTasks, completedTasks, overdueTasks, loading } =
    useTasks();
  const api = useApiService();
  const { confirm, ConfirmationComponent } = useConfirmation();

  const [activeFilter, setActiveFilter] = useState<FilterType>("pending");
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ États pour le modal
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        return [];
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  // ✅ Gestion du modal et des tâches
  const handleOpenModal = (task?: Task) => {
    setEditingTask(task || null);
    setIsModalOpen(true);
    setError("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
      handleCloseModal(); // ✅ Fermer le modal après succès
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      // ✅ Ne pas fermer le modal en cas d'erreur
    }
  };

  const handleEdit = useCallback((task: Task) => {
    handleOpenModal(task);
  }, []);

  const handleDelete = useCallback(
    async (id: number) => {
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
        await api.tasks.delete(id);
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    },
    [confirm, api.tasks]
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

  const filters = [
    // {
    //   key: "pending",
    //   label: "À faire",
    //   count: pendingTasks.length,
    //   icon: "🔹",
    //   hasCount: true,
    // },
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
    { key: "report", label: "Rapport", count: 0, icon: "📊", hasCount: false },
  ];

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">📋 Mes Tâches</h2>
          {/* Bouton "Nouvelle tâche" qui ouvre le modal */}
          {activeFilter !== "report" && (
            <button
              onClick={() => handleOpenModal()}
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
              Nouvelle tâche
            </button>
          )}
        </div>

        {/* Filtres horizontaux */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => {
                setActiveFilter(filter.key as FilterType);
                setCurrentPage(1);
              }}
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

        {/* Contenu conditionnel */}
        {activeFilter === "report" ? (
          <div className="mt-4">
            <MonthlyTaskReport tasks={tasks} />
          </div>
        ) : (
          <>
            {/* Liste des tâches - Plus de formulaire inline ! */}
            <div className="space-y-3">
              {loading.isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin"></div>
                  <p className="mt-2 text-gray-500">Chargement des tâches...</p>
                </div>
              ) : filteredTasks.length > 0 ? (
                filteredTasks
                  .slice(
                    (currentPage - 1) * TASKS_PER_PAGE,
                    currentPage * TASKS_PER_PAGE
                  )
                  .map((task) => (
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
                  <p className="text-lg font-medium mb-2">
                    {getEmptyMessage()}
                  </p>
                  <p className="text-sm">{getEmptySubMessage()}</p>
                </div>
              )}
            </div>
            <ConfirmationComponent />
            {/* Pagination */}
            {filteredTasks.length > TASKS_PER_PAGE && (
              <div className="mt-6 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-teal-500 text-white hover:bg-teal-600"
                    }`}
                  >
                    Précédent
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} sur{" "}
                    {Math.ceil(filteredTasks.length / TASKS_PER_PAGE)}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          prev + 1,
                          Math.ceil(filteredTasks.length / TASKS_PER_PAGE)
                        )
                      )
                    }
                    disabled={
                      currentPage ===
                      Math.ceil(filteredTasks.length / TASKS_PER_PAGE)
                    }
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      currentPage ===
                      Math.ceil(filteredTasks.length / TASKS_PER_PAGE)
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-teal-500 text-white hover:bg-teal-600"
                    }`}
                  >
                    Suivant
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>

      {/* ✅ Modal de création/édition */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingTask={editingTask || undefined}
        error={error}
      />
    </>
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
      // case "pending":
      //   return "Aucune tâche en attente";
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
        return "Cliquez sur 'Nouvelle tâche' pour commencer.";
      default:
        return "";
    }
  }
};

export default TaskManager;
