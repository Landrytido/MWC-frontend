// Export des types
export * from "./types";

// Export de l'API
export { calendarApi } from "./api";

// Export du hook principal
export { useCalendar } from "./hooks/useCalendar";

// Export du composant principal
export { default as Calendar } from "./components/Calendar";

// Export des autres composants si nécessaire
export { default as CalendarHeader } from "./components/CalendarHeader";
export { default as CalendarGrid } from "./components/CalendarGrid";
export { default as EventModal } from "./components/EventModal";
export { default as DayDetailModal } from "./components/DayDetailModal";
export { default as EventsList } from "./components/EventsList";
