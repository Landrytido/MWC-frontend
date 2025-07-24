import React, { useState, useRef, useEffect } from "react";
import { useNotebooks } from "../hooks/useNotebooks";
import { Notebook } from "../types";

interface NotebookSelectorProps {
  selectedNotebookId?: number | null;
  onNotebookChange: (notebookId: number | null) => void;
  includeNone?: boolean;
  disabled?: boolean;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal";
  showCount?: boolean;
  allowCreate?: boolean;
  onCreateNotebook?: (title: string) => Promise<Notebook>;
}

const NotebookSelector: React.FC<NotebookSelectorProps> = ({
  selectedNotebookId = null,
  onNotebookChange,
  includeNone = true,
  disabled = false,
  placeholder = "Sélectionner un carnet...",
  size = "md",
  variant = "default",
  showCount = true,
  allowCreate = false,
  onCreateNotebook,
}) => {
  const { notebooks, createNotebook } = useNotebooks();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedNotebook = notebooks.find((nb) => nb.id === selectedNotebookId);

  const filteredNotebooks = notebooks.filter((notebook) =>
    notebook.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleNotebookSelect = (notebookId: number | null) => {
    onNotebookChange(notebookId);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleCreateNotebook = async () => {
    if (!searchTerm.trim() || !onCreateNotebook || isCreating) return;

    setIsCreating(true);
    try {
      const newNotebook = await createNotebook(searchTerm.trim());
      onNotebookChange(newNotebook.id);
      setIsOpen(false);
      setSearchTerm("");
    } catch (error) {
      console.error("Erreur lors de la création du carnet:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      searchTerm.trim() &&
      filteredNotebooks.length === 0 &&
      allowCreate
    ) {
      e.preventDefault();
      handleCreateNotebook();
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          trigger: "px-2 py-1 text-sm",
          dropdown: "text-sm",
          search: "px-2 py-1 text-sm",
        };
      case "lg":
        return {
          trigger: "px-4 py-3 text-lg",
          dropdown: "text-base",
          search: "px-3 py-2 text-base",
        };
      default:
        return {
          trigger: "px-3 py-2 text-base",
          dropdown: "text-sm",
          search: "px-3 py-2 text-sm",
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const renderTriggerContent = () => {
    if (selectedNotebook) {
      return (
        <div className="flex items-center">
          <span className="mr-2">📓</span>
          <span className="flex-1 truncate">{selectedNotebook.title}</span>
          {showCount && selectedNotebook.noteCount !== undefined && (
            <span className="ml-2 text-xs text-gray-500">
              ({selectedNotebook.noteCount})
            </span>
          )}
        </div>
      );
    }

    if (includeNone && selectedNotebookId === null) {
      return (
        <div className="flex items-center text-gray-600">
          <span className="mr-2">📝</span>
          <span>Aucun carnet</span>
        </div>
      );
    }

    return <span className="text-gray-500">{placeholder}</span>;
  };

  if (variant === "minimal") {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`inline-flex items-center ${sizeClasses.trigger} text-gray-700 hover:text-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {renderTriggerContent()}
          <svg
            className={`ml-1 w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && !disabled && (
          <div
            className={`absolute z-50 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg ${sizeClasses.dropdown}`}
          >
            {renderDropdownContent()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full ${sizeClasses.trigger} border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">{renderTriggerContent()}</div>
          <svg
            className={`ml-2 w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && !disabled && (
        <div
          className={`absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden ${sizeClasses.dropdown}`}
        >
          {renderDropdownContent()}
        </div>
      )}
    </div>
  );

  function renderDropdownContent() {
    return (
      <>
        {(notebooks.length > 5 || allowCreate) && (
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher ou créer..."
              className={`w-full ${sizeClasses.search} border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500`}
              autoFocus
            />
          </div>
        )}

        <div className="max-h-48 overflow-y-auto">
          {includeNone && (
            <button
              type="button"
              onClick={() => handleNotebookSelect(null)}
              className={`w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors ${
                selectedNotebookId === null ? "bg-teal-50 text-teal-700" : ""
              }`}
            >
              <div className="flex items-center">
                <span className="mr-2">📝</span>
                <span className="flex-1">Aucun carnet</span>
                {selectedNotebookId === null && (
                  <svg
                    className="w-4 h-4 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </button>
          )}

          {includeNone && filteredNotebooks.length > 0 && (
            <div className="border-t border-gray-200"></div>
          )}

          {filteredNotebooks.map((notebook) => (
            <button
              key={notebook.id}
              type="button"
              onClick={() => handleNotebookSelect(notebook.id)}
              className={`w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors ${
                selectedNotebookId === notebook.id
                  ? "bg-teal-50 text-teal-700"
                  : ""
              }`}
            >
              <div className="flex items-center">
                <span className="mr-2">📓</span>
                <span className="flex-1 truncate">{notebook.title}</span>
                {showCount && notebook.noteCount !== undefined && (
                  <span className="text-xs text-gray-500 ml-2">
                    {notebook.noteCount}
                  </span>
                )}
                {selectedNotebookId === notebook.id && (
                  <svg
                    className="w-4 h-4 text-teal-600 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}

          {searchTerm.trim() &&
            allowCreate &&
            !filteredNotebooks.some(
              (nb) => nb.title.toLowerCase() === searchTerm.toLowerCase()
            ) && (
              <>
                <div className="border-t border-gray-200"></div>
                <button
                  type="button"
                  onClick={handleCreateNotebook}
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
              </>
            )}

          {filteredNotebooks.length === 0 &&
            (!searchTerm.trim() ||
              filteredNotebooks.some(
                (nb) => nb.title.toLowerCase() === searchTerm.toLowerCase()
              )) && (
              <div className="px-3 py-4 text-center text-gray-500">
                {searchTerm.trim()
                  ? "Aucun carnet trouvé"
                  : "Aucun carnet disponible"}
              </div>
            )}
        </div>
      </>
    );
  }
};

export default NotebookSelector;
