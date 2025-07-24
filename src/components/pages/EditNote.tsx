import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../layout/Layout";
import { useApiService } from "../services/apiService";
import { useConfirmation } from "../../shared/hooks/useConfirmation";

const EditNote: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const api = useApiService();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const { confirm, ConfirmationComponent } = useConfirmation();

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) return;

      try {
        const note = await api.notes.getById(parseInt(id));
        setTitle(note.title);
        setContent(note.content);
      } catch (err) {
        console.error("Erreur lors de la récupération de la note:", err);
        setError("Impossible de récupérer la note demandée");
      } finally {
        setIsFetching(false);
      }
    };

    fetchNote();
  }, [api.notes, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;
    if (!title.trim()) {
      setError("Le titre est requis");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await api.notes.update(parseInt(id), { title, content });
      navigate("/dashboard");
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la note:", err);
      setError("Une erreur est survenue lors de la mise à jour de la note");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <p className="text-gray-600">Chargement de la note...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Modifier la note
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Titre
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contenu
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                  Annuler
                </button>
                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={async () => {
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
                        api.notes.delete(parseInt(id || "0"));
                        navigate("/dashboard");
                      } catch (error) {
                        console.error("Erreur lors de la suppression:", error);
                      }
                    }}
                    className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                  >
                    Supprimer
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                  >
                    {isLoading ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ConfirmationComponent />
    </Layout>
  );
};

export default EditNote;
