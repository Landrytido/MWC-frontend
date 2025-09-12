import React, { useState, useRef, useEffect } from "react";
import { useLabels } from "../hooks/useLabels";
import { Label, getLabelColorClasses, getLabelColor } from "../types";

interface LabelSelectorProps {
  selectedLabelIds: string[];
  onLabelsChange: (labelIds: string[]) => void;
  maxSelections?: number;
  creatable?: boolean;
  disabled?: boolean;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

const LabelSelector: React.FC<LabelSelectorProps> = ({
  selectedLabelIds,
  onLabelsChange,
  maxSelections = 10,
  creatable = true,
  disabled = false,
  placeholder = "Sélectionner ou créer des labels...",
  size = "md",
  showCount = true,
}) => {
  const { labels, createLabel } = useLabels();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [filteredLabels, setFilteredLabels] = useState<Label[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const available = labels.filter(
      (label) =>
        !selectedLabelIds.includes(label.id) &&
        label.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLabels(available);
  }, [labels, selectedLabelIds, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabels = labels.filter((label) =>
    selectedLabelIds.includes(label.id)
  );

  const handleLabelSelect = (labelId: string) => {
    if (selectedLabelIds.length >= maxSelections) return;

    onLabelsChange([...selectedLabelIds, labelId]);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleLabelRemove = (labelId: string) => {
    onLabelsChange(selectedLabelIds.filter((id) => id !== labelId));
  };

  const handleCreateLabel = async () => {
    if (!searchTerm.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const newLabel = await createLabel(searchTerm.trim());
      onLabelsChange([...selectedLabelIds, newLabel.id]);
      setSearchTerm("");
      setIsOpen(false);
    } catch {
      // Erreur silencieuse
    } finally {
      setIsCreating(false);
    }
  };
  const getLabelDisplayClasses = (labelId: string) => {
    const color = getLabelColor(labelId);
    return getLabelColorClasses(color);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      searchTerm.trim() &&
      filteredLabels.length === 0 &&
      creatable
    ) {
      e.preventDefault();
      handleCreateLabel();
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          container: "text-sm",
          input: "px-2 py-1 text-sm",
          badge: "px-2 py-0.5 text-xs",
          dropdown: "text-sm",
        };
      case "lg":
        return {
          container: "text-lg",
          input: "px-4 py-3 text-lg",
          badge: "px-3 py-1 text-sm",
          dropdown: "text-base",
        };
      default:
        return {
          container: "text-base",
          input: "px-3 py-2 text-base",
          badge: "px-2 py-1 text-sm",
          dropdown: "text-sm",
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`relative ${sizeClasses.container}`} ref={dropdownRef}>
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedLabels.map((label) => {
            const colorClasses = getLabelDisplayClasses(label.id); // 🔄 Couleur dynamique

            return (
              <span
                key={label.id}
                className={`inline-flex items-center ${sizeClasses.badge} ${colorClasses.default} rounded-full transition-colors`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${colorClasses.dot} mr-1.5`}
                ></span>
                {label.name}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleLabelRemove(label.id)}
                    className="ml-1.5 hover:text-red-600 focus:outline-none transition-colors"
                    aria-label={`Retirer le label ${label.name}`}
                  >
                    <svg
                      className="w-3 h-3"
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
              </span>
            );
          })}
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled || selectedLabelIds.length >= maxSelections}
          placeholder={
            selectedLabelIds.length >= maxSelections
              ? `Maximum ${maxSelections} labels atteint`
              : placeholder
          }
          className={`w-full ${sizeClasses.input} border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed`}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {isOpen && !disabled && (
        <div
          className={`absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto ${sizeClasses.dropdown}`}
        >
          {filteredLabels.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                Labels existants
              </div>
              {filteredLabels.map((label) => {
                const colorClasses = getLabelDisplayClasses(label.id);

                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => handleLabelSelect(label.id)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <span
                        className={`w-3 h-3 rounded-full ${colorClasses.dot} mr-2`}
                      ></span>
                      <span className="flex-1">{label.name}</span>
                      {showCount && label.noteCount !== undefined && (
                        <span className="text-xs text-gray-500 ml-2">
                          {label.noteCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {searchTerm.trim() &&
            creatable &&
            !labels.some(
              (label) => label.name.toLowerCase() === searchTerm.toLowerCase()
            ) && (
              <div>
                {filteredLabels.length > 0 && (
                  <div className="border-t border-gray-200"></div>
                )}
                <button
                  type="button"
                  onClick={handleCreateLabel}
                  disabled={isCreating}
                  className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:outline-none focus:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-blue-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="text-blue-600">
                      {isCreating ? "Création..." : `Créer "${searchTerm}"`}
                    </span>
                  </div>
                </button>
              </div>
            )}

          {filteredLabels.length === 0 &&
            (!searchTerm.trim() ||
              labels.some(
                (label) => label.name.toLowerCase() === searchTerm.toLowerCase()
              )) && (
              <div className="px-3 py-4 text-center text-gray-500">
                {searchTerm.trim()
                  ? "Aucun label trouvé"
                  : "Aucun label disponible"}
              </div>
            )}
        </div>
      )}

      {showCount && maxSelections < Infinity && (
        <div className="mt-1 text-xs text-gray-500">
          {selectedLabelIds.length} / {maxSelections} labels sélectionnés
        </div>
      )}
    </div>
  );
};

export default LabelSelector;
