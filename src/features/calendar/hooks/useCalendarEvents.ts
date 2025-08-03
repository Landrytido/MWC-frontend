import { useCallback, useEffect } from "react";
import { useCalendar } from "./useCalendar";
import { calendarApi } from "../api";
import { EventDto, CreateEventRequest, CalendarViewDto } from "../types";

export const useCalendarEvents = () => {
  const {
    state,
    setLoading,
    setEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    setMonthViewData,
    getMonthKey,
    currentMonthData,
  } = useCalendar();

  // ✅ Chargement initial des événements
  const loadAllEvents = useCallback(async () => {
    if (state.events.length > 0) return; // Éviter de recharger inutilement

    setLoading("events", { isLoading: true });
    try {
      const events = await calendarApi.getAllEvents();
      setEvents(events);
    } catch (error) {
      setLoading("events", {
        isLoading: false,
        error: "Erreur lors du chargement des événements",
      });
      console.error("Erreur chargement événements:", error);
    } finally {
      setLoading("events", { isLoading: false });
    }
  }, [state.events.length, setLoading, setEvents]);

  // ✅ Chargement des données d'un mois
  const loadMonthData = useCallback(
    async (month: number, year: number) => {
      const monthKey = getMonthKey(month, year);

      // Vérifier si on a déjà les données
      if (state.monthViewData[monthKey]) return;

      setLoading("monthView", { isLoading: true });
      try {
        const monthData = await calendarApi.getMonthView(year, month);
        setMonthViewData(monthKey, monthData);
      } catch (error) {
        setLoading("monthView", {
          isLoading: false,
          error: "Erreur lors du chargement du mois",
        });
        console.error("Erreur chargement mois:", error);
      } finally {
        setLoading("monthView", { isLoading: false });
      }
    },
    [state.monthViewData, getMonthKey, setLoading, setMonthViewData]
  );

  // ✅ Chargement des données d'un jour
  const loadDayData = useCallback(
    async (date: string): Promise<CalendarViewDto | null> => {
      setLoading("dayView", { isLoading: true });
      try {
        const dayData = await calendarApi.getDayView(date);
        setLoading("dayView", { isLoading: false });
        return dayData;
      } catch (error) {
        setLoading("dayView", {
          isLoading: false,
          error: "Erreur lors du chargement du jour",
        });
        console.error("Erreur chargement jour:", error);
        return null;
      }
    },
    [setLoading]
  );

  // ✅ Création d'événement
  const createEvent = useCallback(
    async (eventData: CreateEventRequest): Promise<EventDto | null> => {
      try {
        const newEvent = await calendarApi.createEvent(eventData);
        addEvent(newEvent);

        // Recharger les données du mois pour mettre à jour la vue
        await loadMonthData(state.currentMonth, state.currentYear);

        return newEvent;
      } catch (error) {
        console.error("Erreur création événement:", error);
        throw error;
      }
    },
    [addEvent, loadMonthData, state.currentMonth, state.currentYear]
  );

  // ✅ Mise à jour d'événement
  const updateEventById = useCallback(
    async (
      id: number,
      eventData: CreateEventRequest
    ): Promise<EventDto | null> => {
      try {
        const updatedEvent = await calendarApi.updateEvent(id, eventData);
        updateEvent(id, updatedEvent);

        // Recharger les données du mois
        await loadMonthData(state.currentMonth, state.currentYear);

        return updatedEvent;
      } catch (error) {
        console.error("Erreur mise à jour événement:", error);
        throw error;
      }
    },
    [updateEvent, loadMonthData, state.currentMonth, state.currentYear]
  );

  // ✅ Suppression d'événement
  const deleteEventById = useCallback(
    async (id: number): Promise<void> => {
      try {
        await calendarApi.deleteEvent(id);
        deleteEvent(id);

        // Recharger les données du mois
        await loadMonthData(state.currentMonth, state.currentYear);
      } catch (error) {
        console.error("Erreur suppression événement:", error);
        throw error;
      }
    },
    [deleteEvent, loadMonthData, state.currentMonth, state.currentYear]
  );

  // ✅ Création de tâche depuis le calendrier
  const createTaskFromCalendar = useCallback(
    async (taskData: {
      title: string;
      description?: string;
      scheduledDate?: string;
      dueDate?: string;
      priority?: number;
    }) => {
      try {
        const newTask = await calendarApi.createTaskFromCalendar(taskData);

        // Recharger les données pour inclure la nouvelle tâche
        await loadMonthData(state.currentMonth, state.currentYear);

        return newTask;
      } catch (error) {
        console.error("Erreur création tâche depuis calendrier:", error);
        throw error;
      }
    },
    [loadMonthData, state.currentMonth, state.currentYear]
  );

  // ✅ Recherche d'événements
  const searchEvents = useCallback(
    async (query: string): Promise<EventDto[]> => {
      try {
        return await calendarApi.searchEvents(query);
      } catch (error) {
        console.error("Erreur recherche événements:", error);
        return [];
      }
    },
    []
  );

  // ✅ Récupération d'événements dans une plage de dates
  const getEventsInRange = useCallback(
    async (startDate: string, endDate: string): Promise<EventDto[]> => {
      try {
        return await calendarApi.getEventsInRange(startDate, endDate);
      } catch (error) {
        console.error("Erreur récupération événements par période:", error);
        return [];
      }
    },
    []
  );

  // ✅ Récupération d'un événement par ID
  const getEventById = useCallback(
    (id: number): EventDto | undefined => {
      return state.events.find((event) => event.id === id);
    },
    [state.events]
  );

  // ✅ Récupération des événements pour une date donnée
  const getEventsForDate = useCallback(
    (date: string): EventDto[] => {
      return state.events.filter((event) => {
        const eventDate = new Date(event.startDate).toISOString().split("T")[0];
        return eventDate === date;
      });
    },
    [state.events]
  );

  // ✅ NOUVEAU : Rafraîchissement forcé des données
  const refreshCalendarData = useCallback(async () => {
    await Promise.all([
      loadAllEvents(),
      loadMonthData(state.currentMonth, state.currentYear),
    ]);
  }, [loadAllEvents, loadMonthData, state.currentMonth, state.currentYear]);

  // ✅ NOUVEAU : Nettoyage du cache
  const clearCache = useCallback(() => {
    // Cette méthode devrait être ajoutée au contexte useCalendar
    // dispatch({ type: "CLEAR_CACHE" });
  }, []);

  // ✅ Effets pour le chargement initial
  useEffect(() => {
    loadAllEvents();
  }, [loadAllEvents]);

  useEffect(() => {
    loadMonthData(state.currentMonth, state.currentYear);
  }, [state.currentMonth, state.currentYear, loadMonthData]);

  // ✅ Interface de retour complète
  return {
    // États
    events: state.events,
    filteredEvents: state.filteredEvents,
    currentMonthData,
    loadingStates: state.loadingStates,

    // Chargement des données
    loadAllEvents,
    loadMonthData,
    loadDayData,

    // CRUD Événements
    createEvent,
    updateEvent: updateEventById,
    deleteEvent: deleteEventById,

    // Tâches
    createTaskFromCalendar,

    // Recherche et filtrage
    searchEvents,
    getEventsInRange,
    getEventById,
    getEventsForDate,

    // Utilitaires
    refreshCalendarData,
    clearCache,
  };
};
