export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    enabled: boolean;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

class AuthService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private user: any = null;

  constructor() {
    // Récupérer les tokens du localStorage au démarrage
    this.token = localStorage.getItem("token");
    this.refreshToken = localStorage.getItem("refreshToken");
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        this.user = JSON.parse(savedUser);
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
      console.log("🔍 Données d'erreur reçues:", errorData);
      const errorMessage =
        errorData?.message || errorData?.error || "Erreur de connexion";
      console.log("🔍 Message d'erreur final:", errorMessage);
      throw new Error(
        errorData?.message || errorData?.error || "Erreur de connexion"
      );
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

  getUser(): any {
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
    // Si le token a expiré, essayer de le rafraîchir
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
}

export const authService = new AuthService();
