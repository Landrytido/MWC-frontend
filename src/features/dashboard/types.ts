export type TabType = "notes" | "links" | "tasks" | "tools" | "calendar";

export interface SearchConfig {
  show: boolean;
  placeholder?: string;
  value: string;
  onChange: (term: string) => void;
  hasError?: boolean;
  errorMessage?: string;
}

export interface TabConfig {
  key: TabType;
  label: string;
  count?: number;
}
