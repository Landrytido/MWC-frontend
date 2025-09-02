import { useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";
import { User, LoginRequest, RegisterRequest, AuthState } from "../types";

interface UseAuthReturn {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  getToken: () => string | null;
  updateUser: (user: User) => void;
  checkTokenValidity: () => Promise<boolean>;
}

export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const checkAuth = () => {
      const user = authService.getUser();
      const isAuthenticated = authService.isAuthenticated();

      setState((prev) => ({
        ...prev,
        user: isAuthenticated ? user : null,
        isAuthenticated,
        isLoading: false,
      }));
    };

    checkAuth();
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await authService.login(credentials);
        setState((prev) => ({
          ...prev,
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erreur de connexion";
        setState((prev) => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: message,
        }));
        throw error;
      }
    },
    []
  );

  const register = useCallback(
    async (userData: RegisterRequest): Promise<void> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await authService.register(userData);
        setState((prev) => ({
          ...prev,
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erreur lors de l'inscription";
        setState((prev) => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: message,
        }));
        throw error;
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setState((prev) => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }));
    }
  }, []);

  const clearError = useCallback((): void => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const getToken = useCallback((): string | null => {
    return authService.getToken();
  }, []);

  const updateUser = useCallback((user: User): void => {
    authService.updateUser(user);
    setState((prev) => ({ ...prev, user }));
  }, []);

  const checkTokenValidity = useCallback(async (): Promise<boolean> => {
    try {
      const token = authService.getToken();
      if (!token) return false;

      // Effectuer une requête de test pour vérifier la validité du token
      await authService.authenticatedFetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:8080/api"
        }/auth/verify`,
        {
          method: "GET",
        }
      );

      return true;
    } catch (error) {
      console.error("Token invalide:", error);

      // Si le token est invalide, mettre à jour l'état
      setState((prev) => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        error: "Session expirée",
      }));

      return false;
    }
  }, []);

  // Écouter les événements de rafraîchissement de token
  useEffect(() => {
    const handleTokenRefreshed = () => {
      // Revérifier l'authentification après un rafraîchissement
      const user = authService.getUser();
      const isAuthenticated = authService.isAuthenticated();

      setState((prev) => ({
        ...prev,
        user: isAuthenticated ? user : null,
        isAuthenticated,
        error: null,
      }));
    };

    window.addEventListener("tokenRefreshed", handleTokenRefreshed);

    return () => {
      window.removeEventListener("tokenRefreshed", handleTokenRefreshed);
    };
  }, []);

  return {
    state,
    login,
    register,
    logout,
    clearError,
    getToken,
    updateUser,
    checkTokenValidity,
  };
};
