import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface LoginFormProps {
  className?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ className = "" }) => {
  const { state, login, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [state.isAuthenticated, navigate, from]);

  useEffect(() => {
    if (state.error) {
      clearError();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (state.error) {
        clearError();
      }
    };
  }, [clearError, state.error]);

  const handleInputChange = (field: "email" | "password", value: string) => {
    if (state.error) {
      clearError();
    }

    if (field === "email") {
      setEmailAddress(value);
    } else {
      setPassword(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailAddress.trim() || !password.trim()) {
      return;
    }

    try {
      await login({ email: emailAddress, password });
    } catch {
      // Erreur silencieuse
    }
  };

  return (
    <div className={`bg-white shadow-lg rounded-lg p-8 ${className}`}>
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8">
        Connexion
      </h2>

      {state.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Erreur de connexion</span>
          </div>
          <p className="mt-1 text-sm">{state.error}</p>
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
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
            disabled={state.isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="sr-only">
            Mot de passe
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
              disabled={state.isLoading}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={state.isLoading}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? (
                /* Eye-off icon */
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                /* Eye icon */
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="text-sm">
            <a href="#" className="text-teal-500 hover:underline">
              Mot de passe oublié ?
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={state.isLoading || !emailAddress.trim() || !password.trim()}
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
          <Link
            to="/signup"
            className="text-teal-500 hover:underline"
            onClick={() => clearError()}
          >
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
