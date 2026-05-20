export interface SavedLink {
  id: number;
  url: string;
  title: string;
  description?: string;
  clickCounter: number;
  linkGroupId?: string | null;
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
  savedLinks?: SavedLink[];
}

export interface CreateLinkForm {
  url: string;
  title: string;
  description?: string;
  linkGroupId?: string | null;
}

export interface CreateLinkGroupForm {
  title: string;
  description?: string;
}

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
