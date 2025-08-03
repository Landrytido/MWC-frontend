import { httpService } from "../../shared/services/httpService";
import type {
  SavedLink,
  LinkGroup,
  SavedLinkGroup,
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

  getLinksInGroup: (groupId: string): Promise<SavedLinkGroup[]> =>
    httpService.get(`/link-groups/${groupId}/links`),

  addLinkToGroup: (
    groupId: string,
    linkId: number,
    linkName?: string
  ): Promise<SavedLinkGroup> =>
    httpService.post(`/link-groups/${groupId}/links/${linkId}`, { linkName }),

  updateLinkInGroup: (
    groupId: string,
    linkId: number,
    linkName: string
  ): Promise<SavedLinkGroup> =>
    httpService.put(`/link-groups/${groupId}/links/${linkId}`, { linkName }),

  removeLinkFromGroup: (groupId: string, linkId: number): Promise<void> =>
    httpService.delete(`/link-groups/${groupId}/links/${linkId}`),

  incrementClickCounter: (
    groupId: string,
    linkId: number
  ): Promise<SavedLinkGroup> =>
    httpService.post(`/link-groups/${groupId}/links/${linkId}/click`),

  getTopClickedLinks: (groupId: string): Promise<SavedLinkGroup[]> =>
    httpService.get(`/link-groups/${groupId}/links/top-clicked`),

  getGlobalTopClickedLinks: (): Promise<SavedLinkGroup[]> =>
    httpService.get("/link-groups/links/global-top-clicked"),
};
