import { useState, useCallback, useMemo } from "react";
import { tasksApi } from "../../tasks";
import { linksApi } from "../../links";
import { notesApi } from "../../notes";
import type { TabType } from "../types";
import type { Task } from "../../tasks/types";
import type { SavedLink } from "../../links/types";
import type { Note } from "../../notes/types";

type SearchResult = Task | SavedLink | Note;

const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): T => {
  let timeoutId: number;
  return ((...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), wait);
  }) as T;
};

export const useDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>("notes");
  const [searches, setSearches] = useState<Record<TabType, string>>({
    notes: "",
    tasks: "",
    links: "",
    tools: "",
    calendar: "",
  });
  const [searchResults, setSearchResults] = useState<
    Record<TabType, SearchResult[]>
  >({
    notes: [],
    tasks: [],
    links: [],
    tools: [],
    calendar: [],
  });
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = useMemo(
    () =>
      debounce(async (tab: TabType, term: string) => {
        if (!term.trim()) {
          setSearchResults((prev) => ({ ...prev, [tab]: [] }));
          return;
        }

        if (term.length < 3) {
          setSearchResults((prev) => ({ ...prev, [tab]: [] }));
          return;
        }

        setIsSearching(true);
        try {
          let results: SearchResult[] = [];
          switch (tab) {
            case "tasks": {
              const taskResults = await tasksApi.search(term);
              results = taskResults;
              break;
            }
            case "links": {
              const linkResults = await linksApi.search(term);
              results = linkResults;
              break;
            }
            case "notes": {
              const response = await notesApi.search({ query: term });
              results = Array.isArray(response)
                ? response
                : response.notes || [];
              break;
            }
          }
          setSearchResults((prev) => ({ ...prev, [tab]: results }));
        } catch (error) {
          console.error(`Erreur recherche ${tab}:`, error);
          setSearchResults((prev) => ({ ...prev, [tab]: [] }));
        } finally {
          setIsSearching(false);
        }
      }, 200),
    []
  );

  const handleSearch = useCallback(
    (tab: TabType, term: string) => {
      setSearches((prev) => ({ ...prev, [tab]: term }));
      performSearch(tab, term);
    },
    [performSearch]
  );

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setSearches((prev) => ({ ...prev, [tab]: "" }));
    setSearchResults((prev) => ({ ...prev, [tab]: [] }));
  }, []);

  const clearAllSearches = useCallback(() => {
    setSearches({
      notes: "",
      tasks: "",
      links: "",
      tools: "",
      calendar: "",
    });
    setSearchResults({
      notes: [],
      tasks: [],
      links: [],
      tools: [],
      calendar: [],
    });
  }, []);

  const getSearchConfig = useCallback(
    (tab: TabType) => {
      const configs = {
        notes: {
          show: true,
          placeholder: "Rechercher dans les notes... (min 3 caractères)",
        },
        tasks: {
          show: true,
          placeholder: "Rechercher dans les tâches... (min 3 caractères)",
        },
        links: {
          show: true,
          placeholder: "Rechercher dans les liens... (min 3 caractères)",
        },
        tools: { show: false },
        calendar: { show: false },
      };

      const config = configs[tab] || { show: false };

      return {
        ...config,
        value: searches[tab] || "",
        onChange: (term: string) => handleSearch(tab, term),
      };
    },
    [searches, handleSearch]
  );

  const getTabSearchResults = useCallback(
    (tab: TabType) => {
      return searchResults[tab] || [];
    },
    [searchResults]
  );

  return {
    activeTab,
    currentSearchTerm: searches[activeTab] || "",
    currentSearchResults: searchResults[activeTab] || [],
    isSearching,
    hasActiveSearch: !!searches[activeTab],

    handleTabChange,
    handleSearch,
    clearAllSearches,
    getSearchConfig,
    getTabSearchResults,

    hasSearchResults: (searchResults[activeTab]?.length || 0) > 0,
  };
};
