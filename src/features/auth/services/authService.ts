// features/auth/services/authService.ts
import { LoginRequest, RegisterRequest, AuthResponse, User } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

class AuthService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private user: User | null = null;

  constructor() {
    this.token = localStorage.getItem("token");
    this.refreshToken = localStorage.getItem("refreshToken");
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        this.user = JSON.parse(savedUser) as User;
      } catch (e) {
        console.error("Error parsing saved user:", e);
        this.clearStorage();
      }
    }
  }

  private clearStorage() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    this.token = null;
    this.refreshToken = null;
    this.user = null;
  }

  private saveAuthData(authResponse: AuthResponse) {
    this.token = authResponse.token;
    this.refreshToken = authResponse.refreshToken;
    this.user = authResponse.user;

    localStorage.setItem("token", authResponse.token);
    localStorage.setItem("refreshToken", authResponse.refreshToken);
    localStorage.setItem("user", JSON.stringify(authResponse.user));
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.message || errorData?.error || "Erreur de connexion";
      throw new Error(errorMessage);
    }

    const authResponse: AuthResponse = await response.json();
    this.saveAuthData(authResponse);
    return authResponse;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || errorData?.error || "Erreur de connexion"
      );
    }

    const authResponse: AuthResponse = await response.json();
    this.saveAuthData(authResponse);
    return authResponse;
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (!response.ok) {
      this.clearStorage();
      throw new Error("Unable to refresh token");
    }

    const authResponse: AuthResponse = await response.json();
    this.saveAuthData(authResponse);
    return authResponse.token;
  }

  async logout(): Promise<void> {
    if (this.token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }
    this.clearStorage();
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  async authenticatedFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    if (!this.token) {
      throw new Error("No authentication token");
    }

    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (response.status === 401 && this.refreshToken) {
      try {
        await this.refreshAccessToken();
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${this.token}`,
          },
        });
      } catch {
        this.clearStorage();
        throw new Error("Session expired, please login again");
      }
    }

    return response;
  }

  updateUser(user: User): void {
    this.user = user;
    localStorage.setItem("user", JSON.stringify(user));
  }
}

export const authService = new AuthService();
