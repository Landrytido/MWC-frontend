import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { UIState, LoadingState } from "../types/common";
import { TimerState } from "../../features/tools/types/timer";
import { TimerService } from "../../features/tools/services/timerService";

interface AppState {
  ui: UIState & {
    selectedLabels: string[];
    currentNotebook: number | null;
  };

  globalLoadingStates: {
    initializing: LoadingState;
    syncData: LoadingState;
  };

  timer: TimerState;
}

type AppAction =
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_CURRENT_NOTEBOOK"; payload: number | null }
  | { type: "SET_SELECTED_LABELS"; payload: string[] }
  | { type: "SET_SEARCH_TERM"; payload: string }
  | { type: "SET_VIEW_MODE"; payload: "grid" | "list" | "compact" }
  | { type: "SET_THEME"; payload: "light" | "dark" | "auto" }
  | { type: "RESET_FILTERS" }
  | { type: "CLEAR_ALL_SEARCH_TERMS" }
  | {
      type: "SET_GLOBAL_LOADING";
      payload: {
        key: keyof AppState["globalLoadingStates"];
        loading: LoadingState;
      };
    }
  | { type: "UPDATE_TIMER"; payload: Partial<TimerState> }
  | { type: "RESET_TIMER" };

const initialState: AppState = {
  ui: {
    sidebarCollapsed: false,
    searchTerm: "",
    currentView: "grid",
    theme: "light",
    selectedLabels: [],
    currentNotebook: null,
  },

  globalLoadingStates: {
    initializing: { isLoading: false },
    syncData: { isLoading: false },
  },

  timer: {
    mode: "stopwatch",
    isRunning: false,
    isPaused: false,
    time: 0,
    targetTime: 0,
    startTime: null,
    pausedTime: 0,
    laps: [],
  },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "TOGGLE_SIDEBAR":
      return {
        ...state,
        ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed },
      };

    case "SET_CURRENT_NOTEBOOK":
      return {
        ...state,
        ui: { ...state.ui, currentNotebook: action.payload },
      };

    case "SET_SELECTED_LABELS":
      return {
        ...state,
        ui: { ...state.ui, selectedLabels: action.payload },
      };

    case "SET_SEARCH_TERM":
      return {
        ...state,
        ui: { ...state.ui, searchTerm: action.payload },
      };

    case "SET_VIEW_MODE":
      return {
        ...state,
        ui: { ...state.ui, currentView: action.payload },
      };

    case "SET_THEME":
      return {
        ...state,
        ui: { ...state.ui, theme: action.payload },
      };

    case "RESET_FILTERS":
      return {
        ...state,
        ui: {
          ...state.ui,
          currentNotebook: null,
          selectedLabels: [],
          searchTerm: "",
        },
      };

    case "CLEAR_ALL_SEARCH_TERMS":
      return {
        ...state,
        ui: {
          ...state.ui,
          searchTerm: "",
        },
      };

    case "SET_GLOBAL_LOADING":
      return {
        ...state,
        globalLoadingStates: {
          ...state.globalLoadingStates,
          [action.payload.key]: action.payload.loading,
        },
      };

    case "UPDATE_TIMER":
      return {
        ...state,
        timer: {
          ...state.timer,
          ...action.payload,
        },
      };

    case "RESET_TIMER":
      return {
        ...state,
        timer: {
          mode: "stopwatch",
          isRunning: false,
          isPaused: false,
          time: 0,
          targetTime: 0,
          startTime: null,
          pausedTime: 0,
          laps: [],
        },
      };

    default:
      return state;
  }
}

const AppContext = createContext<
  | {
      state: AppState;
      dispatch: React.Dispatch<AppAction>;
    }
  | undefined
>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Keep a ref to the latest timer state so the interval closure never goes stale
  const timerRef = useRef(state.timer);
  timerRef.current = state.timer;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.timer.isRunning) {
      intervalRef.current = setInterval(() => {
        const t = timerRef.current;
        if (!t.isRunning || t.startTime === null) return;

        const elapsed = Date.now() - t.startTime + t.pausedTime;

        if (t.mode === "stopwatch") {
          dispatch({ type: "UPDATE_TIMER", payload: { time: elapsed } });
        } else {
          const remaining = Math.max(0, t.targetTime - elapsed);

          if (remaining === 0 && t.time > 0) {
            // Countdown finished
            dispatch({
              type: "UPDATE_TIMER",
              payload: { time: 0, isRunning: false, startTime: null, pausedTime: 0 },
            });

            const settings = TimerService.getSettings();
            if (settings.soundEnabled) {
              TimerService.playAlarmSound();
            }
            if (settings.notificationsEnabled) {
              TimerService.showNotification(
                "Timer terminé !",
                `Le minuteur de ${TimerService.formatTimeCompact(t.targetTime)} est terminé.`
              );
            }
          } else {
            dispatch({ type: "UPDATE_TIMER", payload: { time: remaining } });
          }
        }
      }, 10);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.timer.isRunning]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export const useUI = () => {
  const { state, dispatch } = useApp();

  return {
    ui: state.ui,
    searchTerm: state.ui.searchTerm,
    selectedLabels: state.ui.selectedLabels,
    currentNotebook: state.ui.currentNotebook,
    toggleSidebar: () => dispatch({ type: "TOGGLE_SIDEBAR" }),
    setCurrentNotebook: (id: number | null) =>
      dispatch({ type: "SET_CURRENT_NOTEBOOK", payload: id }),
    setSelectedLabels: (labels: string[]) =>
      dispatch({ type: "SET_SELECTED_LABELS", payload: labels }),
    setSearchTerm: (term: string) =>
      dispatch({ type: "SET_SEARCH_TERM", payload: term }),
    setViewMode: (mode: "grid" | "list" | "compact") =>
      dispatch({ type: "SET_VIEW_MODE", payload: mode }),
    setTheme: (theme: "light" | "dark" | "auto") =>
      dispatch({ type: "SET_THEME", payload: theme }),
    resetFilters: () => dispatch({ type: "RESET_FILTERS" }),
    clearAllSearchTerms: () => dispatch({ type: "CLEAR_ALL_SEARCH_TERMS" }),
  };
};

export const useGlobalFilters = () => {
  const {
    ui,
    setCurrentNotebook,
    setSelectedLabels,
    setSearchTerm,
    resetFilters,
  } = useUI();

  return {
    currentNotebook: ui.currentNotebook,
    selectedLabels: ui.selectedLabels,
    searchTerm: ui.searchTerm,
    setCurrentNotebook,
    setSelectedLabels,
    setSearchTerm,
    resetFilters,
    hasActiveFilters: !!(
      ui.currentNotebook ||
      ui.selectedLabels.length > 0 ||
      ui.searchTerm
    ),
  };
};

export const useGlobalLoading = () => {
  const { state, dispatch } = useApp();

  const setGlobalLoading = (
    key: keyof AppState["globalLoadingStates"],
    loading: LoadingState
  ) => {
    dispatch({ type: "SET_GLOBAL_LOADING", payload: { key, loading } });
  };

  return {
    loadingStates: state.globalLoadingStates,
    setGlobalLoading,
  };
};

export const useGlobalTimer = () => {
  const { state, dispatch } = useApp();

  const updateTimer = (updates: Partial<TimerState>) => {
    dispatch({ type: "UPDATE_TIMER", payload: updates });
  };

  const resetTimer = () => {
    dispatch({ type: "RESET_TIMER" });
  };

  return {
    timer: state.timer,
    updateTimer,
    resetTimer,
  };
};

export type { AppState };
