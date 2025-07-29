import { useReducer, useCallback } from "react";
import { CalendarState, CalendarAction } from "../types";

const initialState: CalendarState = {
  events: [],
  monthViewData: {},
  selectedDate: null,
  currentMonth: new Date().getMonth() + 1, // JavaScript: 0-11, API: 1-12
  currentYear: new Date().getFullYear(),
  filterType: "all",

  loadingStates: {
    events: { isLoading: false },
    monthView: { isLoading: false },
    dayView: { isLoading: false },
  },
};

function calendarReducer(
  state: CalendarState,
  action: CalendarAction
): CalendarState {
  switch (action.type) {
    case "SET_EVENTS":
      return { ...state, events: action.payload };

    case "ADD_EVENT":
      return { ...state, events: [action.payload, ...state.events] };

    case "UPDATE_EVENT":
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.id ? action.payload.event : event
        ),
      };

    case "DELETE_EVENT":
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload),
      };

    case "SET_MONTH_VIEW_DATA":
      return {
        ...state,
        monthViewData: {
          ...state.monthViewData,
          [action.payload.key]: action.payload.data,
        },
      };

    case "SET_SELECTED_DATE":
      return { ...state, selectedDate: action.payload };

    case "SET_CURRENT_MONTH":
      return { ...state, currentMonth: action.payload };

    case "SET_CURRENT_YEAR":
      return { ...state, currentYear: action.payload };

    case "SET_FILTER_TYPE":
      return { ...state, filterType: action.payload };

    case "SET_LOADING":
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [action.payload.key]: action.payload.loading,
        },
      };

    case "CLEAR_MONTH_VIEW_DATA":
      return { ...state, monthViewData: {} };

    default:
      return state;
  }
}

export const useCalendar = () => {
  const [state, dispatch] = useReducer(calendarReducer, initialState);

  const setLoading = useCallback(
    (
      key: keyof CalendarState["loadingStates"],
      loading: { isLoading: boolean; error?: string }
    ) => {
      dispatch({ type: "SET_LOADING", payload: { key, loading } });
    },
    []
  );

  const setEvents = useCallback((events: typeof state.events) => {
    dispatch({ type: "SET_EVENTS", payload: events });
  }, []);

  const addEvent = useCallback((event: (typeof state.events)[0]) => {
    dispatch({ type: "ADD_EVENT", payload: event });
  }, []);

  const updateEvent = useCallback(
    (id: number, event: (typeof state.events)[0]) => {
      dispatch({ type: "UPDATE_EVENT", payload: { id, event } });
    },
    []
  );

  const deleteEvent = useCallback((id: number) => {
    dispatch({ type: "DELETE_EVENT", payload: id });
  }, []);

  const setMonthViewData = useCallback(
    (key: string, data: (typeof state.monthViewData)[string]) => {
      dispatch({ type: "SET_MONTH_VIEW_DATA", payload: { key, data } });
    },
    []
  );

  const setSelectedDate = useCallback((date: string | null) => {
    dispatch({ type: "SET_SELECTED_DATE", payload: date });
  }, []);

  const setCurrentMonth = useCallback((month: number) => {
    dispatch({ type: "SET_CURRENT_MONTH", payload: month });
  }, []);

  const setCurrentYear = useCallback((year: number) => {
    dispatch({ type: "SET_CURRENT_YEAR", payload: year });
  }, []);

  const setFilterType = useCallback((filterType: typeof state.filterType) => {
    dispatch({ type: "SET_FILTER_TYPE", payload: filterType });
  }, []);

  const clearMonthViewData = useCallback(() => {
    dispatch({ type: "CLEAR_MONTH_VIEW_DATA" });
  }, []);

  const filteredEvents = state.events.filter((event) => {
    if (state.filterType === "events") return event.type === "EVENT";
    if (state.filterType === "tasks") return event.type === "TASK_BASED";
    return true;
  });

  const getMonthKey = useCallback(
    (month: number, year: number) =>
      `${year}-${month.toString().padStart(2, "0")}`,
    []
  );

  const getCurrentMonthData = useCallback(() => {
    const key = getMonthKey(state.currentMonth, state.currentYear);
    return state.monthViewData[key] || [];
  }, [state.currentMonth, state.currentYear, state.monthViewData, getMonthKey]);

  return {
    state,

    filteredEvents,
    currentMonthData: getCurrentMonthData(),
    getMonthKey,

    setLoading,
    setEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    setMonthViewData,
    setSelectedDate,
    setCurrentMonth,
    setCurrentYear,
    setFilterType,
    clearMonthViewData,
  };
};
