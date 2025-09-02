import React, { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTokenRefresh } from "../hooks/useTokenRefresh";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { state, checkTokenValidity } = useAuth();
  const { checkTokenStatus } = useTokenRefresh();
  const location = useLocation();

  // Vérification périodique du token pour les routes protégées
  useEffect(() => {
    if (state.isAuthenticated) {
      const interval = setInterval(async () => {
        const isValid = await checkTokenStatus();
        if (!isValid) {
          console.warn("Token invalide détecté, vérification approfondie...");
          await checkTokenValidity();
        }
      }, 2 * 60 * 1000); // Vérification toutes les 2 minutes

      return () => clearInterval(interval);
    }
  }, [state.isAuthenticated, checkTokenStatus, checkTokenValidity]);

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-teal-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
