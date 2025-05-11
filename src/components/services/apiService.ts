import { useAuth } from "@clerk/clerk-react";

export interface Note {
  id?: number;
  title: string;
  content: string;
  createdAt?: string;
}

export interface SavedLink {
  id?: number;
  url: string;
  title: string;
  description?: string;
  createdAt?: string;
}

export interface User {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

// URL de base de l'API
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  window.ENV?.API_URL ||
  "http://localhost:8080/api";

/**
 * Service pour interagir avec l'API du backend Spring Boot
 * Ce service utilise Clerk pour obtenir le token JWT d'authentification
 */
export const useApiService = () => {
  const { getToken } = useAuth();

  // Fonction utilitaire pour faire des requêtes authentifiées
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    // Récupérer le token JWT depuis Clerk
    const token = await getToken();

    // Ajouter les headers d'authentification et de contenu
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Faire la requête
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    // Vérifier si la requête a réussi
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message ||
          `Erreur ${response.status}: ${response.statusText}`
      );
    }

    // Retourner les données JSON ou null si la réponse est vide
    return response.status !== 204 ? await response.json() : null;
  };

  // API pour les notes
  const notesApi = {
    // Récupérer toutes les notes de l'utilisateur
    getAll: () => fetchWithAuth("/notes"),

    // Récupérer une note par son ID
    getById: (id: string) => fetchWithAuth(`/notes/${id}`),

    // Créer une nouvelle note
    create: (note: Note) =>
      fetchWithAuth("/notes", {
        method: "POST",
        body: JSON.stringify(note),
      }),

    // Mettre à jour une note existante
    update: (id: string, note: Note) =>
      fetchWithAuth(`/notes/${id}`, {
        method: "PUT",
        body: JSON.stringify(note),
      }),

    // Supprimer une note
    delete: (id: string) =>
      fetchWithAuth(`/notes/${id}`, {
        method: "DELETE",
      }),
  };

  // API pour les liens
  const linksApi = {
    // Récupérer tous les liens de l'utilisateur
    getAll: () => fetchWithAuth("/links"),

    // Récupérer un lien par son ID
    getById: (id: string) => fetchWithAuth(`/links/${id}`),

    // Créer un nouveau lien
    create: (link: SavedLink) =>
      fetchWithAuth("/links", {
        method: "POST",
        body: JSON.stringify(link),
      }),

    // Mettre à jour un lien existant
    update: (id: string, link: SavedLink) =>
      fetchWithAuth(`/links/${id}`, {
        method: "PUT",
        body: JSON.stringify(link),
      }),

    // Supprimer un lien
    delete: (id: string) =>
      fetchWithAuth(`/links/${id}`, {
        method: "DELETE",
      }),
  };

  // API pour l'utilisateur
  const userApi = {
    // Synchroniser un utilisateur Clerk avec le backend
    syncUser: (userData: {
      clerkId: string;
      email: string;
      firstName?: string;
      lastName?: string;
    }) =>
      fetchWithAuth("/users/sync", {
        method: "POST",
        body: JSON.stringify(userData),
      }),

    // Récupérer les informations de l'utilisateur
    getProfile: () => fetchWithAuth("/users/profile"),
  };

  return {
    notes: notesApi,
    links: linksApi,
    user: userApi,
  };
};
