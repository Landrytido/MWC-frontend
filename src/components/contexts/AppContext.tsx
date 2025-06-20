import React, { createContext, useContext, useReducer, ReactNode } from "react";
import {
  Note,
  Notebook,
  Label,
  SavedLink,
  LinkGroup,
  Task,
  DailyTask,
  BlocNote,
  User,
  LoadingState,
  Comment,
} from "../types";

interface AppState {
  user: User | null;
  notes: Note[];
  notebooks: Notebook[];
  labels: Label[];
  links: SavedLink[];
  linkGroups: LinkGroup[];
  tasks: Task[];
  dailyTasks: DailyTask[];
  blocNote: BlocNote | null;
  comments: Comment[];

  loadingStates: {
    notes: LoadingState;
    notebooks: LoadingState;
    labels: LoadingState;
    links: LoadingState;
    tasks: LoadingState;
    dailyTasks: LoadingState;
    blocNote: LoadingState;
    comments: LoadingState;
  };

  // UI state
  ui: {
    sidebarCollapsed: boolean;
    currentNotebook: number | null;
    selectedLabels: string[];
    searchTerm: string;
  };
}

// Action types
type AppAction =
  // User actions
  | { type: "SET_USER"; payload: User | null }

  // Notes actions
  | { type: "SET_NOTES"; payload: Note[] }
  | { type: "ADD_NOTE"; payload: Note }
  | { type: "UPDATE_NOTE"; payload: { id: number; note: Partial<Note> } }
  | { type: "DELETE_NOTE"; payload: number }

  // Notebooks actions
  | { type: "SET_NOTEBOOKS"; payload: Notebook[] }
  | { type: "ADD_NOTEBOOK"; payload: Notebook }
  | {
      type: "UPDATE_NOTEBOOK";
      payload: { id: number; notebook: Partial<Notebook> };
    }
  | { type: "DELETE_NOTEBOOK"; payload: number }

  // Labels actions
  | { type: "SET_LABELS"; payload: Label[] }
  | { type: "ADD_LABEL"; payload: Label }
  | { type: "UPDATE_LABEL"; payload: { id: string; label: Partial<Label> } }
  | { type: "DELETE_LABEL"; payload: string }

  // Links actions
  | { type: "SET_LINKS"; payload: SavedLink[] }
  | { type: "ADD_LINK"; payload: SavedLink }
  | { type: "UPDATE_LINK"; payload: { id: number; link: Partial<SavedLink> } }
  | { type: "DELETE_LINK"; payload: number }

  // Link Groups actions
  | { type: "SET_LINK_GROUPS"; payload: LinkGroup[] }
  | { type: "ADD_LINK_GROUP"; payload: LinkGroup }
  | {
      type: "UPDATE_LINK_GROUP";
      payload: { id: string; linkGroup: Partial<LinkGroup> };
    }
  | { type: "DELETE_LINK_GROUP"; payload: string }

  // Tasks actions
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: { id: number; task: Partial<Task> } }
  | { type: "DELETE_TASK"; payload: number }
  | { type: "TOGGLE_TASK"; payload: number }

  // Daily Tasks actions
  | { type: "SET_DAILY_TASKS"; payload: DailyTask[] }
  | { type: "ADD_DAILY_TASK"; payload: DailyTask }
  | {
      type: "UPDATE_DAILY_TASK";
      payload: { id: number; task: Partial<DailyTask> };
    }
  | { type: "DELETE_DAILY_TASK"; payload: number }
  | { type: "REORDER_DAILY_TASKS"; payload: DailyTask[] }

  // Bloc Note actions
  | { type: "SET_BLOC_NOTE"; payload: BlocNote | null }
  | { type: "UPDATE_BLOC_NOTE"; payload: { content: string } }

  // Loading actions
  | {
      type: "SET_LOADING";
      payload: { key: keyof AppState["loadingStates"]; loading: LoadingState };
    }

  // UI actions
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_CURRENT_NOTEBOOK"; payload: number | null }
  | { type: "SET_SELECTED_LABELS"; payload: string[] }
  | { type: "SET_SEARCH_TERM"; payload: string }
  | { type: "RESET_FILTERS" }

  // Comments actions
  | { type: "SET_COMMENTS"; payload: Comment[] }
  | { type: "ADD_COMMENT"; payload: Comment }
  | {
      type: "UPDATE_COMMENT";
      payload: { id: number; comment: Partial<Comment> };
    }
  | { type: "DELETE_COMMENT"; payload: number }
  | {
      type: "SET_NOTE_COMMENTS";
      payload: { noteId: number; comments: Comment[] };
    };

