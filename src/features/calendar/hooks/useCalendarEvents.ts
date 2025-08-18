import { useState, useEffect, useCallback } from "react";
import { calendarApi } from "../api";
import { EventDto, CalendarViewDto, CreateEventRequest } from "../types";

interface UseCalendarReturn {
  // 📅 ÉTAT DE NAVIGATION
  currentMonth: number;
  currentYear: number;

  // 📊 DONNÉES
  events: EventDto[];
  currentMonthData: CalendarViewDto[];

  // ⚡ ÉTATS DE CHARGEMENT
  loading: {
    events: boolean;
    monthView: boolean;
    dayView: boolean;
  };
  error: string | null;

  // 🧭 NAVIGATION (comme setCurrentNotebook dans Notes)
  navigateToPreviousMonth: () => void;
  navigateToNextMonth: () => void;
  navigateToToday: () => void;
  navigateToMonth: (month: number, year: number) => void;

  // 📝 ACTIONS (comme createNote, deleteNote)
  createEvent: (eventData: CreateEventRequest) => Promise<EventDto>;
  updateEvent: (id: number, eventData: CreateEventRequest) => Promise<EventDto>;
  deleteEvent: (id: number) => Promise<void>;
  createTaskFromCalendar: (taskData: any) => Promise<any>;

  // 🔍 UTILITAIRES
  loadDayData: (date: string) => Promise<CalendarViewDto>;
  refreshCalendarData: () => Promise<void>;
}

