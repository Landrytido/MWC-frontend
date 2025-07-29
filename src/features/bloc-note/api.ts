import { BlocNote, UpdateBlocNoteRequest } from "./types";

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

export const blocNoteApi = {
  get: async (): Promise<BlocNote> => {
    const response = await fetch(`${API_BASE_URL}/bloc-note`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  update: async (data: UpdateBlocNoteRequest): Promise<BlocNote> => {
    const response = await fetch(`${API_BASE_URL}/bloc-note`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/bloc-note`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    await handleResponse(response);
  },
};
