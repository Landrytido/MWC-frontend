export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
  taskCount?: number;
  completedTaskCount?: number;
  notebookId?: number;
  notebookTitle?: string;
  labels?: import("../labels").Label[];
  comments?: Comment[];
}

export interface Comment {
  id: number;
  content: string;
  noteId: number;
  author: {
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface CreateNoteForm {
  title: string;
  content: string;
  notebookId?: number | null;
  labelIds?: string[];
}

export interface UpdateNoteForm {
  title?: string;
  content?: string;
  notebookId?: number | null;
}

export interface CreateCommentForm {
  content: string;
  noteId: number;
}

export interface NotesSearchParams {
  query?: string;
  notebookId?: number;
  labelIds?: string[];
  limit?: number;
  offset?: number;
}
