export type LabelColorName = "teal" | "slate" | "blue" | "violet";

export interface LabelColorConfig {
  default: string;
  outlined: string;
  minimal: string;
  dot: string;
}

export interface Label {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  noteCount?: number;
  color?: string;
  isSelected?: boolean;
}

export interface CreateLabelForm {
  name: string;
  color?: string;
}

export interface LabelUsageStats {
  totalLabels: number;
  mostUsedLabels: Array<{
    label: Label;
    noteCount: number;
  }>;
  unusedLabels: Label[];
}

// Configuration des couleurs
export const LABEL_COLORS: Record<LabelColorName, LabelColorConfig> = {
  teal: {
    default: "bg-teal-50 text-teal-700 border border-teal-200",
    outlined: "border-teal-300 text-teal-700 bg-white",
    minimal: "text-teal-600",
    dot: "bg-teal-400",
  },
  slate: {
    default: "bg-slate-50 text-slate-700 border border-slate-200",
    outlined: "border-slate-300 text-slate-700 bg-white",
    minimal: "text-slate-600",
    dot: "bg-slate-400",
  },
  blue: {
    default: "bg-blue-50 text-blue-700 border border-blue-200",
    outlined: "border-blue-300 text-blue-700 bg-white",
    minimal: "text-blue-600",
    dot: "bg-blue-400",
  },
  violet: {
    default: "bg-violet-50 text-violet-700 border border-violet-200",
    outlined: "border-violet-300 text-violet-700 bg-white",
    minimal: "text-violet-600",
    dot: "bg-violet-400",
  },
};

export const AVAILABLE_LABEL_COLORS: LabelColorName[] = [
  "teal",
  "slate",
  "blue",
  "violet",
];

// Utilitaires
export const getLabelColor = (labelId: string): LabelColorName => {
  let hash = 0;
  for (let i = 0; i < labelId.length; i++) {
    hash = labelId.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  return AVAILABLE_LABEL_COLORS[hash % AVAILABLE_LABEL_COLORS.length];
};

export const getLabelColorClasses = (
  colorName: LabelColorName,
  variant: "default" | "outlined" | "minimal" = "default"
): LabelColorConfig => {
  return LABEL_COLORS[colorName];
};
