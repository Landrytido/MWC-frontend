import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import {
  authService,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../services/authService";
import { User } from "../types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: User }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "UPDATE_USER"; payload: User };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "AUTH_ERROR":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "AUTH_LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  getToken: () => string | null;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const checkAuth = () => {
      const user = authService.getUser();
      const isAuthenticated = authService.isAuthenticated();

      if (isAuthenticated && user) {
        dispatch({ type: "AUTH_SUCCESS", payload: user });
      } else {
        dispatch({ type: "AUTH_LOGOUT" });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    dispatch({ type: "AUTH_START" });
    try {
      const response: AuthResponse = await authService.login(credentials);
      dispatch({ type: "AUTH_SUCCESS", payload: response.user });
    } catch (error) {
      console.log("🔍 Erreur catchée dans AuthContext:", error); // 👈 AJOUTEZ ÇA
      const message =
        error instanceof Error ? error.message : "Erreur de connexion";
      dispatch({ type: "AUTH_ERROR", payload: message });
      throw error;
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    dispatch({ type: "AUTH_START" });
    try {
      const response: AuthResponse = await authService.register(userData);
      dispatch({ type: "AUTH_SUCCESS", payload: response.user });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur lors de l'inscription";
      dispatch({ type: "AUTH_ERROR", payload: message });
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch({ type: "AUTH_LOGOUT" });
    }
  };

  const clearError = (): void => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const getToken = (): string | null => {
    return authService.getToken();
  };
  const updateUser = (user: User): void => {
    dispatch({ type: "UPDATE_USER", payload: user });
    localStorage.setItem("user", JSON.stringify(user));
  };

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    clearError,
    getToken,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
