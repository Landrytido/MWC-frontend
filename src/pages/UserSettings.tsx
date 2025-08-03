import React, { useState, useEffect } from "react";
import { useAuth } from "../features/auth";
import Layout from "../shared/components/layout/Layout";
import { useApiService } from "../components/services/apiService";

const UserSettings: React.FC = () => {
  const { state, updateUser } = useAuth();
  const api = useApiService();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });

  useEffect(() => {
    if (state.user) {
      setFirstName(state.user.firstName || "");
      setLastName(state.user.lastName || "");
      setEmail(state.user.email || "");
    }
  }, [state.user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", content: "" });

    try {
      const updatedUser = await api.user.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      updateUser(updatedUser);

      setMessage({
        type: "success",
        content: "Vos informations ont été mises à jour avec succès !",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      setMessage({
        type: "error",
        content:
          "Une erreur est survenue lors de la mise à jour de vos informations.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">
            Paramètres du compte
          </h1>

          {message.content && (
            <div
              className={`mb-6 p-4 rounded-md ${
                message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message.content}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-medium text-gray-700 mb-4">
              Informations personnelles
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Prénom
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nom
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  L'email ne peut pas être modifié pour des raisons de sécurité.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Enregistrement...
                  </div>
                ) : (
                  "Enregistrer les modifications"
                )}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-medium text-gray-700 mb-4">
              Informations du compte
            </h2>

            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Statut du compte :
                </span>
                <span
                  className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    state.user?.enabled
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {state.user?.enabled ? "Actif" : "Inactif"}
                </span>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-600">
                  Email vérifié :
                </span>
                <span
                  className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    state.user?.emailVerified
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {state.user?.emailVerified ? "Vérifié" : "Non vérifié"}
                </span>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-600">
                  Membre depuis :
                </span>
                <span className="ml-2 text-sm text-gray-700">
                  {state.user?.createdAt
                    ? new Date(state.user.createdAt).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )
                    : "Non disponible"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserSettings;
