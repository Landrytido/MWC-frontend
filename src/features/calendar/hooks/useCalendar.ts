import { useState, useEffect, useCallback } from "react";
import { calendarApi } from "../api";
import {
  EventDto,
  CalendarViewDto,
  CreateEventRequest,
  TaskDto,
} from "../types";

interface UseCalendarReturn {
  // 📊 DONNÉES
  events: EventDto[];
  currentMonthData: CalendarViewDto[];

  // 📅 NAVIGATION
  currentMonth: number;
  currentYear: number;

  // ⚡ ÉTATS DE CHARGEMENT
  error: string | null;
  loadingStates: {
    events: boolean;
    monthView: boolean;
    dayView: boolean;
  };

  // 🧭 NAVIGATION
  navigateToPreviousMonth: () => void;
  navigateToNextMonth: () => void;
  navigateToToday: () => void;
  navigateToMonth: (month: number, year: number) => void;

  // 📝 ACTIONS CRUD
  createEvent: (eventData: CreateEventRequest) => Promise<EventDto>;
  updateEvent: (id: number, eventData: CreateEventRequest) => Promise<EventDto>;
  deleteEvent: (id: number) => Promise<void>;
  createTaskFromCalendar: (taskData: CreateEventRequest) => Promise<TaskDto>;

  // 🔍 UTILITAIRES
  loadDayData: (date: string) => Promise<CalendarViewDto>;
  refreshCalendarData: () => Promise<void>;
}

