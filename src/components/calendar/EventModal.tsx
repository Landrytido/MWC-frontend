import React, { useState, useEffect } from "react";
import {
  EventDto,
  CreateEventRequest,
  EventMode,
  REMINDER_OPTIONS,
  EVENT_MODE_LABELS,
} from "../types/calendar";
import {
  TaskPriority,
  PRIORITY_LABELS,
  CreateTaskForm,
} from "../../features/tasks";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: CreateEventRequest | CreateTaskForm) => Promise<void>;
  editingEvent?: EventDto | null;
  modalType: "event" | "task";
  selectedDate?: string;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingEvent,
  modalType,
  selectedDate,
}) => {
  const [formData, setFormData] = useState<CreateEventRequest>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    mode: "PRESENTIEL",
    meetingLink: "",
    type: modalType === "event" ? "EVENT" : "TASK_BASED",
    reminders: [],
  });
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState<string>("");
  const [scheduleType, setScheduleType] = useState<
    "none" | "today" | "tomorrow"
  >("none");

  const [selectedReminders, setSelectedReminders] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const formatDateForBackend = (dateString: string): string => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

  const formatDateTimeForBackend = (dateString: string): string => {
    if (!dateString) return "";
    if (dateString.includes("T")) {
      if (dateString.length === 16) {
        return dateString + ":00";
      }
      return dateString;
    }
    return `${dateString}T12:00:00`;
  };

  const formatDateTimeForInput = (dateString: string): string => {
    if (!dateString) return "";
    if (dateString.includes("T")) {
      return dateString.slice(0, 16);
    }
    return `${dateString}T09:00`;
  };
  useEffect(() => {
    if (isOpen) {
      if (editingEvent) {
        const event = editingEvent;
        setFormData({
          title: event.title,
          description: event.description || "",
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location || "",
          mode: event.mode || "PRESENTIEL",
          meetingLink: event.meetingLink || "",
          type: event.type,
          reminders: event.reminders.map((r) => ({
            type: r.type,
            minutesBefore: r.minutesBefore,
          })),
        });
        setSelectedReminders(event.reminders.map((r) => r.minutesBefore));
        if (event.type === "TASK_BASED" && event.relatedTaskId) {
          if (
            "taskPriority" in event &&
            typeof event.taskPriority === "number"
          ) {
            setPriority(event.taskPriority);
          } else {
            setPriority(TaskPriority.MEDIUM);
          }

          if (event.endDate) {
            setDueDate(formatDateTimeForInput(event.endDate));
          } else {
            setDueDate("");
          }

          setScheduleType("none");
        }
      } else {
        setPriority(TaskPriority.MEDIUM);
        setDueDate("");
        setScheduleType("none");
        setSelectedReminders([]);

        const now = new Date();
        const defaultStart = selectedDate
          ? new Date(
              `${selectedDate}T${now
                .getHours()
                .toString()
                .padStart(2, "0")}:${now
                .getMinutes()
                .toString()
                .padStart(2, "0")}`
            )
          : new Date();

        const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000); // +1 heure

        setFormData({
          title: "",
          description: "",
          startDate: defaultStart.toISOString().slice(0, 16),
          endDate: defaultEnd.toISOString().slice(0, 16),
          location: "",
          mode: "PRESENTIEL",
          meetingLink: "",
          type: modalType === "event" ? "EVENT" : "TASK_BASED",
          reminders: [],
        });
        if (selectedDate && modalType === "task") {
          setDueDate(selectedDate);
        }
      }
      setError("");
    }
  }, [isOpen, editingEvent, modalType, selectedDate]);
  useEffect(() => {
    if (modalType === "task" && isOpen) {
      if (selectedDate) {
        setFormData((prev) => ({ ...prev, scheduledDate: selectedDate }));
        return;
      }
      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      let scheduledDate = "";
      if (scheduleType === "today") {
        scheduledDate = today;
      } else if (scheduleType === "tomorrow") {
        scheduledDate = tomorrow;
      }

      setFormData((prev) => ({ ...prev, scheduledDate }));
    }
  }, [scheduleType, modalType, selectedDate, isOpen]);
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        location: "",
        mode: "PRESENTIEL",
        meetingLink: "",
        type: modalType === "event" ? "EVENT" : "TASK_BASED",
        reminders: [],
      });
      setPriority(TaskPriority.MEDIUM);
      setDueDate("");
      setScheduleType("none");
      setSelectedReminders([]);
      setError("");
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, modalType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Le titre est requis");
      return;
    }
    if (modalType === "event") {
      if (!formData.startDate || !formData.endDate) {
        setError("Les dates de début et fin sont requises pour un événement");
        return;
      }

      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        setError("La date de fin doit être postérieure à la date de début");
        return;
      }

      if (formData.mode === "DISTANCIEL" && !formData.meetingLink?.trim()) {
        setError(
          "Le lien de réunion est requis pour les événements distanciels"
        );
        return;
      }
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (modalType === "task") {
        const taskData: CreateTaskForm = {
          title: formData.title.trim(),
          description: formData.description?.trim() || undefined,
          scheduledDate:
            selectedDate ||
            (formData.scheduledDate
              ? formatDateForBackend(formData.scheduledDate)
              : undefined),
          dueDate: dueDate ? formatDateTimeForBackend(dueDate) : undefined,
          priority: priority,
        };

        await onSubmit(taskData as CreateEventRequest);
      } else {
        const reminders = selectedReminders.map((minutes) => ({
          type: "EMAIL" as const,
          minutesBefore: minutes,
        }));

        const eventData: CreateEventRequest = {
          title: formData.title.trim(),
          description: formData.description?.trim() || undefined,
          startDate: formData.startDate,
          endDate: formData.endDate,
          location: formData.location?.trim() || undefined,
          mode: formData.mode,
          meetingLink: formData.meetingLink?.trim() || undefined,
          type: "EVENT",
          reminders,
        };

        await onSubmit(eventData);
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReminderChange = (minutes: number, checked: boolean) => {
    if (checked) {
      setSelectedReminders((prev) => [...prev, minutes]);
    } else {
      setSelectedReminders((prev) => prev.filter((m) => m !== minutes));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingEvent
                ? modalType === "event"
                  ? "Modifier l'événement"
                  : "Modifier la tâche"
                : modalType === "event"
                ? "Nouvel événement"
                : "Nouvelle tâche"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Fermer"
            >
              <svg
                className="w-5 h-5"
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
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Titre *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder={
                  modalType === "event"
                    ? "Nom de l'événement"
                    : "Nom de la tâche"
                }
                required
                disabled={isSubmitting}
              />
            </div>

            {/* SECTION CONDITIONNELLE - DATES */}
            {modalType === "event" ? (
              /* ÉVÉNEMENT : Début + Fin */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Date/heure de début *
                  </label>
                  <input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Date/heure de fin *
                  </label>
                  <input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(PRIORITY_LABELS).map(
                      ([priorityValue, config]) => {
                        const priorityNum = parseInt(
                          priorityValue
                        ) as TaskPriority;
                        const isSelected = priority === priorityNum;

                        return (
                          <button
                            key={priorityValue}
                            type="button"
                            onClick={() => setPriority(priorityNum)}
                            disabled={isSubmitting}
                            className={`p-3 text-sm font-medium rounded-md border-2 transition-colors ${
                              isSelected
                                ? priorityNum === TaskPriority.HIGH
                                  ? "border-red-500 bg-red-50 text-red-700"
                                  : priorityNum === TaskPriority.MEDIUM
                                  ? "border-blue-500 bg-blue-50 text-blue-700"
                                  : "border-gray-500 bg-gray-50 text-gray-700"
                                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center justify-center space-x-2">
                              <span>{config.icon}</span>
                              <span>{config.label}</span>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {selectedDate ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Planification
                    </label>
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-md">
                      <div className="flex items-center text-teal-700">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="font-medium">
                          Planifiée pour le{" "}
                          {new Date(selectedDate).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Planification
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: "none", label: "Pas de planification" },
                        { key: "today", label: "Pour aujourd'hui" },
                        { key: "tomorrow", label: "Pour demain" },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setScheduleType(
                              key as "none" | "today" | "tomorrow"
                            )
                          }
                          disabled={isSubmitting}
                          className={`p-2 text-sm font-medium rounded-md border transition-colors ${
                            scheduleType === key
                              ? "border-teal-500 bg-teal-50 text-teal-700"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {scheduleType === "none" && (
                      <div className="mt-4">
                        <label
                          htmlFor="dueDate"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Date d'échéance (optionnelle)
                        </label>
                        <input
                          id="dueDate"
                          type="datetime-local"
                          value={formatDateTimeForInput(dueDate)}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          disabled={isSubmitting}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Laissez vide si vous voulez juste une tâche à faire
                          sans date limite
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {modalType === "event" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(EVENT_MODE_LABELS).map(([mode, label]) => (
                    <label key={mode} className="flex items-center">
                      <input
                        type="radio"
                        name="mode"
                        value={mode}
                        checked={formData.mode === mode}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            mode: e.target.value as EventMode,
                          }))
                        }
                        className="mr-2 text-teal-500 focus:ring-teal-500"
                        disabled={isSubmitting}
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {modalType === "event" && (
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Lieu
                </label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Adresse ou lieu de l'événement"
                  disabled={isSubmitting}
                />
              </div>
            )}

            {/* Lien de réunion - SEULEMENT pour événements distanciels */}
            {modalType === "event" && formData.mode === "DISTANCIEL" && (
              <div>
                <label
                  htmlFor="meetingLink"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Lien de réunion *
                </label>
                <input
                  id="meetingLink"
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      meetingLink: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="https://..."
                  required={formData.mode === "DISTANCIEL"}
                  disabled={isSubmitting}
                />
              </div>
            )}

            {/* Description - COMMUN */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                placeholder="Détails supplémentaires..."
                disabled={isSubmitting}
              />
            </div>
            {modalType === "event" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rappels par email
                </label>
                <div className="space-y-2">
                  {REMINDER_OPTIONS.map(({ label, minutes }) => (
                    <label key={minutes} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedReminders.includes(minutes)}
                        onChange={(e) =>
                          handleReminderChange(minutes, e.target.checked)
                        }
                        className="mr-2 text-teal-500 focus:ring-teal-500 rounded"
                        disabled={isSubmitting}
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.title.trim()}
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {editingEvent ? "Modification..." : "Création..."}
                  </div>
                ) : editingEvent ? (
                  "Mettre à jour"
                ) : (
                  "Créer"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EventModal;
