import { httpService } from "../../shared/services/httpService";
import type {
  SavedLink,
  LinkGroup,
  CreateLinkForm,
  CreateLinkGroupForm,
} from "./types";

export const linksApi = {
  getAll: (): Promise<SavedLink[]> => httpService.get("/links"),

  getById: (id: number): Promise<SavedLink> => httpService.get(`/links/${id}`),

  create: (link: CreateLinkForm): Promise<SavedLink> =>
    httpService.post("/links", link),

  update: (id: number, link: Partial<SavedLink>): Promise<SavedLink> =>
    httpService.put(`/links/${id}`, link),

  delete: (id: number): Promise<void> => httpService.delete(`/links/${id}`),

  search: async (keyword: string): Promise<SavedLink[]> => {
    if (!keyword.trim()) {
      return await linksApi.getAll();
    }
    return httpService.get("/links/search", { keyword });
  },

  /** Assigner un lien à un groupe (groupId = null pour retirer du groupe) */
  assignToGroup: (id: number, groupId: string | null): Promise<SavedLink> =>
    httpService.put(`/links/${id}/group`, { groupId }),

  /** Incrémenter le compteur de clics */
  incrementClick: (id: number): Promise<SavedLink> =>
    httpService.post(`/links/${id}/click`),
};

export const linkGroupsApi = {
  getAll: (): Promise<LinkGroup[]> => httpService.get("/link-groups"),

  getById: (id: string): Promise<LinkGroup> =>
    httpService.get(`/link-groups/${id}`),

  create: (data: CreateLinkGroupForm): Promise<LinkGroup> =>
    httpService.post("/link-groups", data),

  update: (id: string, data: CreateLinkGroupForm): Promise<LinkGroup> =>
    httpService.put(`/link-groups/${id}`, data),

  delete: (id: string): Promise<void> =>
    httpService.delete(`/link-groups/${id}`),
};