export const useCalendar = (): UseCalendarReturn => {
  // 📅 ÉTAT DE NAVIGATION
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date().getMonth() + 1
  );
  const [currentYear, setCurrentYear] = useState(() =>
    new Date().getFullYear()
  );

  // 📊 DONNÉES
  const [events, setEvents] = useState<EventDto[]>([]);
  const [currentMonthData, setCurrentMonthData] = useState<CalendarViewDto[]>(
    []
  );

  // ⚡ ÉTATS DE CHARGEMENT - ✅ Suppression de 'loading' inutilisé
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    events: false,
    monthView: false,
    dayView: false,
  });

  // 🔑 CLÉS DE CACHE - Simple, juste pour éviter les rechargements inutiles
  const [lastLoadedMonth, setLastLoadedMonth] = useState<string | null>(null);

  const getMonthKey = useCallback(
    (month: number, year: number) =>
      `${year}-${month.toString().padStart(2, "0")}`,
    []
  );

  // 🧭 NAVIGATION
  const navigateToMonth = useCallback((month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);

  const navigateToPreviousMonth = useCallback(() => {
    if (currentMonth === 1) {
      navigateToMonth(12, currentYear - 1);
    } else {
      navigateToMonth(currentMonth - 1, currentYear);
    }
  }, [currentMonth, currentYear, navigateToMonth]);

  const navigateToNextMonth = useCallback(() => {
    if (currentMonth === 12) {
      navigateToMonth(1, currentYear + 1);
    } else {
      navigateToMonth(currentMonth + 1, currentYear);
    }
  }, [currentMonth, currentYear, navigateToMonth]);

  const navigateToToday = useCallback(() => {
    const today = new Date();
    navigateToMonth(today.getMonth() + 1, today.getFullYear());
  }, [navigateToMonth]);

  // 📊 CHARGEMENT DES DONNÉES
  const loadMonthData = useCallback(
    async (month: number, year: number) => {
      const monthKey = getMonthKey(month, year);

      // Simple cache check - pas de stockage en mémoire complexe
      if (lastLoadedMonth === monthKey) {
        return;
      }

      setLoadingStates((prev) => ({ ...prev, monthView: true }));
      setError(null);

      try {
        const data = await calendarApi.getMonthView(year, month);
        setCurrentMonthData(data);
        setLastLoadedMonth(monthKey);
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement du mois";
        setError(errorMsg);
        console.error("❌ Erreur chargement mois:", err);
      } finally {
        setLoadingStates((prev) => ({ ...prev, monthView: false }));
      }
    },
    [getMonthKey, lastLoadedMonth]
  );

  const loadDayData = useCallback(
    async (date: string): Promise<CalendarViewDto> => {
      setLoadingStates((prev) => ({ ...prev, dayView: true }));
      setError(null);

      try {
        const data = await calendarApi.getDayView(date);
        return data;
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement du jour";
        setError(errorMsg);
        throw err;
      } finally {
        setLoadingStates((prev) => ({ ...prev, dayView: false }));
      }
    },
    []
  );

  // 📝 ACTIONS CRUD - Pattern identique à useNotes/useTasks
  const createEvent = useCallback(
    async (eventData: CreateEventRequest): Promise<EventDto> => {
      try {
        const newEvent = await calendarApi.createEvent(eventData);
        setEvents((prev) => [newEvent, ...prev]);

        // ♻️ Recharger les données du mois courant
        setLastLoadedMonth(null); // Force le rechargement
        await loadMonthData(currentMonth, currentYear);

        return newEvent;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors de la création";
        setError(errorMsg);
        throw err;
      }
    },
    [currentMonth, currentYear, loadMonthData]
  );

  const updateEvent = useCallback(
    async (id: number, eventData: CreateEventRequest): Promise<EventDto> => {
      try {
        const updatedEvent = await calendarApi.updateEvent(id, eventData);
        setEvents((prev) =>
          prev.map((event) => (event.id === id ? updatedEvent : event))
        );

        // ♻️ Recharger les données du mois courant
        setLastLoadedMonth(null);
        await loadMonthData(currentMonth, currentYear);

        return updatedEvent;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors de la mise à jour";
        setError(errorMsg);
        throw err;
      }
    },
    [currentMonth, currentYear, loadMonthData]
  );

  const deleteEvent = useCallback(
    async (id: number): Promise<void> => {
      try {
        await calendarApi.deleteEvent(id);
        setEvents((prev) => prev.filter((event) => event.id !== id));

        // ♻️ Recharger les données du mois courant
        setLastLoadedMonth(null);
        await loadMonthData(currentMonth, currentYear);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors de la suppression";
        setError(errorMsg);
        throw err;
      }
    },
    [currentMonth, currentYear, loadMonthData]
  );

  // ✅ CORRECTION : Type TaskDto au lieu de any
  const createTaskFromCalendar = useCallback(
    async (taskData: CreateEventRequest): Promise<TaskDto> => {
      try {
        const newTask = await calendarApi.createTaskFromCalendar(taskData);

        // ♻️ Recharger les données du mois courant pour voir la nouvelle tâche
        setLastLoadedMonth(null);
        await loadMonthData(currentMonth, currentYear);

        return newTask;
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Erreur lors de la création de la tâche";
        setError(errorMsg);
        throw err;
      }
    },
    [currentMonth, currentYear, loadMonthData]
  );

  // 🔄 RECHARGEMENT COMPLET
  const refreshCalendarData = useCallback(async () => {
    setLastLoadedMonth(null);
    await loadMonthData(currentMonth, currentYear);
  }, [currentMonth, currentYear, loadMonthData]);

  // 🎣 EFFETS - Charger automatiquement quand le mois change
  useEffect(() => {
    loadMonthData(currentMonth, currentYear);
  }, [currentMonth, currentYear, loadMonthData]);

  // 🎣 EFFET - Charger les événements au début
  useEffect(() => {
    const loadAllEvents = async () => {
      setLoadingStates((prev) => ({ ...prev, events: true }));
      try {
        const eventsData = await calendarApi.getAllEvents();
        setEvents(eventsData);
      } catch (err) {
        console.error("❌ Erreur chargement événements:", err);
      } finally {
        setLoadingStates((prev) => ({ ...prev, events: false }));
      }
    };

    loadAllEvents();
  }, []);

  return {
    // 📊 DONNÉES
    events,
    currentMonthData,

    // 📅 NAVIGATION
    currentMonth,
    currentYear,

    // ⚡ ÉTATS DE CHARGEMENT - ✅ Suppression de loading global
    error,
    loadingStates,

    // 🧭 NAVIGATION
    navigateToPreviousMonth,
    navigateToNextMonth,
    navigateToToday,
    navigateToMonth,

    // 📝 ACTIONS
    createEvent,
    updateEvent,
    deleteEvent,
    createTaskFromCalendar,

    // 🔍 UTILITAIRES
    loadDayData,
    refreshCalendarData,
  };
};
