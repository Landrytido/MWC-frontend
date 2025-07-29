import { useCallback } from "react";
import { useCalendar } from "./useCalendar";

export const useCalendarNavigation = () => {
  const { state, setCurrentMonth, setCurrentYear } = useCalendar();

  const navigateToMonth = useCallback(
    (month: number, year: number) => {
      setCurrentMonth(month);
      setCurrentYear(year);
    },
    [setCurrentMonth, setCurrentYear]
  );

  const navigateToPreviousMonth = useCallback(() => {
    if (state.currentMonth === 1) {
      navigateToMonth(12, state.currentYear - 1);
    } else {
      navigateToMonth(state.currentMonth - 1, state.currentYear);
    }
  }, [state.currentMonth, state.currentYear, navigateToMonth]);

  const navigateToNextMonth = useCallback(() => {
    if (state.currentMonth === 12) {
      navigateToMonth(1, state.currentYear + 1);
    } else {
      navigateToMonth(state.currentMonth + 1, state.currentYear);
    }
  }, [state.currentMonth, state.currentYear, navigateToMonth]);

  const navigateToToday = useCallback(() => {
    const today = new Date();
    navigateToMonth(today.getMonth() + 1, today.getFullYear());
  }, [navigateToMonth]);

  const isCurrentMonth = useCallback(
    (month: number, year: number) => {
      return state.currentMonth === month && state.currentYear === year;
    },
    [state.currentMonth, state.currentYear]
  );

  const isToday = useCallback((date: string): boolean => {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];
    return date === todayString;
  }, []);

  const getMonthName = useCallback((month: number): string => {
    const monthNames = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];
    return monthNames[month - 1] || "";
  }, []);

  const getCurrentMonthName = useCallback((): string => {
    return getMonthName(state.currentMonth);
  }, [state.currentMonth, getMonthName]);

  const createCalendarGrid = useCallback(() => {
    const year = state.currentYear;
    const month = state.currentMonth;

    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const days = [];

    for (let i = adjustedStartDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, -i);
      const dateString = date.toISOString().split("T")[0];
      days.push({
        date: dateString,
        isCurrentMonth: false,
        dayNumber: date.getDate(),
      });
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month - 1, day, 12, 0, 0); // Force midi pour éviter timezone
      const dateString = date.toISOString().split("T")[0];
      days.push({
        date: dateString,
        isCurrentMonth: true,
        dayNumber: day,
      });
    }

    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split("T")[0];
      days.push({
        date: dateString,
        isCurrentMonth: false,
        dayNumber: day,
      });
    }

    return days;
  }, [state.currentMonth, state.currentYear]);

  return {
    currentMonth: state.currentMonth,
    currentYear: state.currentYear,

    navigateToMonth,
    navigateToPreviousMonth,
    navigateToNextMonth,
    navigateToToday,

    isCurrentMonth,
    isToday,
    getMonthName,
    getCurrentMonthName,
    createCalendarGrid,
  };
};
