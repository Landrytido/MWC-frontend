import { ApiError } from "../types/common";
import { authService } from "../../features/auth/services/authService";

class HttpService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
    this.timeout = 30000;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = authService.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: ApiError;

      try {
        const errorText = await response.text();

        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = {
            message:
              errorText || `Erreur ${response.status}: ${response.statusText}`,
            code: response.status.toString(),
          };
        }
      } catch {
        errorData = {
          message: `Erreur ${response.status}: ${response.statusText}`,
          code: response.status.toString(),
        };
      }

      console.error("❌ HTTP Error:", {
        status: response.status,
        url: response.url,
        error: errorData,
      });

      if (response.status === 401) {
        try {
          await authService.refreshAccessToken();
          throw new Error("Token rafraîchi, veuillez relancer l'opération");
        } catch {
          await authService.logout();
          window.location.href = "/login";
          throw new Error("Session expirée, veuillez vous reconnecter");
        }
      }

      // Améliorer le message d'erreur pour les erreurs 500
      let errorMessage = errorData.message || "Une erreur est survenue";

      if (response.status >= 500) {
        const serverError = errorData as unknown as Record<string, unknown>;
        errorMessage = `Erreur serveur (${response.status}): ${
          serverError.error || errorData.message || "Erreur interne du serveur"
        }`;

        // Si c'est une erreur de validation ou de données spécifique
        if (serverError.details || serverError.validation) {
          errorMessage += `\nDétails: ${JSON.stringify(
            serverError.details || serverError.validation
          )}`;
        }
      }

      throw new Error(errorMessage);
    }

    const text = await response.text();

    if (!text || text.trim() === "") {
      return null as T;
    }

    try {
      const result = JSON.parse(text);
      return result;
    } catch {
      return text as T;
    }
  }

  private createAbortController(): AbortController {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), this.timeout);
    return controller;
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    const controller = this.createAbortController();

    let url = `${this.baseURL}${endpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });

      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
    }

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
      signal: controller.signal,
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const controller = this.createAbortController();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const controller = this.createAbortController();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal,
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const controller = this.createAbortController();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const controller = this.createAbortController();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
      signal: controller.signal,
    });

    return this.handleResponse<T>(response);
  }

  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  setTimeout(ms: number): void {
    this.timeout = ms;
  }
}

export const httpService = new HttpService();
export { HttpService };
