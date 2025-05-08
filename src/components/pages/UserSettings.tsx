import React, { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import Layout from "../layout/Layout";

const UserSettings: React.FC = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });

  // Charger les données utilisateur actuelles
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.primaryEmailAddress?.emailAddress || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", content: "" });

    try {
      // Mettre à jour les informations via Clerk
      if (user) {
        await user.update({
          firstName,
          lastName,
        });

        // Ici, vous pourriez également synchroniser avec votre backend
        // const token = await getToken();
        // await fetch('votre-api/utilisateurs/update', {
        //   method: 'PUT',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${token}`
        //   },
        //   body: JSON.stringify({ firstName, lastName })
        // });

        setMessage({
          type: "success",
          content: "Vos informations ont été mises à jour avec succès !",
        });
      }
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  L'email ne peut pas être modifié directement. Contactez le
                  support pour changer votre adresse email.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
              >
                {isLoading
                  ? "Enregistrement..."
                  : "Enregistrer les modifications"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-medium text-gray-700 mb-4">Sécurité</h2>

            <div className="mb-4">
              <p className="text-gray-600 mb-2">Changer votre mot de passe</p>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                onClick={() => {
                  // Rediriger vers la page de changement de mot de passe de Clerk
                  // ou ouvrir un modal pour le changement de mot de passe
                }}
              >
                Modifier le mot de passe
              </button>
            </div>

            <div>
              <p className="text-gray-600 mb-2">Sessions actives</p>
              <p className="text-sm text-gray-500">
                Consultez et gérez vos sessions actives sur différents
                appareils.
              </p>
              <button
                className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                onClick={() => {
                  // Implémenter la fonctionnalité pour afficher et gérer les sessions
                }}
              >
                Gérer les sessions
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserSettings;
