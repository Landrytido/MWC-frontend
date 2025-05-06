// Types pour l'authentification
export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  imageUrl?: string;
}

// Types pour les notes
export interface Note {
  id?: string;
  title: string;
  content: string;
  createdAt?: Date;
}

// Types pour les liens sauvegardés
export interface SavedLink {
  id?: string;
  url: string;
  title: string;
  description?: string;
  createdAt?: Date;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
