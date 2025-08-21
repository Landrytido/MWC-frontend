// import React, { createContext, useContext, useReducer, ReactNode } from "react";
// import { EventDto, CalendarViewDto } from "./types";
// import { LoadingState } from "../../shared/types/common";

// interface CalendarState {
//   events: EventDto[];
//   monthViewData: Record<string, CalendarViewDto[]>; // key: "2025-01" pour janvier 2025
//   selectedDate: string | null;
//   currentMonth: number;
//   currentYear: number;
//   filterType: "all" | "events" | "tasks";

//   loadingStates: {
//     events: LoadingState;
//     monthView: LoadingState;
//     dayView: LoadingState;
//   };
// }

// type CalendarAction =
//   | { type: "SET_EVENTS"; payload: EventDto[] }
//   | { type: "ADD_EVENT"; payload: EventDto }
//   | { type: "UPDATE_EVENT"; payload: { id: number; event: EventDto } }
//   | { type: "DELETE_EVENT"; payload: number }
//   | {
//       type: "SET_MONTH_VIEW_DATA";
//       payload: { key: string; data: CalendarViewDto[] };
//     }
//   | { type: "SET_SELECTED_DATE"; payload: string | null }
//   | { type: "SET_CURRENT_MONTH"; payload: number }
//   | { type: "SET_CURRENT_YEAR"; payload: number }
//   | { type: "SET_VIEW_MODE"; payload: "month" | "week" | "day" }
//   | { type: "SET_FILTER_TYPE"; payload: "all" | "events" | "tasks" }
//   | {
//       type: "SET_LOADING";
//       payload: {
//         key: keyof CalendarState["loadingStates"];
//         loading: LoadingState;
//       };
//     }
//   | { type: "CLEAR_MONTH_VIEW_DATA" };

// const initialState: CalendarState = {
//   events: [],
//   monthViewData: {},
//   selectedDate: null,
//   currentMonth: new Date().getMonth() + 1, // JavaScript: 0-11, API: 1-12
//   currentYear: new Date().getFullYear(),
//   filterType: "all",

//   loadingStates: {
//     events: { isLoading: false },
//     monthView: { isLoading: false },
//     dayView: { isLoading: false },
//   },
// };

// function calendarReducer(
//   state: CalendarState,
//   action: CalendarAction
// ): CalendarState {
//   switch (action.type) {
//     case "SET_EVENTS":
//       return { ...state, events: action.payload };

//     case "ADD_EVENT":
//       return { ...state, events: [action.payload, ...state.events] };

//     case "UPDATE_EVENT":
//       return {
//         ...state,
//         events: state.events.map((event) =>
//           event.id === action.payload.id ? action.payload.event : event
//         ),
//       };

//     case "DELETE_EVENT":
//       return {
//         ...state,
//         events: state.events.filter((event) => event.id !== action.payload),
//       };

//     case "SET_MONTH_VIEW_DATA":
//       return {
//         ...state,
//         monthViewData: {
//           ...state.monthViewData,
//           [action.payload.key]: action.payload.data,
//         },
//       };

//     case "SET_SELECTED_DATE":
//       return { ...state, selectedDate: action.payload };

//     case "SET_CURRENT_MONTH":
//       return { ...state, currentMonth: action.payload };

//     case "SET_CURRENT_YEAR":
//       return { ...state, currentYear: action.payload };

//     case "SET_FILTER_TYPE":
//       return { ...state, filterType: action.payload };

//     case "SET_LOADING":
//       return {
//         ...state,
//         loadingStates: {
//           ...state.loadingStates,
//           [action.payload.key]: action.payload.loading,
//         },
//       };

//     case "CLEAR_MONTH_VIEW_DATA":
//       return { ...state, monthViewData: {} };

//     default:
//       return state;
//   }
// }

// const CalendarContext = createContext<
//   | {
//       state: CalendarState;
//       dispatch: React.Dispatch<CalendarAction>;
//     }
//   | undefined
// >(undefined);

// interface CalendarProviderProps {
//   children: ReactNode;
// }

// export const CalendarProvider: React.FC<CalendarProviderProps> = ({
//   children,
// }) => {
//   const [state, dispatch] = useReducer(calendarReducer, initialState);

//   return (
//     <CalendarContext.Provider value={{ state, dispatch }}>
//       {children}
//     </CalendarContext.Provider>
//   );
// };

// export const useCalendar = () => {
//   const context = useContext(CalendarContext);
//   if (context === undefined) {
//     throw new Error("useCalendar must be used within a CalendarProvider");
//   }
//   return context;
// };
// export const useCalendarEvents = () => {
//   const { state } = useCalendar();
//   return {
//     events: state.events,
//     filteredEvents: state.events.filter((event) => {
//       if (state.filterType === "events") return event.type === "EVENT";
//       if (state.filterType === "tasks") return event.type === "TASK_BASED";
//       return true;
//     }),
//     loading: state.loadingStates.events,
//   };
// };

// export const useCalendarNavigation = () => {
//   const { state, dispatch } = useCalendar();

//   const navigateToMonth = (month: number, year: number) => {
//     dispatch({ type: "SET_CURRENT_MONTH", payload: month });
//     dispatch({ type: "SET_CURRENT_YEAR", payload: year });
//   };

//   const navigateToPreviousMonth = () => {
//     if (state.currentMonth === 1) {
//       navigateToMonth(12, state.currentYear - 1);
//     } else {
//       navigateToMonth(state.currentMonth - 1, state.currentYear);
//     }
//   };

//   const navigateToNextMonth = () => {
//     if (state.currentMonth === 12) {
//       navigateToMonth(1, state.currentYear + 1);
//     } else {
//       navigateToMonth(state.currentMonth + 1, state.currentYear);
//     }
//   };

//   const navigateToToday = () => {
//     const today = new Date();
//     navigateToMonth(today.getMonth() + 1, today.getFullYear());
//   };

//   return {
//     currentMonth: state.currentMonth,
//     currentYear: state.currentYear,
//     navigateToMonth,
//     navigateToPreviousMonth,
//     navigateToNextMonth,
//     navigateToToday,
//   };
// };

// export const useMonthViewData = () => {
//   const { state } = useCalendar();

//   const getMonthKey = (month: number, year: number) =>
//     `${year}-${month.toString().padStart(2, "0")}`;

//   const getCurrentMonthData = () => {
//     const key = getMonthKey(state.currentMonth, state.currentYear);
//     return state.monthViewData[key] || [];
//   };

//   return {
//     monthViewData: state.monthViewData,
//     currentMonthData: getCurrentMonthData(),
//     loading: state.loadingStates.monthView,
//     getMonthKey,
//   };
// };