export const useCalendar = (): UseCalendarReturn => {
  // 📅 ÉTAT DE NAVIGATION (comme currentNotebook dans Notes)
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date().getMonth() + 1
  );
  const [currentYear, setCurrentYear] = useState(() =>
    new Date().getFullYear()
  );

  // 📊 DONNÉES
  const [events, setEvents] = useState<EventDto[]>([]);
  const [monthViewData, setMonthViewData] = useState<
    Record<string, CalendarViewDto[]>
  >({});

  // ⚡ ÉTATS DE CHARGEMENT
  const [loading, setLoading] = useState({
    events: false,
    monthView: false,
    dayView: false,
  });
  const [error, setError] = useState<string | null>(null);

  // 🔑 CLÉS DE CACHE (comme dans ton ancien système)
  const getMonthKey = useCallback(
    (month: number, year: number) =>
      `${year}-${month.toString().padStart(2, "0")}`,
    []
  );

  const currentMonthKey = getMonthKey(currentMonth, currentYear);
  const currentMonthData = monthViewData[currentMonthKey] || [];

  // 🧭 NAVIGATION (exactement comme setCurrentNotebook dans Notes)
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

      // ✅ Cache check comme dans ton ancien code
      if (monthViewData[monthKey]) {
        console.log("✅ Données du mois déjà en cache");
        return;
      }

      console.log("🌐 Chargement du mois:", { month, year, monthKey });

      setLoading((prev) => ({ ...prev, monthView: true }));
      setError(null);

      try {
        const data = await calendarApi.getMonthView(year, month);
        console.log("📥 Données reçues de l'API:", data);

        setMonthViewData((prev) => ({
          ...prev,
          [monthKey]: data,
        }));
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement du mois";
        setError(errorMsg);
        console.error("❌ Erreur chargement mois:", err);
      } finally {
        setLoading((prev) => ({ ...prev, monthView: false }));
      }
    },
    [monthViewData, getMonthKey]
  );

  const loadDayData = useCallback(
    async (date: string): Promise<CalendarViewDto> => {
      setLoading((prev) => ({ ...prev, dayView: true }));
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
        setLoading((prev) => ({ ...prev, dayView: false }));
      }
    },
    []
  );

  // 📝 ACTIONS CRUD (comme createNote, deleteNote)
  const createEvent = useCallback(
    async (eventData: CreateEventRequest): Promise<EventDto> => {
      try {
        const newEvent = await calendarApi.createEvent(eventData);
        setEvents((prev) => [newEvent, ...prev]);

        // ♻️ Recharger les données du mois courant
        const currentKey = getMonthKey(currentMonth, currentYear);
        setMonthViewData((prev) => {
          const newData = { ...prev };
          delete newData[currentKey]; // Force le rechargement
          return newData;
        });
        await loadMonthData(currentMonth, currentYear);

        return newEvent;
      } catch (err) {
        console.error("❌ Erreur création événement:", err);
        throw err;
      }
    },
    [currentMonth, currentYear, getMonthKey, loadMonthData]
  );

  const updateEvent = useCallback(
    async (id: number, eventData: CreateEventRequest): Promise<EventDto> => {
      try {
        const updatedEvent = await calendarApi.updateEvent(id, eventData);
        setEvents((prev) =>
          prev.map((event) => (event.id === id ? updatedEvent : event))
        );

        // ♻️ Recharger les données du mois courant
        const currentKey = getMonthKey(currentMonth, currentYear);
        setMonthViewData((prev) => {
          const newData = { ...prev };
          delete newData[currentKey];
          return newData;
        });
        await loadMonthData(currentMonth, currentYear);

        return updatedEvent;
      } catch (err) {
        console.error("❌ Erreur mise à jour événement:", err);
        throw err;
      }
    },
    [currentMonth, currentYear, getMonthKey, loadMonthData]
  );

  const deleteEvent = useCallback(
    async (id: number): Promise<void> => {
      try {
        await calendarApi.deleteEvent(id);
        setEvents((prev) => prev.filter((event) => event.id !== id));

        // ♻️ Recharger les données du mois courant
        const currentKey = getMonthKey(currentMonth, currentYear);
        setMonthViewData((prev) => {
          const newData = { ...prev };
          delete newData[currentKey];
          return newData;
        });
        await loadMonthData(currentMonth, currentYear);
      } catch (err) {
        console.error("❌ Erreur suppression événement:", err);
        throw err;
      }
    },
    [currentMonth, currentYear, getMonthKey, loadMonthData]
  );

  const createTaskFromCalendar = useCallback(
    async (taskData: any) => {
      try {
        const newTask = await calendarApi.createTaskFromCalendar(taskData);

        // ♻️ Recharger les données du mois courant
        const currentKey = getMonthKey(currentMonth, currentYear);
        setMonthViewData((prev) => {
          const newData = { ...prev };
          delete newData[currentKey];
          return newData;
        });
        await loadMonthData(currentMonth, currentYear);

        return newTask;
      } catch (err) {
        console.error("❌ Erreur création tâche depuis calendrier:", err);
        throw err;
      }
    },
    [currentMonth, currentYear, getMonthKey, loadMonthData]
  );

  // 🔄 RECHARGEMENT COMPLET
  const refreshCalendarData = useCallback(async () => {
    // Vider le cache et recharger
    setMonthViewData({});
    await loadMonthData(currentMonth, currentYear);
  }, [currentMonth, currentYear, loadMonthData]);

  // 🎣 EFFETS - Charger automatiquement quand le mois change
  useEffect(() => {
    loadMonthData(currentMonth, currentYear);
  }, [currentMonth, currentYear, loadMonthData]);

  // 🎣 EFFET - Charger les événements au début
  useEffect(() => {
    const loadAllEvents = async () => {
      setLoading((prev) => ({ ...prev, events: true }));
      try {
        const eventsData = await calendarApi.getAllEvents();
        setEvents(eventsData);
      } catch (err) {
        console.error("❌ Erreur chargement événements:", err);
      } finally {
        setLoading((prev) => ({ ...prev, events: false }));
      }
    };

    loadAllEvents();
  }, []);

  return {
    // 📅 ÉTAT DE NAVIGATION
    currentMonth,
    currentYear,

    // 📊 DONNÉES
    events,
    currentMonthData,

    // ⚡ ÉTATS DE CHARGEMENT
    loading,
    error,

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
