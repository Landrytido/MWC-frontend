import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../shared/components/layout/Layout";
import { useLinks } from "../features/links"; // ✅ Nouveau
import { useConfirmation } from "../shared/hooks/useConfirmation";

const EditLink: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { links, updateLink, deleteLink } = useLinks(); // ✅ Remplace useApiService

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { confirm, ConfirmationComponent } = useConfirmation();

  // ✅ Trouve le lien dans le state au lieu d'un appel API
  const link = links.find((l) => l.id === parseInt(id || "0"));

  useEffect(() => {
    if (link) {
      setUrl(link.url);
      setTitle(link.title);
      setDescription(link.description || "");
    } else if (id) {
      // Si le lien n'est pas en cache, rediriger ou afficher erreur
      setError("Impossible de récupérer le lien demandé");
    }
  }, [link, id]);

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
      // ✅ Utilise le hook de la feature
      await updateLink(parseInt(id), {
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

  const handleDelete = async () => {
    if (!id) return;

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
      // ✅ Utilise le hook de la feature
      await deleteLink(parseInt(id));
      navigate("/dashboard?tab=links");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setError("Erreur lors de la suppression du lien");
    }
  };

  if (!link && !error) {
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
                    onClick={handleDelete}
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

export default EditLink;
