// src/components/pages/SignIn.tsx (Version mise à jour)
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

const SignIn: React.FC = () => {
  const { state, login, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Récupérer l'URL de redirection depuis l'état de navigation
  const from = location.state?.from?.pathname || "/dashboard";

  // Rediriger si déjà connecté
  useEffect(() => {
    if (state.isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [state.isAuthenticated, navigate, from]);

  // Effacer les erreurs au changement de champs
  useEffect(() => {
    if (state.error) {
      clearError();
    }
  }, [emailAddress, password, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailAddress.trim() || !password.trim()) {
      return;
    }

    try {
      await login({ email: emailAddress, password });
      // La redirection sera gérée par l'useEffect ci-dessus
    } catch (error) {
      // L'erreur est déjà gérée par le contexte
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Form container */}
            <div className="bg-white shadow-lg rounded-lg p-8">
              <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8">
                Connexion
              </h2>

              {state.error && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md">
                  {state.error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="emailAddress" className="sr-only">
                    Email
                  </label>
                  <input
                    id="emailAddress"
                    type="email"
                    placeholder="Email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    required
                    disabled={state.isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="password" className="sr-only">
                    Mot de passe
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={state.isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-teal-500 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Se souvenir de moi
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="text-teal-500 hover:underline">
                      Mot de passe oublié ?
                    </a>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    state.isLoading || !emailAddress.trim() || !password.trim()
                  }
                  className="w-full py-3 px-4 bg-teal-400 hover:bg-teal-500 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Connexion en cours...
                    </div>
                  ) : (
                    "Se connecter"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Vous n'avez pas de compte ?{" "}
                  <Link to="/signup" className="text-teal-500 hover:underline">
                    S'inscrire
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignIn;
