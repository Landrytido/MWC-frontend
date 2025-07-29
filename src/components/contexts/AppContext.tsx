import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { BlocNote, User, LoadingState } from "../types";
import { Notebook } from "../../features/notebooks";
import { Label } from "../../features/labels";
import { SavedLink, LinkGroup } from "../../features/links";
import { Task } from "../../features/tasks";

interface AppState {
  user: User | null;
  notebooks: Notebook[];
  labels: Label[];
  links: SavedLink[];
  linkGroups: LinkGroup[];
  tasks: Task[];
  blocNote: BlocNote | null;

  loadingStates: {
    notebooks: LoadingState;
    labels: LoadingState;
    links: LoadingState;
    tasks: LoadingState;
    dailyTasks: LoadingState;
    blocNote: LoadingState;
  };
  ui: {
    sidebarCollapsed: boolean;
    currentNotebook: number | null;
    selectedLabels: string[];
    searchTerm: string;
    taskSearchTerm: string;
    linkSearchTerm: string;
  };
}

type AppAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_NOTEBOOKS"; payload: Notebook[] }
  | { type: "ADD_NOTEBOOK"; payload: Notebook }
  | {
      type: "UPDATE_NOTEBOOK";
      payload: { id: number; notebook: Partial<Notebook> };
    }
  | { type: "DELETE_NOTEBOOK"; payload: number }
  | { type: "SET_LABELS"; payload: Label[] }
  | { type: "ADD_LABEL"; payload: Label }
  | { type: "UPDATE_LABEL"; payload: { id: string; label: Partial<Label> } }
  | { type: "DELETE_LABEL"; payload: string }
  | { type: "SET_LINKS"; payload: SavedLink[] }
  | { type: "ADD_LINK"; payload: SavedLink }
  | { type: "UPDATE_LINK"; payload: { id: number; link: Partial<SavedLink> } }
  | { type: "DELETE_LINK"; payload: number }
  | { type: "SET_LINK_GROUPS"; payload: LinkGroup[] }
  | { type: "ADD_LINK_GROUP"; payload: LinkGroup }
  | {
      type: "UPDATE_LINK_GROUP";
      payload: { id: string; linkGroup: Partial<LinkGroup> };
    }
  | { type: "DELETE_LINK_GROUP"; payload: string }
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: { id: number; task: Partial<Task> } }
  | { type: "DELETE_TASK"; payload: number }
  | { type: "TOGGLE_TASK"; payload: number }
  | { type: "SET_TASK_SEARCH_TERM"; payload: string }
  | { type: "SET_LINK_SEARCH_TERM"; payload: string }
  | { type: "CLEAR_ALL_SEARCH_TERMS" }
  | { type: "DELETE_DAILY_TASK"; payload: number }
  | { type: "SET_BLOC_NOTE"; payload: BlocNote | null }
  | { type: "UPDATE_BLOC_NOTE"; payload: { content: string } }
  | {
      type: "SET_LOADING";
      payload: { key: keyof AppState["loadingStates"]; loading: LoadingState };
    }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_CURRENT_NOTEBOOK"; payload: number | null }
  | { type: "SET_SELECTED_LABELS"; payload: string[] }
  | { type: "SET_SEARCH_TERM"; payload: string }
  | { type: "RESET_FILTERS" };

