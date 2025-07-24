import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Note, BlocNote, User, LoadingState, Comment } from "../types";
import { Notebook } from "../../features/notebooks";
import { Label } from "../../features/labels";
import { SavedLink, LinkGroup } from "../../features/links";
import { Task } from "../../features/tasks";

interface AppState {
  user: User | null;
  notes: Note[];
  notebooks: Notebook[];
  labels: Label[];
  links: SavedLink[];
  linkGroups: LinkGroup[];
  tasks: Task[];
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
  | { type: "SET_NOTES"; payload: Note[] }
  | { type: "ADD_NOTE"; payload: Note }
  | { type: "UPDATE_NOTE"; payload: { id: number; note: Partial<Note> } }
  | { type: "DELETE_NOTE"; payload: number }
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
  | { type: "RESET_FILTERS" }
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

const initialState: AppState = {
  user: null,
  notes: [],
  notebooks: [],
  labels: [],
  links: [],
  linkGroups: [],
  tasks: [],
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
    taskSearchTerm: "",
    linkSearchTerm: "",
  },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };

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

    case "SET_COMMENTS":
      return { ...state, comments: action.payload };

    case "ADD_COMMENT":
      return {
        ...state,
        comments: [action.payload, ...state.comments],
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
