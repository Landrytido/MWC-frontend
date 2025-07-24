import { useState, useEffect, useCallback } from "react";
import {
  SavedLink,
  LinkGroup,
  CreateLinkForm,
  CreateLinkGroupForm,
} from "../types";
import { linksApi, linkGroupsApi } from "../api";

interface UseLinksReturn {
  links: SavedLink[];
  linkGroups: LinkGroup[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createLink: (link: CreateLinkForm) => Promise<SavedLink>;
  updateLink: (id: number, link: Partial<SavedLink>) => Promise<SavedLink>;
  deleteLink: (id: number) => Promise<void>;
  searchLinks: (keyword: string) => Promise<SavedLink[]>;
  // Link Groups
  createLinkGroup: (group: CreateLinkGroupForm) => Promise<LinkGroup>;
  updateLinkGroup: (
    id: string,
    group: CreateLinkGroupForm
  ) => Promise<LinkGroup>;
  deleteLinkGroup: (id: string) => Promise<void>;
}

export const useLinks = (): UseLinksReturn => {
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [linkGroups, setLinkGroups] = useState<LinkGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [linksData, groupsData] = await Promise.all([
        linksApi.getAll(),
        linkGroupsApi.getAll(),
      ]);
      setLinks(linksData);
      setLinkGroups(groupsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  // CRUD Links
  const createLink = useCallback(
    async (link: CreateLinkForm): Promise<SavedLink> => {
      try {
        const newLink = await linksApi.create(link);
        setLinks((prev) => [newLink, ...prev]);
        return newLink;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors de la création";
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  const updateLink = useCallback(
    async (id: number, link: Partial<SavedLink>): Promise<SavedLink> => {
      try {
        const updatedLink = await linksApi.update(id, link);
        setLinks((prev) => prev.map((l) => (l.id === id ? updatedLink : l)));
        return updatedLink;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors de la mise à jour";
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  const deleteLink = useCallback(async (id: number): Promise<void> => {
    try {
      await linksApi.delete(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erreur lors de la suppression";
      setError(errorMsg);
      throw err;
    }
  }, []);

  const searchLinks = useCallback(
    async (keyword: string): Promise<SavedLink[]> => {
      try {
        const results = await linksApi.search(keyword);
        return results;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors de la recherche";
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  // CRUD Link Groups
  const createLinkGroup = useCallback(
    async (group: CreateLinkGroupForm): Promise<LinkGroup> => {
      try {
        const newGroup = await linkGroupsApi.create(group);
        setLinkGroups((prev) => [newGroup, ...prev]);
        return newGroup;
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Erreur lors de la création du groupe";
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  const updateLinkGroup = useCallback(
    async (id: string, group: CreateLinkGroupForm): Promise<LinkGroup> => {
      try {
        const updatedGroup = await linkGroupsApi.update(id, group);
        setLinkGroups((prev) =>
          prev.map((g) => (g.id === id ? updatedGroup : g))
        );
        return updatedGroup;
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Erreur lors de la mise à jour du groupe";
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  const deleteLinkGroup = useCallback(async (id: string): Promise<void> => {
    try {
      await linkGroupsApi.delete(id);
      setLinkGroups((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Erreur lors de la suppression du groupe";
      setError(errorMsg);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    links,
    linkGroups,
    loading,
    error,
    refetch: fetchData,
    createLink,
    updateLink,
    deleteLink,
    searchLinks,
    createLinkGroup,
    updateLinkGroup,
    deleteLinkGroup,
  };
};
