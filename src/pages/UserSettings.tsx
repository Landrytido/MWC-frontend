import React, { useState, useEffect } from "react";
import { useAuth, useUser } from "../features/auth"; // ✅ Nouveau
import Layout from "../shared/components/layout/Layout";

const UserSettings: React.FC = () => {
  const { state, updateUser } = useAuth();
  const { updateProfile, changePassword, loading } = useUser(); // ✅ Remplace useApiService

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordModalMessage, setPasswordModalMessage] = useState({
    type: "",
    content: "",
  });
  const [message, setMessage] = useState({ type: "", content: "" });

  useEffect(() => {
    if (state.user) {
      setFirstName(state.user.firstName || "");
      setLastName(state.user.lastName || "");
      setEmail(state.user.email || "");
    }
  }, [state.user]);

  useEffect(() => {
    if (!message.content) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setMessage({ type: "", content: "" });
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [message]);

  useEffect(() => {
    if (!passwordModalMessage.content) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPasswordModalMessage({ type: "", content: "" });
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [passwordModalMessage]);

  const handleOpenEditModal = () => {
    setFirstName(state.user?.firstName || "");
    setLastName(state.user?.lastName || "");
    setEmail(state.user?.email || "");
    setMessage({ type: "", content: "" });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleOpenPasswordModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordModalMessage({ type: "", content: "" });
    setMessage({ type: "", content: "" });
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", content: "" });

    try {
      // ✅ Utilise le hook de la feature auth
      const updatedUser = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      updateUser(updatedUser);

      setMessage({
        type: "success",
        content: "Vos informations ont été mises à jour avec succès !",
      });
      setIsEditModalOpen(false);
    } catch {
      setMessage({
        type: "error",
        content:
          "Une erreur est survenue lors de la mise à jour de vos informations.",
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordModalMessage({ type: "", content: "" });

    if (
      !currentPassword.trim() ||
      !newPassword.trim() ||
      !confirmPassword.trim()
    ) {
      setPasswordModalMessage({
        type: "error",
        content: "Tous les champs du mot de passe sont obligatoires.",
      });
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordModalMessage({
        type: "error",
        content: "Le nouveau mot de passe doit être différent de l'ancien.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordModalMessage({
        type: "error",
        content: "La confirmation du nouveau mot de passe ne correspond pas.",
      });
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setMessage({
        type: "success",
        content: "Votre mot de passe a été mis à jour avec succès !",
      });
      setIsPasswordModalOpen(false);
    } catch (err) {
      setPasswordModalMessage({
        type: "error",
        content:
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors de la mise à jour de votre mot de passe.",
      });
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

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Prénom
                </p>
                <p className="text-gray-800">{firstName || "Non renseigné"}</p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Nom
                </p>
                <p className="text-gray-800">{lastName || "Non renseigné"}</p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Email
                </p>
                <p className="text-gray-800">{email || "Non renseigné"}</p>
                <p className="text-xs text-gray-500 mt-1">
                  L'email ne peut pas être modifié pour des raisons de sécurité.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Modifier mes informations
                </button>

                <button
                  type="button"
                  onClick={handleOpenPasswordModal}
                  className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-700 transition-colors"
                >
                  Modifier mon mot de passe
                </button>
              </div>
            </div>
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
                        },
                      )
                    : "Non disponible"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fermer"
            onClick={handleCloseEditModal}
            className="absolute inset-0 bg-black/50"
          />

          <div className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-medium text-gray-700">
                Modifier mes informations
              </h2>
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Fermer la fenêtre"
              >
                ✕
              </button>
            </div>

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
                  disabled={loading}
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
                  disabled={loading}
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

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  disabled={loading}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Enregistrement...
                    </div>
                  ) : (
                    "Enregistrer"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fermer"
            onClick={handleClosePasswordModal}
            className="absolute inset-0 bg-black/50"
          />

          <div className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-medium text-gray-700">
                Modifier mon mot de passe
              </h2>
              <button
                type="button"
                onClick={handleClosePasswordModal}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Fermer la fenêtre"
              >
                ✕
              </button>
            </div>

            {passwordModalMessage.content && (
              <div
                className={`mb-4 p-3 rounded-md text-sm ${
                  passwordModalMessage.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {passwordModalMessage.content}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mot de passe actuel
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nouveau mot de passe
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirmation du nouveau mot de passe
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  disabled={loading}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Mise à jour...
                    </div>
                  ) : (
                    "Modifier le mot de passe"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UserSettings;
