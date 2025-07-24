import { Notebook, CreateNotebookForm, NotebookUsageStats } from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

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

export const notebooksApi = {
  getAll: async (): Promise<Notebook[]> => {
    const response = await fetch(`${API_BASE_URL}/notebooks`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: number): Promise<Notebook> => {
    const response = await fetch(`${API_BASE_URL}/notebooks/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getNotes: async (
    notebookId: number,
    params?: { limit?: number; offset?: number }
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());

    const queryString = searchParams.toString();
    const url = `/notebooks/${notebookId}/notes${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (notebook: CreateNotebookForm): Promise<Notebook> => {
    const response = await fetch(`${API_BASE_URL}/notebooks`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(notebook),
    });
    return handleResponse(response);
  },

  update: async (
    id: number,
    notebook: CreateNotebookForm
  ): Promise<Notebook> => {
    const response = await fetch(`${API_BASE_URL}/notebooks/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(notebook),
    });
    return handleResponse(response);
  },

  delete: async (id: number, forceDelete: boolean = true): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/notebooks/${id}?forceDelete=${forceDelete}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    await handleResponse(response);
  },

  getUsageStats: async (): Promise<NotebookUsageStats> => {
    const response = await fetch(`${API_BASE_URL}/notebooks/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
