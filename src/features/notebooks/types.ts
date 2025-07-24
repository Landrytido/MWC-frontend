export interface Notebook {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  noteCount?: number;
}

export interface CreateNotebookForm {
  title: string;
}

export interface NotebookUsageStats {
  totalNotebooks: number;
  notebooksWithMostNotes: Array<{
    notebook: Notebook;
    noteCount: number;
  }>;
  emptyNotebooks: Notebook[];
}

export interface NotebookWithNotes {
  notebook: Notebook;
  notes: Array<{
    id: number;
    title: string;
    createdAt: string;
  }>;
  total: number;
}
