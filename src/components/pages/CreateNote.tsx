// 🔄 MISE À JOUR: components/pages/CreateNote.tsx
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../layout/Layout";
import NoteForm from "../forms/NoteForm";
import { useApiService } from "../services/apiService";
import { CreateNoteForm } from "../types";

const CreateNote: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const api = useApiService();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Récupérer les paramètres par défaut depuis l'URL
  const defaultNotebookId = searchParams.get("notebookId");
  const defaultLabelIds =
    searchParams.get("labelIds")?.split(",").filter(Boolean) || [];

  const handleSubmit = async (noteData: CreateNoteForm) => {
    setIsLoading(true);
    setError("");

    try {
      await api.notes.create(noteData);
      navigate("/dashboard");
    } catch (err) {
      console.error("Erreur lors de la création de la note:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la création de la note"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="hover:text-gray-700 transition-colors"
            >
              Dashboard
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
            <span className="text-gray-700 font-medium">Nouvelle note</span>
          </nav>

          <NoteForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
            error={error}
            defaultNotebookId={
              defaultNotebookId ? parseInt(defaultNotebookId) : null
            }
            defaultLabelIds={defaultLabelIds}
          />
        </div>
      </div>
    </Layout>
  );
};

export default CreateNote;
