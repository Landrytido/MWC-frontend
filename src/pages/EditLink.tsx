import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../shared/components/layout/Layout";
import { useApiService } from "../components/services/apiService";
import { useConfirmation } from "../shared/hooks/useConfirmation";

const EditLink: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const api = useApiService();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const { confirm } = useConfirmation();

  useEffect(() => {
    const fetchLink = async () => {
      if (!id) return;

      try {
        const link = await api.links.getById(parseInt(id));
        setUrl(link.url);
        setTitle(link.title);
        setDescription(link.description || "");
      } catch (err) {
        console.error("Erreur lors de la récupération du lien:", err);
        setError("Impossible de récupérer le lien demandé");
      } finally {
        setIsFetching(false);
      }
    };

    fetchLink();
  }, [api.links, id]);

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    if (!url.trim()) {
      setError("L'URL est requise");
      return;
    }

    if (!validateUrl(url)) {
      setError("Veuillez entrer une URL valide (incluant http:// ou https://)");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await api.links.update(parseInt(id), {
        url,
        title: title || new URL(url).hostname,
        description,
      });
      navigate("/dashboard?tab=links");
    } catch (err) {
      console.error("Erreur lors de la mise à jour du lien:", err);
      setError("Une erreur est survenue lors de la mise à jour du lien");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <p className="text-gray-600">Chargement du lien...</p>
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
            Modifier le lien
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
                  htmlFor="url"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  URL
                </label>
                <input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

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
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard?tab=links")}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                  Annuler
                </button>
                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={async () => {
                      const confirmed = await confirm({
                        title: "Supprimer le lien",
                        message:
                          "Êtes-vous sûr de vouloir supprimer ce lien ? Cette action est irréversible.",
                        confirmText: "Supprimer",
                        cancelText: "Annuler",
                        variant: "danger",
                      });

                      if (!confirmed) return;

                      try {
                        await api.links.delete(parseInt(id || "0"));
                        navigate("/dashboard?tab=links");
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
    </Layout>
  );
};

export default EditLink;
