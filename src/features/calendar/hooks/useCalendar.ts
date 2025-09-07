import { useState, useEffect, useCallback } from "react";
import { calendarApi } from "../api";
import {
  EventDto,
  CalendarViewDto,
  CreateEventRequest,
  TaskDto,
} from "../types";

interface UseCalendarReturn {
  events: EventDto[];
  currentMonthData: CalendarViewDto[];

  currentMonth: number;
  currentYear: number;

  error: string | null;
  loadingStates: {
    events: boolean;
    monthView: boolean;
    dayView: boolean;
  };

  navigateToPreviousMonth: () => void;
  navigateToNextMonth: () => void;
  navigateToToday: () => void;
  navigateToMonth: (month: number, year: number) => void;

  createEvent: (eventData: CreateEventRequest) => Promise<EventDto>;
  updateEvent: (id: number, eventData: CreateEventRequest) => Promise<EventDto>;
  deleteEvent: (id: number) => Promise<void>;
  createTaskFromCalendar: (taskData: CreateEventRequest) => Promise<TaskDto>;

  loadDayData: (date: string) => Promise<CalendarViewDto>;
  refreshCalendarData: () => Promise<void>;
}

export const useCalendar = (): UseCalendarReturn => {
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date().getMonth() + 1
  );
  const [currentYear, setCurrentYear] = useState(() =>
    new Date().getFullYear()
  );

  const [events, setEvents] = useState<EventDto[]>([]);
  const [currentMonthData, setCurrentMonthData] = useState<CalendarViewDto[]>(
    []
  );

  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    events: false,
    monthView: false,
    dayView: false,
  });

  const [lastLoadedMonth, setLastLoadedMonth] = useState<string | null>(null);

  const getMonthKey = useCallback(
    (month: number, year: number) =>
      `${year}-${month.toString().padStart(2, "0")}`,
    []
  );

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

  const loadMonthData = useCallback(
    async (month: number, year: number) => {
      const monthKey = getMonthKey(month, year);

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

  const createEvent = useCallback(
    async (eventData: CreateEventRequest): Promise<EventDto> => {
      try {
        const newEvent = await calendarApi.createEvent(eventData);
        setEvents((prev) => [newEvent, ...prev]);

        setLastLoadedMonth(null);
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

  const createTaskFromCalendar = useCallback(
    async (taskData: CreateEventRequest): Promise<TaskDto> => {
      try {
        const newTask = await calendarApi.createTaskFromCalendar(taskData);

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

  const refreshCalendarData = useCallback(async () => {
    setLastLoadedMonth(null);
    await loadMonthData(currentMonth, currentYear);
  }, [currentMonth, currentYear, loadMonthData]);

  useEffect(() => {
    loadMonthData(currentMonth, currentYear);
  }, [currentMonth, currentYear, loadMonthData]);

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
    events,
    currentMonthData,

    currentMonth,
    currentYear,

    error,
    loadingStates,

    navigateToPreviousMonth,
    navigateToNextMonth,
    navigateToToday,
    navigateToMonth,

    createEvent,
    updateEvent,
    deleteEvent,
    createTaskFromCalendar,

    loadDayData,
    refreshCalendarData,
  };
};
