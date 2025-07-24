import { useState, useEffect, useCallback } from "react";
import { Task, CreateTaskForm, UpdateTaskForm } from "../types";
import { tasksApi } from "../api";

interface UseTasksReturn {
  tasks: Task[];
  pendingTasks: Task[];
  completedTasks: Task[];
  overdueTasks: Task[];
  todayTasks: Task[];
  tomorrowTasks: Task[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTask: (task: CreateTaskForm) => Promise<Task>;
  updateTask: (id: number, task: UpdateTaskForm) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  toggleTask: (id: number) => Promise<Task>;
  searchTasks: (keyword: string) => Promise<Task[]>;
}

export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tâches filtrées (calculées)
  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const overdueTasks = tasks.filter(
    (task) =>
      !task.completed && task.dueDate && new Date(task.dueDate) < new Date()
  );

  const todayTasks = tasks.filter((task) => {
    if (task.completed) return false;
    const today = new Date().toISOString().split("T")[0];
    return task.scheduledDate === today;
  });

  const tomorrowTasks = tasks.filter((task) => {
    if (task.completed) return false;
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    return task.scheduledDate === tomorrow;
  });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksApi.getAll();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(
    async (task: CreateTaskForm): Promise<Task> => {
      try {
        const newTask = await tasksApi.create(task);
        setTasks((prev) => [newTask, ...prev]);
        return newTask;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors de la création";
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  const updateTask = useCallback(
    async (id: number, task: UpdateTaskForm): Promise<Task> => {
      try {
        const updatedTask = await tasksApi.update(id, task);
        setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
        return updatedTask;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors de la mise à jour";
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  const deleteTask = useCallback(async (id: number): Promise<void> => {
    try {
      await tasksApi.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erreur lors de la suppression";
      setError(errorMsg);
      throw err;
    }
  }, []);

  const toggleTask = useCallback(async (id: number): Promise<Task> => {
    try {
      const updatedTask = await tasksApi.toggle(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
      return updatedTask;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erreur lors du toggle";
      setError(errorMsg);
      throw err;
    }
  }, []);

  const searchTasks = useCallback(async (keyword: string): Promise<Task[]> => {
    try {
      const results = await tasksApi.search(keyword);
      return results;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erreur lors de la recherche";
      setError(errorMsg);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    pendingTasks,
    completedTasks,
    overdueTasks,
    todayTasks,
    tomorrowTasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    searchTasks,
  };
};
