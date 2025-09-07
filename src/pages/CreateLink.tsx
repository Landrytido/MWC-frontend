import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../shared/components/layout/Layout";
import { useLinks } from "../features/links";

const CreateLink: React.FC = () => {
  const navigate = useNavigate();
  const { createLink } = useLinks();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
      await createLink({
        url,
        title: title || new URL(url).hostname,
        description,
      });
      navigate("/dashboard?tab=links");
    } catch (err) {
      console.error("Erreur lors de la création du lien:", err);
      setError("Une erreur est survenue lors de la création du lien");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTitleFromUrl = async () => {
    if (!url || !validateUrl(url)) return;

    try {
      setTitle("Chargement du titre...");
      setTimeout(() => {
        setTitle(new URL(url).hostname);
      }, 1000);
    } catch (err) {
      console.error("Erreur lors de la récupération du titre:", err);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Sauvegarder un nouveau lien
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
                <div className="flex">
                  <input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onBlur={fetchTitleFromUrl}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="https://exemple.com"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Entrez l'URL complète (incluant http:// ou https://)
                </p>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Titre (optionnel)
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Titre du lien"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description (optionnelle)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Décrivez brièvement ce lien"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard?tab=links")}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                >
                  {isLoading ? "Sauvegarde en cours..." : "Sauvegarder le lien"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateLink;