// Initial state
const initialState: AppState = {
  user: null,
  notes: [],
  notebooks: [],
  labels: [],
  links: [],
  linkGroups: [],
  tasks: [],
  dailyTasks: [],
  blocNote: null,
  comments: [],

  loadingStates: {
    notes: { isLoading: false },
    notebooks: { isLoading: false },
    labels: { isLoading: false },
    links: { isLoading: false },
    tasks: { isLoading: false },
    dailyTasks: { isLoading: false },
    blocNote: { isLoading: false },
    comments: { isLoading: false },
  },

  ui: {
    sidebarCollapsed: false,
    currentNotebook: null,
    selectedLabels: [],
    searchTerm: "",
  },
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // User actions
    case "SET_USER":
      return { ...state, user: action.payload };

    // Notes actions
    case "SET_NOTES":
      return { ...state, notes: action.payload };

    case "ADD_NOTE":
      return { ...state, notes: [action.payload, ...state.notes] };

    case "UPDATE_NOTE":
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.payload.id
            ? { ...note, ...action.payload.note }
            : note
        ),
      };

    case "DELETE_NOTE":
      return {
        ...state,
        notes: state.notes.filter((note) => note.id !== action.payload),
      };

    // Notebooks actions
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

    // Labels actions
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

    // Links actions
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

    // Link Groups actions
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

    // Tasks actions
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

    // Daily Tasks actions
    case "SET_DAILY_TASKS":
      return { ...state, dailyTasks: action.payload };

    case "ADD_DAILY_TASK":
      return { ...state, dailyTasks: [action.payload, ...state.dailyTasks] };

    case "UPDATE_DAILY_TASK":
      return {
        ...state,
        dailyTasks: state.dailyTasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.task }
            : task
        ),
      };

    case "DELETE_DAILY_TASK":
      return {
        ...state,
        dailyTasks: state.dailyTasks.filter(
          (task) => task.id !== action.payload
        ),
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
    case "REORDER_DAILY_TASKS":
      return { ...state, dailyTasks: action.payload };

    // Bloc Note actions
    case "SET_BLOC_NOTE":
      return { ...state, blocNote: action.payload };

    case "UPDATE_BLOC_NOTE":
      return {
        ...state,
        blocNote: state.blocNote
          ? { ...state.blocNote, content: action.payload.content }
          : null,
      };

    // Loading actions
    case "SET_LOADING":
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [action.payload.key]: action.payload.loading,
        },
      };

    // UI actions
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
        },
      };

    // Comments actions
    case "SET_COMMENTS":
      return { ...state, comments: action.payload };

    case "ADD_COMMENT":
      return {
        ...state,
        comments: [action.payload, ...state.comments],
        // Mettre à jour le compteur de commentaires de la note
        notes: state.notes.map((note) =>
          note.id === action.payload.noteId
            ? { ...note, commentCount: (note.commentCount || 0) + 1 }
            : note
        ),
      };

    case "UPDATE_COMMENT":
      return {
        ...state,
        comments: state.comments.map((comment) =>
          comment.id === action.payload.id
            ? { ...comment, ...action.payload.comment }
            : comment
        ),
      };

    case "DELETE_COMMENT": {
      const deletedComment = state.comments.find(
        (c) => c.id === action.payload
      );
      return {
        ...state,
        comments: state.comments.filter(
          (comment) => comment.id !== action.payload
        ),
        // Décrémenter le compteur de commentaires de la note
        notes: deletedComment
          ? state.notes.map((note) =>
              note.id === deletedComment.noteId
                ? {
                    ...note,
                    commentCount: Math.max((note.commentCount || 0) - 1, 0),
                  }
                : note
            )
          : state.notes,
      };
    }

    case "SET_NOTE_COMMENTS":
      return {
        ...state,
        comments: [
          ...state.comments.filter((c) => c.noteId !== action.payload.noteId),
          ...action.payload.comments,
        ],
      };

    default:
      return state;
  }
}

// Context creation
const AppContext = createContext<
  | {
      state: AppState;
      dispatch: React.Dispatch<AppAction>;
    }
  | undefined
>(undefined);

// Provider component
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

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

// Selector hooks for specific data
export const useNotes = () => {
  const { state } = useApp();
  return {
    notes: state.notes,
    filteredNotes: state.notes.filter((note) => {
      const matchesNotebook =
        !state.ui.currentNotebook ||
        note.notebookId === state.ui.currentNotebook;
      const matchesSearch =
        !state.ui.searchTerm ||
        note.title.toLowerCase().includes(state.ui.searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(state.ui.searchTerm.toLowerCase());
      const matchesLabels =
        state.ui.selectedLabels.length === 0 ||
        state.ui.selectedLabels.some((labelId) =>
          note.labels?.some((label) => label.id === labelId)
        );

      return matchesNotebook && matchesSearch && matchesLabels;
    }),
    loading: state.loadingStates.notes,
  };
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
export const useComments = () => {
  const { state } = useApp();
  return {
    comments: state.comments,
    loading: state.loadingStates.comments,
    getCommentsByNoteId: (noteId: number) =>
      state.comments.filter((comment) => comment.noteId === noteId),
  };
};

export type { AppState };
