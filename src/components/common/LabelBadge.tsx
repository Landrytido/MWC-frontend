import React from "react";
import { Label } from "../types";

interface LabelBadgeProps {
  label: Label;
  removable?: boolean;
  onRemove?: (labelId: string) => void;
  clickable?: boolean;
  onClick?: (labelId: string) => void;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outlined" | "minimal";
  color?: "teal" | "blue" | "green" | "yellow" | "red" | "purple" | "gray";
  animated?: boolean;
}

const LabelBadge: React.FC<LabelBadgeProps> = ({
  label,
  removable = false,
  onRemove,
  clickable = false,
  onClick,
  size = "md",
  variant = "default",
  color = "teal",
  animated = true,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clickable && onClick) {
      onClick(label.id);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(label.id);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          badge: "px-2 py-0.5 text-xs",
          dot: "w-1.5 h-1.5",
          icon: "w-3 h-3",
          spacing: "mr-1",
        };
      case "lg":
        return {
          badge: "px-3 py-1.5 text-base",
          dot: "w-3 h-3",
          icon: "w-5 h-5",
          spacing: "mr-2",
        };
      default:
        return {
          badge: "px-2 py-1 text-sm",
          dot: "w-2 h-2",
          icon: "w-4 h-4",
          spacing: "mr-1.5",
        };
    }
  };

  const getColorClasses = () => {
    const colors = {
      teal: {
        default: "bg-teal-100 text-teal-800",
        outlined: "border-teal-300 text-teal-700 bg-white",
        minimal: "text-teal-600",
        dot: "bg-teal-500",
        hover: "hover:bg-teal-200",
        focus: "focus:ring-teal-500",
      },
      blue: {
        default: "bg-blue-100 text-blue-800",
        outlined: "border-blue-300 text-blue-700 bg-white",
        minimal: "text-blue-600",
        dot: "bg-blue-500",
        hover: "hover:bg-blue-200",
        focus: "focus:ring-blue-500",
      },
      green: {
        default: "bg-green-100 text-green-800",
        outlined: "border-green-300 text-green-700 bg-white",
        minimal: "text-green-600",
        dot: "bg-green-500",
        hover: "hover:bg-green-200",
        focus: "focus:ring-green-500",
      },
      yellow: {
        default: "bg-yellow-100 text-yellow-800",
        outlined: "border-yellow-300 text-yellow-700 bg-white",
        minimal: "text-yellow-600",
        dot: "bg-yellow-500",
        hover: "hover:bg-yellow-200",
        focus: "focus:ring-yellow-500",
      },
      red: {
        default: "bg-red-100 text-red-800",
        outlined: "border-red-300 text-red-700 bg-white",
        minimal: "text-red-600",
        dot: "bg-red-500",
        hover: "hover:bg-red-200",
        focus: "focus:ring-red-500",
      },
      purple: {
        default: "bg-purple-100 text-purple-800",
        outlined: "border-purple-300 text-purple-700 bg-white",
        minimal: "text-purple-600",
        dot: "bg-purple-500",
        hover: "hover:bg-purple-200",
        focus: "focus:ring-purple-500",
      },
      gray: {
        default: "bg-gray-100 text-gray-800",
        outlined: "border-gray-300 text-gray-700 bg-white",
        minimal: "text-gray-600",
        dot: "bg-gray-500",
        hover: "hover:bg-gray-200",
        focus: "focus:ring-gray-500",
      },
    };

    return colors[color];
  };

  const sizeClasses = getSizeClasses();
  const colorClasses = getColorClasses();

  const getVariantClasses = () => {
    switch (variant) {
      case "outlined":
        return `border ${colorClasses.outlined}`;
      case "minimal":
        return colorClasses.minimal;
      default:
        return colorClasses.default;
    }
  };

  const baseClasses = `
    inline-flex items-center rounded-full font-medium
    ${sizeClasses.badge}
    ${getVariantClasses()}
    ${animated ? "transition-all duration-200" : ""}
    ${
      clickable
        ? `cursor-pointer ${colorClasses.hover} ${colorClasses.focus} focus:outline-none focus:ring-2 focus:ring-offset-1`
        : ""
    }
  `.trim();

  const Element = clickable ? "button" : "span";

  return (
    <Element
      className={baseClasses}
      onClick={clickable ? handleClick : undefined}
      type={clickable ? "button" : undefined}
      title={`Label: ${label.name}${
        label.noteCount !== undefined ? ` (${label.noteCount} notes)` : ""
      }`}
    >
      {/* Indicateur visuel (point coloré) */}
      {variant !== "minimal" && (
        <span
          className={`${sizeClasses.dot} ${colorClasses.dot} rounded-full ${sizeClasses.spacing}`}
        ></span>
      )}

      {/* Nom du label */}
      <span className="truncate max-w-32">{label.name}</span>

      {/* Compteur de notes (optionnel) */}
      {label.noteCount !== undefined &&
        label.noteCount > 0 &&
        size !== "sm" && (
          <span className={`ml-1 text-xs opacity-75`}>({label.noteCount})</span>
        )}

      {/* Bouton de suppression */}
      {removable && (
        <button
          type="button"
          onClick={handleRemove}
          className={`ml-1.5 ${
            sizeClasses.icon
          } hover:text-current focus:outline-none rounded-full transition-colors ${
            animated ? "hover:scale-110" : ""
          }`}
          aria-label={`Retirer le label ${label.name}`}
        >
          <svg
            className={sizeClasses.icon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </Element>
  );
};

// 🆕 Composant pour afficher une liste de labels
interface LabelListProps {
  labels: Label[];
  removable?: boolean;
  onRemove?: (labelId: string) => void;
  clickable?: boolean;
  onClick?: (labelId: string) => void;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outlined" | "minimal";
  maxDisplay?: number;
  animated?: boolean;
  spacing?: "tight" | "normal" | "loose";
}

export const LabelList: React.FC<LabelListProps> = ({
  labels,
  removable = false,
  onRemove,
  clickable = false,
  onClick,
  size = "md",
  variant = "default",
  maxDisplay,
  animated = true,
  spacing = "normal",
}) => {
  const displayLabels = maxDisplay ? labels.slice(0, maxDisplay) : labels;
  const remainingCount =
    maxDisplay && labels.length > maxDisplay ? labels.length - maxDisplay : 0;

  const getSpacingClass = () => {
    switch (spacing) {
      case "tight":
        return "gap-1";
      case "loose":
        return "gap-3";
      default:
        return "gap-2";
    }
  };

  // Assignation automatique des couleurs basée sur l'ID du label
  const getColorForLabel = (labelId: string): LabelBadgeProps["color"] => {
    const colors: LabelBadgeProps["color"][] = [
      "teal",
      "blue",
      "green",
      "yellow",
      "purple",
      "red",
    ];
    const hash = labelId.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (labels.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center ${getSpacingClass()}`}>
      {displayLabels.map((label) => (
        <LabelBadge
          key={label.id}
          label={label}
          removable={removable}
          onRemove={onRemove}
          clickable={clickable}
          onClick={onClick}
          size={size}
          variant={variant}
          color={getColorForLabel(label.id)}
          animated={animated}
        />
      ))}

      {remainingCount > 0 && (
        <span
          className={`${
            size === "sm"
              ? "px-2 py-0.5 text-xs"
              : size === "lg"
              ? "px-3 py-1.5 text-base"
              : "px-2 py-1 text-sm"
          } bg-gray-100 text-gray-600 rounded-full font-medium`}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  );
};

export default LabelBadge;
