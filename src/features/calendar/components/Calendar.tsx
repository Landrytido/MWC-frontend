import React, { useState } from "react";
import { useCalendar } from "../hooks/useCalendar";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import EventModal from "./EventModal";
import DayDetailModal from "./DayDetailModal";
import EventsList from "./EventsList";
import { CreateEventRequest, EventDto } from "../types";
import { CreateTaskForm } from "../../tasks/types";
import { useConfirmation } from "../../../shared/hooks/useConfirmation";

const Calendar: React.FC = () => {
  // 🎣 HOOK PRINCIPAL
  const {
    currentMonth,
    currentYear,
    currentMonthData,
    events,
    error,
    loadingStates,
    navigateToPreviousMonth,
    navigateToNextMonth,
    navigateToToday,
    createEvent,
    updateEvent,
    deleteEvent,
    createTaskFromCalendar,
    loadDayData,
  } = useCalendar();

  const { confirm, ConfirmationComponent } = useConfirmation();

  // 🗄️ ÉTAT LOCAL DU COMPOSANT
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDayDetailModalOpen, setIsDayDetailModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventDto | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [modalType, setModalType] = useState<"event" | "task">("event");

  // ✅ AJOUT : État pour le filtre du calendrier
  const [filterType, setFilterType] = useState<"all" | "events" | "tasks">(
    "all"
  );

  // ✅ FONCTION UTILITAIRE : Conversion CreateTaskForm vers CreateEventRequest
  const convertTaskToEventRequest = (
    taskData: CreateTaskForm
  ): CreateEventRequest => {
    const now = new Date().toISOString();
    return {
      title: taskData.title,
      description: taskData.description,
      startDate: taskData.scheduledDate || now,
      endDate: taskData.dueDate || taskData.scheduledDate || now,
      type: "TASK_BASED",
      reminders: [],
      // Les champs spécifiques aux tâches ne sont pas dans CreateEventRequest
      // Ils seront gérés par l'API backend
    };
  };

  // 📝 HANDLERS
  const handleCreateEvent = () => {
    setEditingEvent(null);
    setModalType("event");
    setIsEventModalOpen(true);
  };

  const handleCreateTask = () => {
    setEditingEvent(null);
    setModalType("task");
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: EventDto) => {
    setEditingEvent(event);
    setModalType(event.type === "TASK_BASED" ? "task" : "event");
    setSelectedDate("");
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: number) => {
    const confirmed = await confirm({
      title: "Supprimer l'événement",
      message: "Êtes-vous sûr de vouloir supprimer cet événement ?",
      confirmText: "Supprimer",
      cancelText: "Annuler",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      await deleteEvent(eventId);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setIsDayDetailModalOpen(true);
  };

  // ✅ CORRECTION : Gestion des types corrigée
  const handleEventSubmit = async (
    data: CreateEventRequest | CreateTaskForm
  ) => {
    try {
      if (editingEvent) {
        // Pour la modification, vérifier le type de l'événement
        if (modalType === "task" || editingEvent.type === "TASK_BASED") {
          const eventData = convertTaskToEventRequest(data as CreateTaskForm);
          await updateEvent(editingEvent.id, eventData);
        } else {
          await updateEvent(editingEvent.id, data as CreateEventRequest);
        }
      } else {
        // Pour la création, différencier selon le modalType
        if (modalType === "task") {
          const taskData = data as CreateTaskForm;
          // ✅ SOLUTION : Créer un objet compatible avec l'API createTaskFromCalendar
          const taskEventData: CreateEventRequest = {
            title: taskData.title,
            description: taskData.description || undefined,
            startDate: taskData.scheduledDate || new Date().toISOString(),
            endDate:
              taskData.dueDate ||
              taskData.scheduledDate ||
              new Date().toISOString(),
            type: "TASK_BASED",
            reminders: [],
            // Ajouter les champs nécessaires selon votre API
          };
          await createTaskFromCalendar(taskEventData);
        } else {
          await createEvent(data as CreateEventRequest);
        }
      }
      setIsEventModalOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      throw error;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header avec navigation */}
      <CalendarHeader
        currentMonth={currentMonth}
        currentYear={currentYear}
        loading={loadingStates.monthView}
        error={error}
        onPreviousMonth={navigateToPreviousMonth}
        onNextMonth={navigateToNextMonth}
        onToday={navigateToToday}
      />

      <div className="p-6">
        {/* ✅ AJOUT : Filtres pour le calendrier */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                filterType === "all"
                  ? "bg-teal-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tout
            </button>
            <button
              onClick={() => setFilterType("events")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                filterType === "events"
                  ? "bg-teal-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              🎉 Événements
            </button>
            <button
              onClick={() => setFilterType("tasks")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                filterType === "tasks"
                  ? "bg-teal-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              📋 Tâches
            </button>
          </div>

          {/* Boutons de création */}
          <div className="flex space-x-2">
            <button
              onClick={handleCreateEvent}
              className="flex items-center px-3 py-1 text-sm font-medium text-teal-600 bg-teal-50 rounded-md hover:bg-teal-100 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-1"
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
              Événement
            </button>
            <button
              onClick={handleCreateTask}
              className="flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-1"
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
              Tâche
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Grille du calendrier */}
          <div className="lg:col-span-3">
            <CalendarGrid
              monthData={currentMonthData}
              onDayClick={handleDayClick}
              onEventClick={handleEditEvent}
              filterType={filterType} // ✅ CORRECTION : Prop ajoutée
            />
          </div>

          {/* Liste des événements */}
          <div className="lg:col-span-1">
            <EventsList
              events={events}
              onEventClick={handleEditEvent}
              onEventDelete={handleDeleteEvent}
            />
          </div>
        </div>
      </div>

      {/* 🗂️ MODALES */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={handleEventSubmit}
        editingEvent={editingEvent}
        modalType={modalType}
        selectedDate={selectedDate}
      />

      <DayDetailModal
        isOpen={isDayDetailModalOpen}
        onClose={() => setIsDayDetailModalOpen(false)}
        date={selectedDate}
        onEventClick={handleEditEvent}
        onEventDelete={handleDeleteEvent}
        onCreateEvent={() => {
          setIsDayDetailModalOpen(false);
          setSelectedDate(selectedDate);
          handleCreateEvent();
        }}
        onCreateTask={() => {
          setIsDayDetailModalOpen(false);
          setSelectedDate(selectedDate);
          handleCreateTask();
        }}
        loadDayData={loadDayData}
      />

      <ConfirmationComponent />
    </div>
  );
};

export default Calendar;
