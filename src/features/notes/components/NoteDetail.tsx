import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../../components/layout/Layout";
import CommentsSection from "./CommentsSection";
import { useNotes } from "../hooks/useNotes";
import { Note } from "../types";
import { useConfirmation } from "../../../shared/hooks/useConfirmation";

const NoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { notes, deleteNote, getNoteById } = useNotes();
  const { confirm } = useConfirmation();

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("ID de note manquant");
      setIsLoading(false);
      return;
    }

    const noteId = parseInt(id);
    const foundNote = getNoteById(noteId);

    if (foundNote) {
      setNote(foundNote);
      setError("");
    } else {
      setError("Note introuvable");
    }

    setIsLoading(false);
  }, [id, getNoteById, notes]);

  const handleEdit = () => {
    if (note) {
      navigate(`/dashboard/notes/${note.id}`);
    }
  };

  const handleDelete = async () => {
    if (!note) return;

    const confirmed = await confirm({
      title: "Supprimer la note",
      message:
        "Êtes-vous sûr de vouloir supprimer cette note ? Cette action est irréversible.",
      confirmText: "Supprimer",
      cancelText: "Annuler",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      await deleteNote(note.id);
      navigate("/dashboard");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-teal-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Chargement de la note...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !note) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Note introuvable
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "Cette note n'existe pas"}
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Retour
            </button>

            <div className="flex space-x-3">
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Modifier
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Supprimer
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                {note.notebookTitle && (
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    {note.notebookTitle}
                  </span>
                )}
                <span>
                  Créée le{" "}
                  {new Date(note.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {(note.commentCount ?? 0) > 0 && (
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    {note.commentCount}
                  </span>
                )}
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {note.title}
            </h1>

            {note.labels && note.labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {note.labels.map((label) => (
                  <span
                    key={label.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-teal-100 text-teal-800"
                  >
                    <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                    {label.name}
                  </span>
                ))}
              </div>
            )}

            <div className="prose max-w-none">
              <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <CommentsSection noteId={note.id} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NoteDetail;
