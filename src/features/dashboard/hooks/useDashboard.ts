import { useState, useCallback, useMemo } from "react";
import { tasksApi } from "../../tasks";
import { linksApi } from "../../links";
import { notesApi } from "../../notes";
import type { TabType, SearchConfig } from "../types";
import type { Task } from "../../tasks/types";
import type { SavedLink } from "../../links/types";
import type { Note } from "../../notes/types";

type SearchResult = Task | SavedLink | Note;

const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
};

const debounce = <T extends unknown[]>(
  func: (...args: T) => unknown,
  wait: number
): ((...args: T) => void) => {
  let timeoutId: number;
  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), wait);
  };
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
  const [searchErrors, setSearchErrors] = useState<Record<TabType, string>>({
    notes: "",
    tasks: "",
    links: "",
    tools: "",
    calendar: "",
  });

  const performSearch = useMemo(
    () =>
      debounce(async (tab: TabType, term: string) => {
        setSearchErrors((prev) => ({ ...prev, [tab]: "" }));

        if (!term.trim()) {
          setSearchResults((prev) => ({ ...prev, [tab]: [] }));
          return;
        }

        if (term.length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
          setSearchResults((prev) => ({ ...prev, [tab]: [] }));
          return;
        }

        setIsSearching(true);

        try {
          let results: SearchResult[] = [];

          switch (tab) {
            case "notes": {
              const response = await notesApi.search({ query: term });
              results = Array.isArray(response)
                ? response
                : response.notes || [];
              break;
            }

            case "links": {
              results = await linksApi.search(term);
              break;
            }

            case "tasks": {
              results = await tasksApi.search(term);
              break;
            }
          }

          setSearchResults((prev) => ({ ...prev, [tab]: results }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erreur de recherche";

          setSearchErrors((prev) => ({ ...prev, [tab]: errorMessage }));
          setSearchResults((prev) => ({ ...prev, [tab]: [] }));
        } finally {
          setIsSearching(false);
        }
      }, SEARCH_CONFIG.DEBOUNCE_DELAY),
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
    setSearchErrors({
      notes: "",
      tasks: "",
      links: "",
      tools: "",
      calendar: "",
    });
  }, []);

  const getSearchConfig = useCallback(
    (tab: TabType): SearchConfig => {
      const configs = {
        notes: {
          show: true,
          placeholder: "Rechercher dans les notes (min. 2 caractères)...",
          hasError: !!searchErrors.notes,
          errorMessage: searchErrors.notes,
        },
        tasks: {
          show: true,
          placeholder: "Rechercher dans les tâches (min. 2 caractères)...",
          hasError: !!searchErrors.tasks,
          errorMessage: searchErrors.tasks,
        },
        links: {
          show: true,
          placeholder: "Rechercher dans les liens (min. 2 caractères)...",
          hasError: !!searchErrors.links,
          errorMessage: searchErrors.links,
        },
        tools: {
          show: false,
          placeholder: undefined,
          hasError: false,
          errorMessage: "",
        },
        calendar: {
          show: false,
          placeholder: undefined,
          hasError: false,
          errorMessage: "",
        },
      };

      const config = configs[tab];

      return {
        show: config.show,
        placeholder: config.placeholder,
        hasError: config.hasError,
        errorMessage: config.errorMessage,
        value: searches[tab] || "",
        onChange: (term: string) => handleSearch(tab, term),
      };
    },
    [searches, handleSearch, searchErrors]
  );

  const getTabSearchResults = useCallback(
    (tab: TabType) => {
      return searchResults[tab] || [];
    },
    [searchResults]
  );

  const getNotesSearchResults = useCallback((): Note[] => {
    return (searchResults.notes || []) as Note[];
  }, [searchResults.notes]);

  const getLinksSearchResults = useCallback((): SavedLink[] => {
    return (searchResults.links || []) as SavedLink[];
  }, [searchResults.links]);

  const getTasksSearchResults = useCallback((): Task[] => {
    return (searchResults.tasks || []) as Task[];
  }, [searchResults.tasks]);

  return {
    activeTab,
    currentSearchTerm: searches[activeTab] || "",
    currentSearchResults: searchResults[activeTab] || [],
    isSearching,
    hasActiveSearch: !!searches[activeTab],
    searchError: searchErrors[activeTab] || "",

    handleTabChange,
    handleSearch,
    clearAllSearches,
    getSearchConfig,
    getTabSearchResults,
    getNotesSearchResults,
    getLinksSearchResults,
    getTasksSearchResults,

    hasSearchResults: (searchResults[activeTab]?.length || 0) > 0,
  };
};
