import { ApiError } from "../types/common";
import { authService } from "../../features/auth/services/authService";

class HttpService {
  private static readonly AUTH_RETRY_SIGNAL = "__AUTH_TOKEN_REFRESHED__";
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

      if (response.status === 401) {
        try {
          await authService.refreshAccessToken();
          throw new Error(HttpService.AUTH_RETRY_SIGNAL);
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === HttpService.AUTH_RETRY_SIGNAL
          ) {
            throw error;
          }

          await authService.logout();
          window.location.href = "/login";
          throw new Error("Session expirée, veuillez vous reconnecter");
        }
      }

      let errorMessage = errorData.message || "Une erreur est survenue";

      if (response.status >= 500) {
        const serverError = errorData as unknown as Record<string, unknown>;
        errorMessage = `Erreur serveur (${response.status}): ${
          serverError.error || errorData.message || "Erreur interne du serveur"
        }`;

        if (serverError.details || serverError.validation) {
          errorMessage += `\nDétails: ${JSON.stringify(
            serverError.details || serverError.validation,
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

  private async makeRequestWithRetry<T>(
    requestFn: () => Promise<Response>,
  ): Promise<T> {
    let attempt = 0;

    while (attempt < 2) {
      try {
        const response = await requestFn();
        return this.handleResponse<T>(response);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === HttpService.AUTH_RETRY_SIGNAL &&
          attempt === 0
        ) {
          attempt++;
          continue;
        }
        throw error;
      }
    }

    throw new Error("Retry exhausted");
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
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

    return this.makeRequestWithRetry<T>(() =>
      fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
        signal: controller.signal,
      }),
    );
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const controller = this.createAbortController();

    return this.makeRequestWithRetry<T>(() =>
      fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      }),
    );
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const controller = this.createAbortController();

    return this.makeRequestWithRetry<T>(() =>
      fetch(`${this.baseURL}${endpoint}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      }),
    );
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const controller = this.createAbortController();

    return this.makeRequestWithRetry<T>(() =>
      fetch(`${this.baseURL}${endpoint}`, {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      }),
    );
  }

  async delete<T>(endpoint: string): Promise<T> {
    const controller = this.createAbortController();

    return this.makeRequestWithRetry<T>(() =>
      fetch(`${this.baseURL}${endpoint}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
        signal: controller.signal,
      }),
    );
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