const initialState: AppState = {
  user: null,
  notebooks: [],
  labels: [],
  links: [],
  linkGroups: [],
  tasks: [],
  blocNote: null,

  loadingStates: {
    notebooks: { isLoading: false },
    labels: { isLoading: false },
    links: { isLoading: false },
    tasks: { isLoading: false },
    dailyTasks: { isLoading: false },
    blocNote: { isLoading: false },
  },

  ui: {
    sidebarCollapsed: false,
    currentNotebook: null,
    selectedLabels: [],
    searchTerm: "",
    taskSearchTerm: "",
    linkSearchTerm: "",
  },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };

    case "SET_NOTEBOOKS":
      return { ...state, notebooks: action.payload };

    case "ADD_NOTEBOOK":
      return { ...state, notebooks: [action.payload, ...state.notebooks] };

    case "UPDATE_NOTEBOOK":
      return {
        ...state,
        notebooks: state.notebooks.map((notebook) =>
          notebook.id === action.payload.id
            ? { ...notebook, ...action.payload.notebook }
            : notebook
        ),
      };

    case "DELETE_NOTEBOOK":
      return {
        ...state,
        notebooks: state.notebooks.filter(
          (notebook) => notebook.id !== action.payload
        ),
      };

    case "SET_LABELS":
      return { ...state, labels: action.payload };

    case "ADD_LABEL":
      return { ...state, labels: [action.payload, ...state.labels] };

    case "UPDATE_LABEL":
      return {
        ...state,
        labels: state.labels.map((label) =>
          label.id === action.payload.id
            ? { ...label, ...action.payload.label }
            : label
        ),
      };

    case "DELETE_LABEL":
      return {
        ...state,
        labels: state.labels.filter((label) => label.id !== action.payload),
      };

    case "SET_LINKS":
      return { ...state, links: action.payload };

    case "ADD_LINK":
      return { ...state, links: [action.payload, ...state.links] };

    case "UPDATE_LINK":
      return {
        ...state,
        links: state.links.map((link) =>
          link.id === action.payload.id
            ? { ...link, ...action.payload.link }
            : link
        ),
      };

    case "DELETE_LINK":
      return {
        ...state,
        links: state.links.filter((link) => link.id !== action.payload),
      };

    case "SET_LINK_GROUPS":
      return { ...state, linkGroups: action.payload };

    case "ADD_LINK_GROUP":
      return { ...state, linkGroups: [action.payload, ...state.linkGroups] };

    case "UPDATE_LINK_GROUP":
      return {
        ...state,
        linkGroups: state.linkGroups.map((group) =>
          group.id === action.payload.id
            ? { ...group, ...action.payload.linkGroup }
            : group
        ),
      };

    case "DELETE_LINK_GROUP":
      return {
        ...state,
        linkGroups: state.linkGroups.filter(
          (group) => group.id !== action.payload
        ),
      };

    case "SET_TASKS":
      return { ...state, tasks: action.payload };

    case "ADD_TASK":
      return { ...state, tasks: [action.payload, ...state.tasks] };

    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.task }
            : task
        ),
      };

    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };

    case "TOGGLE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? { ...task, completed: !task.completed }
            : task
        ),
      };

    case "SET_BLOC_NOTE":
      return { ...state, blocNote: action.payload };

    case "UPDATE_BLOC_NOTE":
      return {
        ...state,
        blocNote: state.blocNote
          ? { ...state.blocNote, content: action.payload.content }
          : null,
      };

    case "SET_LOADING":
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [action.payload.key]: action.payload.loading,
        },
      };

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

    case "RESET_FILTERS":
      return {
        ...state,
        ui: {
          ...state.ui,
          currentNotebook: null,
          selectedLabels: [],
          searchTerm: "",
          taskSearchTerm: "",
          linkSearchTerm: "",
        },
      };

    case "SET_TASK_SEARCH_TERM":
      return {
        ...state,
        ui: { ...state.ui, taskSearchTerm: action.payload },
      };

    case "SET_LINK_SEARCH_TERM":
      return {
        ...state,
        ui: { ...state.ui, linkSearchTerm: action.payload },
      };

    case "CLEAR_ALL_SEARCH_TERMS":
      return {
        ...state,
        ui: {
          ...state.ui,
          searchTerm: "",
          taskSearchTerm: "",
          linkSearchTerm: "",
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

export const useNotebooks = () => {
  const { state } = useApp();
  return {
    notebooks: state.notebooks,
    loading: state.loadingStates.notebooks,
  };
};

export const useLabels = () => {
  const { state } = useApp();
  return {
    labels: state.labels,
    loading: state.loadingStates.labels,
  };
};

export const useLinks = () => {
  const { state } = useApp();
  return {
    links: state.links,
    linkGroups: state.linkGroups,
    loading: state.loadingStates.links,
  };
};

export const useTasks = () => {
  const { state } = useApp();
  return {
    tasks: state.tasks,
    pendingTasks: state.tasks.filter((task) => !task.completed),
    completedTasks: state.tasks.filter((task) => task.completed),
    overdueTasks: state.tasks.filter(
      (task) =>
        !task.completed && task.dueDate && new Date(task.dueDate) < new Date()
    ),
    loading: state.loadingStates.tasks,
  };
};

export const useBlocNote = () => {
  const { state } = useApp();
  return {
    blocNote: state.blocNote,
    loading: state.loadingStates.blocNote,
  };
};

export const useUI = () => {
  const { state } = useApp();
  return state.ui;
};

export type { AppState };
