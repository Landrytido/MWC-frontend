export interface BlocNote {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlocNoteState {
  blocNote: BlocNote | null;
  loading: boolean;
  error: string | null;
  saveStatus: "saved" | "saving" | "unsaved" | null;
}

export interface UpdateBlocNoteRequest {
  content: string;
}
