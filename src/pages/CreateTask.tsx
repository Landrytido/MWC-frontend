import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../shared/components/layout/Layout";
import TaskCreationForm from "../features/tasks/components/TaskCreationForm";
import { CreateTaskForm } from "../features/tasks/types";
import { useTasks } from "../features/tasks/hooks/useTasks";
import { useConfirmation } from "../shared/hooks/useConfirmation";

const CreateTask: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createTask } = useTasks();
  const { confirm, ConfirmationComponent } = useConfirmation();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const defaultDate = searchParams.get("date");
  const returnTo = searchParams.get("returnTo");

  const getReturnUrl = () => {
    switch (returnTo) {
      case "calendar":
        return "/dashboard/calendar";
      case "tasks":
        return "/dashboard?tab=tasks";
      default:
        return "/dashboard?tab=tasks";
    }
  };

  const handleSubmit = async (taskData: CreateTaskForm) => {
    setIsLoading(true);
    setError("");

    try {
      await createTask(taskData);
      navigate(getReturnUrl());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la création de la tâche"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(getReturnUrl());
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <button
              onClick={() => navigate(getReturnUrl())}
              className="hover:text-gray-700 transition-colors"
            >
              {returnTo === "calendar" ? "Calendrier" : "Dashboard"}
            </button>
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
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-gray-700 font-medium">Nouvelle tâche</span>
          </nav>

          <TaskCreationForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
            error={error}
            confirm={confirm}
            defaultDate={defaultDate || undefined}
          />
        </div>
      </div>

      {/* Composant de confirmation centralisé */}
      <ConfirmationComponent />
    </Layout>
  );
};

export default CreateTask;
