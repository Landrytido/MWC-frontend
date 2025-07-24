export interface SavedLink {
  id: number;
  url: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinkGroup {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  linkCount?: number;
  savedLinks?: SavedLinkGroup[];
}

export interface SavedLinkGroup {
  savedLinkId: number;
  linkGroupId: string;
  linkName: string;
  url: string;
  clickCounter: number;
  savedLinkDetails: SavedLink;
}

export interface CreateLinkForm {
  url: string;
  title: string;
  description?: string;
}

export interface CreateLinkGroupForm {
  title: string;
  description?: string;
}

// Utilitaires
export function formatUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
