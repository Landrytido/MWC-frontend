import {
  SavedLink,
  LinkGroup,
  SavedLinkGroup,
  CreateLinkForm,
  CreateLinkGroupForm,
} from "./types";

// Configuration de base (temporaire, sera dans shared plus tard)
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

// API Links
export const linksApi = {
  // CRUD des liens
  getAll: async (): Promise<SavedLink[]> => {
    const response = await fetch(`${API_BASE_URL}/links`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: number): Promise<SavedLink> => {
    const response = await fetch(`${API_BASE_URL}/links/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (link: CreateLinkForm): Promise<SavedLink> => {
    const response = await fetch(`${API_BASE_URL}/links`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(link),
    });
    return handleResponse(response);
  },

  update: async (id: number, link: Partial<SavedLink>): Promise<SavedLink> => {
    const response = await fetch(`${API_BASE_URL}/links/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(link),
    });
    return handleResponse(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/links/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    await handleResponse(response);
  },

  search: async (keyword: string): Promise<SavedLink[]> => {
    if (!keyword.trim()) {
      return await linksApi.getAll();
    }
    const response = await fetch(
      `${API_BASE_URL}/links/search?keyword=${encodeURIComponent(keyword)}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },
};

// API Link Groups
export const linkGroupsApi = {
  getAll: async (): Promise<LinkGroup[]> => {
    const response = await fetch(`${API_BASE_URL}/link-groups`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string): Promise<LinkGroup> => {
    const response = await fetch(`${API_BASE_URL}/link-groups/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (data: CreateLinkGroupForm): Promise<LinkGroup> => {
    const response = await fetch(`${API_BASE_URL}/link-groups`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: CreateLinkGroupForm): Promise<LinkGroup> => {
    const response = await fetch(`${API_BASE_URL}/link-groups/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/link-groups/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    await handleResponse(response);
  },

  getLinksInGroup: async (groupId: string): Promise<SavedLinkGroup[]> => {
    const response = await fetch(
      `${API_BASE_URL}/link-groups/${groupId}/links`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  addLinkToGroup: async (
    groupId: string,
    linkId: number,
    linkName?: string
  ): Promise<SavedLinkGroup> => {
    const response = await fetch(
      `${API_BASE_URL}/link-groups/${groupId}/links/${linkId}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ linkName }),
      }
    );
    return handleResponse(response);
  },

  updateLinkInGroup: async (
    groupId: string,
    linkId: number,
    linkName: string
  ): Promise<SavedLinkGroup> => {
    const response = await fetch(
      `${API_BASE_URL}/link-groups/${groupId}/links/${linkId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ linkName }),
      }
    );
    return handleResponse(response);
  },

  removeLinkFromGroup: async (
    groupId: string,
    linkId: number
  ): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/link-groups/${groupId}/links/${linkId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    await handleResponse(response);
  },

  incrementClickCounter: async (
    groupId: string,
    linkId: number
  ): Promise<SavedLinkGroup> => {
    const response = await fetch(
      `${API_BASE_URL}/link-groups/${groupId}/links/${linkId}/click`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  getTopClickedLinks: async (groupId: string): Promise<SavedLinkGroup[]> => {
    const response = await fetch(
      `${API_BASE_URL}/link-groups/${groupId}/links/top-clicked`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },

  getGlobalTopClickedLinks: async (): Promise<SavedLinkGroup[]> => {
    const response = await fetch(
      `${API_BASE_URL}/link-groups/links/global-top-clicked`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },
};
