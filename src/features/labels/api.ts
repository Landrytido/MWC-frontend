import { Label, CreateLabelForm, LabelUsageStats } from "./types";

// Configuration de base (à déplacer plus tard dans shared/services)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Helper pour les appels authentifiés (temporaire, sera dans shared)
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message || `Erreur ${response.status}: ${response.statusText}`
    );
  }

  const text = await response.text();
  return text && text.trim() !== "" ? JSON.parse(text) : null;
};

// API Labels
export const labelsApi = {
  getAll: async (): Promise<Label[]> => {
    const response = await fetch(`${API_BASE_URL}/labels`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string): Promise<Label> => {
    const response = await fetch(`${API_BASE_URL}/labels/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getNotes: async (labelId: string) => {
    const response = await fetch(`${API_BASE_URL}/labels/${labelId}/notes`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  search: async (keyword: string): Promise<Label[]> => {
    const response = await fetch(
      `${API_BASE_URL}/labels/search?keyword=${encodeURIComponent(keyword)}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },

  create: async (label: CreateLabelForm): Promise<Label> => {
    const response = await fetch(
      `${API_BASE_URL}/labels?name=${encodeURIComponent(label.name)}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  update: async (id: string, label: { name: string }): Promise<Label> => {
    const response = await fetch(
      `${API_BASE_URL}/labels/${id}?name=${encodeURIComponent(label.name)}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  delete: async (id: string, forceDelete = false): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/labels/${id}?forceDelete=${forceDelete}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    await handleResponse(response);
  },

  getUsageStats: async (): Promise<LabelUsageStats> => {
    const response = await fetch(`${API_BASE_URL}/labels/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
