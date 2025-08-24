// src/features/dashboard/hooks/useDashboard.ts
import { useState, useCallback, useMemo } from "react";
import { tasksApi } from "../../tasks";
import { linksApi } from "../../links";
import { notesApi } from "../../notes";
import { useNotes } from "../../notes";
import { useLinks } from "../../links";
import { useTasks } from "../../tasks";
import type { TabType, SearchConfig } from "../types";
import type { Task } from "../../tasks/types";
import type { SavedLink } from "../../links/types";
import type { Note } from "../../notes/types";

type SearchResult = Task | SavedLink | Note;

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

// 🔥 NOUVELLE FONCTION: Recherche locale pour les notes
const searchNotesLocally = (notes: Note[], term: string): Note[] => {
  if (!term.trim()) return [];

  const searchTerm = term.toLowerCase();
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm) ||
      note.notebookTitle?.toLowerCase().includes(searchTerm) ||
      note.labels?.some((label) =>
        label.name.toLowerCase().includes(searchTerm)
      )
  );
};

// 🔥 NOUVELLE FONCTION: Recherche locale pour les liens
const searchLinksLocally = (links: SavedLink[], term: string): SavedLink[] => {
  if (!term.trim()) return [];

  const searchTerm = term.toLowerCase();
  return links.filter(
    (link) =>
      link.title.toLowerCase().includes(searchTerm) ||
      link.url.toLowerCase().includes(searchTerm) ||
      link.description?.toLowerCase().includes(searchTerm)
  );
};

// 🔥 NOUVELLE FONCTION: Recherche locale pour les tâches
const searchTasksLocally = (tasks: Task[], term: string): Task[] => {
  if (!term.trim()) return [];

  const searchTerm = term.toLowerCase();
  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm) ||
      task.description?.toLowerCase().includes(searchTerm)
  );
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

  // Mode développement pour afficher les messages de debug
  const isDev = import.meta.env.DEV;

  // 🔥 AJOUT: Accès aux données locales pour le fallback
  const { notes } = useNotes();
  const { links } = useLinks();
  const { tasks } = useTasks();

  const performSearch = useMemo(
    () =>
      debounce(async (tab: TabType, term: string) => {
        // Réinitialiser les erreurs
        setSearchErrors((prev) => ({ ...prev, [tab]: "" }));

        if (!term.trim()) {
          setSearchResults((prev) => ({ ...prev, [tab]: [] }));
          return;
        }

        // 🔥 CORRECTION: Recherche dès 1 caractère pour tous les onglets
        if (term.length < 1) {
          setSearchResults((prev) => ({ ...prev, [tab]: [] }));
          return;
        }

        setIsSearching(true);
        try {
          let results: SearchResult[] = [];

          switch (tab) {
            case "notes": {
              try {
                // Tentative API d'abord
                if (isDev) console.log(`🔍 Recherche API notes: "${term}"`);
                const response = await notesApi.search({ query: term });
                results = Array.isArray(response)
                  ? response
                  : response.notes || [];
                if (isDev)
                  console.log(`✅ API notes trouvées: ${results.length}`);
              } catch {
                // Fallback vers recherche locale sans message utilisateur visible
                if (isDev) {
                  console.warn(
                    `❌ API notes échoue, fallback local pour: "${term}"`
                  );
                }
                results = searchNotesLocally(notes, term);
                if (isDev) {
                  console.log(
                    `🔍 Recherche locale notes: ${results.length} trouvées`
                  );
                }

                // En mode développement uniquement, afficher l'info
                if (isDev) {
                  setSearchErrors((prev) => ({
                    ...prev,
                    [tab]: `Mode hors-ligne`,
                  }));
                }
              }
              break;
            }

            case "links": {
              try {
                if (isDev) console.log(`🔍 Recherche API liens: "${term}"`);
                const linkResults = await linksApi.search(term);
                results = linkResults;
                if (isDev)
                  console.log(`✅ API liens trouvés: ${results.length}`);
              } catch {
                // Fallback vers recherche locale
                if (isDev) {
                  console.warn(
                    `❌ API liens échoue, fallback local pour: "${term}"`
                  );
                }
                results = searchLinksLocally(links, term);
                if (isDev) {
                  console.log(
                    `🔍 Recherche locale liens: ${results.length} trouvés`
                  );
                }

                if (isDev) {
                  setSearchErrors((prev) => ({
                    ...prev,
                    [tab]: `Mode hors-ligne`,
                  }));
                }
              }
              break;
            }

            case "tasks": {
              try {
                if (isDev) console.log(`🔍 Recherche API tâches: "${term}"`);
                const taskResults = await tasksApi.search(term);
                results = taskResults;
                if (isDev)
                  console.log(`✅ API tâches trouvées: ${results.length}`);
              } catch {
                // Fallback vers recherche locale
                if (isDev) {
                  console.warn(
                    `❌ API tâches échoue, fallback local pour: "${term}"`
                  );
                }
                results = searchTasksLocally(tasks, term);
                if (isDev) {
                  console.log(
                    `🔍 Recherche locale tâches: ${results.length} trouvées`
                  );
                }

                if (isDev) {
                  setSearchErrors((prev) => ({
                    ...prev,
                    [tab]: `Mode hors-ligne`,
                  }));
                }
              }
              break;
            }
          }

          setSearchResults((prev) => ({ ...prev, [tab]: results }));
        } catch (error) {
          console.error(`❌ Erreur recherche ${tab}:`, error);
          setSearchResults((prev) => ({ ...prev, [tab]: [] }));
          setSearchErrors((prev) => ({
            ...prev,
            [tab]: `Erreur de recherche: ${
              error instanceof Error ? error.message : "Erreur inconnue"
            }`,
          }));
        } finally {
          setIsSearching(false);
        }
      }, 300), // Debounce pour éviter trop de requêtes
    [notes, links, tasks, isDev] // Dépendances pour le fallback local et mode debug
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
    // 🔥 Garder les recherches lors du changement d'onglet
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
          placeholder: "Rechercher dans les notes...",
          hasError: !!searchErrors.notes,
          errorMessage: searchErrors.notes,
        },
        tasks: {
          show: true,
          placeholder: "Rechercher dans les tâches...",
          hasError: !!searchErrors.tasks,
          errorMessage: searchErrors.tasks,
        },
        links: {
          show: true,
          placeholder: "Rechercher dans les liens...",
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

  // Fonctions typées spécifiques pour chaque type de contenu
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
