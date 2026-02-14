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

export interface NotebookWithNotes {
  notebook: Notebook;
  notes: Array<{
    id: number;
    title: string;
    createdAt: string;
  }>;
  total: number;
}
