import React from "react";
import {
  Label,
  getLabelColor,
  getLabelColorClasses,
  LabelColorName,
} from "../types";

interface LabelBadgeProps {
  label: Label;
  removable?: boolean;
  onRemove?: (labelId: string) => void;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outlined" | "minimal";
  color?: LabelColorName;
  animated?: boolean;
}

interface LabelListProps {
  labels: Label[];
  removable?: boolean;
  onRemove?: (labelId: string) => void;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outlined" | "minimal";
  maxDisplay?: number;
  animated?: boolean;
  spacing?: "tight" | "normal" | "loose";
}

const LabelBadge: React.FC<LabelBadgeProps> = ({
  label,
  removable = false,
  onRemove,
  size = "md",
  variant = "default",
  color,
  animated = true,
}) => {
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
    const colorToUse = color || getLabelColor(label.id);
    return getLabelColorClasses(colorToUse);
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
    inline-flex items-center rounded-full font-medium relative
    ${sizeClasses.badge}
    ${getVariantClasses()}
    ${animated ? "transition-all duration-200" : ""}
  `.trim();

  return (
    <div className={baseClasses}>
      <div className="flex items-center">
        {variant !== "minimal" && (
          <span
            className={`${sizeClasses.dot} ${colorClasses.dot} rounded-full ${sizeClasses.spacing}`}
          ></span>
        )}
        <span className="truncate max-w-32">{label.name}</span>
        {label.noteCount !== undefined &&
          label.noteCount > 0 &&
          size !== "sm" && (
            <span className={`ml-1 text-xs opacity-75`}>
              ({label.noteCount})
            </span>
          )}
      </div>

      {removable && (
        <button
          type="button"
          onClick={handleRemove}
          className={`ml-1.5 ${
            sizeClasses.icon
          } hover:text-red-600 focus:outline-none rounded-full transition-colors ${
            animated ? "hover:scale-110" : ""
          } flex-shrink-0`}
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
    </div>
  );
};

export const LabelList: React.FC<LabelListProps> = ({
  labels,
  removable = false,
  onRemove,
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
          size={size}
          variant={variant}
          color={getLabelColor(label.id)}
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
