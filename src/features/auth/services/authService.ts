import { LoginRequest, RegisterRequest, AuthResponse, User } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

class AuthService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private user: User | null = null;
  private tokenCheckInterval: number | null = null;
  private tokenRefreshListeners: (() => void)[] = [];

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

    this.startTokenValidation();
  }

  private startTokenValidation() {
    this.tokenCheckInterval = window.setInterval(() => {
      this.validateToken();
    }, 5 * 60 * 1000);

    setTimeout(() => this.validateToken(), 1000);
  }

  private stopTokenValidation() {
    if (this.tokenCheckInterval) {
      window.clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
    }
  }

  private async validateToken() {
    if (!this.token) return;

    try {
      const payload = this.decodeJWT(this.token);
      if (!payload || !payload.exp) return;

      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;

      if (timeUntilExpiry < 600) {
        console.log("Token expirant bientôt, tentative de rafraîchissement...");
        try {
          await this.refreshAccessToken();
          this.notifyTokenRefresh();
        } catch (error) {
          console.error("Impossible de rafraîchir le token:", error);
          this.handleTokenExpiration();
        }
      }
    } catch (error) {
      console.error("Erreur lors de la validation du token:", error);
    }
  }

  private decodeJWT(
    token: string
  ): { exp?: number; [key: string]: unknown } | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(decoded);
    } catch (error) {
      console.error("Erreur lors du décodage du JWT:", error);
      return null;
    }
  }

  private handleTokenExpiration() {
    console.log("Token expiré, déconnexion automatique");
    this.clearStorage();
    this.stopTokenValidation();

    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  private notifyTokenRefresh() {
    this.tokenRefreshListeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error("Erreur dans le listener de rafraîchissement:", error);
      }
    });
  }

  public onTokenRefresh(listener: () => void) {
    this.tokenRefreshListeners.push(listener);

    return () => {
      const index = this.tokenRefreshListeners.indexOf(listener);
      if (index > -1) {
        this.tokenRefreshListeners.splice(index, 1);
      }
    };
  }

  private clearStorage() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    this.stopTokenValidation();
  }

  private saveAuthData(authResponse: AuthResponse) {
    this.token = authResponse.token;
    this.refreshToken = authResponse.refreshToken;
    this.user = authResponse.user;

    localStorage.setItem("token", authResponse.token);
    localStorage.setItem("refreshToken", authResponse.refreshToken);
    localStorage.setItem("user", JSON.stringify(authResponse.user));

    this.startTokenValidation();
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
