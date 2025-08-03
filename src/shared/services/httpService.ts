// src/shared/services/httpService.ts
import { ApiError } from "../types/common";

class HttpService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
    this.timeout = 30000; // 30 secondes
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private getMultipartHeaders(): Record<string, string> {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    // Gestion des erreurs HTTP
    if (!response.ok) {
      let errorData: ApiError;

      try {
        errorData = await response.json();
      } catch {
        errorData = {
          message: `Erreur ${response.status}: ${response.statusText}`,
          code: response.status.toString(),
        };
      }

      // Gestion spéciale pour l'authentification
      if (response.status === 401) {
        // Rediriger vers login ou refresher le token
        window.location.href = "/login";
        throw new Error("Session expirée, veuillez vous reconnecter");
      }

      throw new Error(errorData.message || "Une erreur est survenue");
    }

    // Gestion de la réponse vide
    const text = await response.text();
    if (!text || text.trim() === "") {
      return null as T;
    }

    try {
      return JSON.parse(text);
    } catch {
      // Si ce n'est pas du JSON, retourner le texte
      return text as T;
    }
  }

  private createAbortController(): AbortController {
    const controller = new AbortController();

    // Timeout automatique
    setTimeout(() => {
      controller.abort();
    }, this.timeout);

    return controller;
  }

  // ==========================================
  // MÉTHODES PUBLIQUES
  // ==========================================

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const controller = this.createAbortController();

    let url = `${this.baseURL}${endpoint}`;

    // Ajouter les paramètres de requête
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

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const controller = this.createAbortController();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const controller = this.createAbortController();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal,
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
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

  // Pour les uploads de fichiers
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const controller = this.createAbortController();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: this.getMultipartHeaders(),
      body: formData,
      signal: controller.signal,
    });

    return this.handleResponse<T>(response);
  }

  // Pour télécharger des fichiers
  async download(endpoint: string): Promise<Blob> {
    const controller = this.createAbortController();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: this.getAuthHeaders(),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("Erreur lors du téléchargement");
    }

    return response.blob();
  }

  // Utilitaire pour construire des URLs de téléchargement
  getDownloadUrl(endpoint: string): string {
    return `${this.baseURL}${endpoint}`;
  }

  // Pour changer la base URL (utile pour les tests)
  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  // Pour changer le timeout
  setTimeout(ms: number): void {
    this.timeout = ms;
  }
}

// Export singleton
export const httpService = new HttpService();

// Export de la classe pour les tests
export { HttpService };
