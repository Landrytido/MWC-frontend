import React, { useState } from "react";
import { useCalendar } from "../hooks/useCalendar";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import EventModal from "./EventModal";
import DayDetailModal from "./DayDetailModal";
import EventsList from "./EventsList";
import { EventDto, CreateEventRequest } from "../types";
import { CreateTaskForm, UpdateTaskForm } from "../../tasks/types";
import { useTasks } from "../../tasks/hooks/useTasks";
import { useConfirmation } from "../../../shared/hooks/useConfirmation";

const Calendar: React.FC = () => {
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
    loadDayData,
    createTaskFromCalendar,
    refreshCalendarData,
  } = useCalendar();

  const { updateTask } = useTasks();

  const { confirm, ConfirmationComponent } = useConfirmation();

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDayDetailModalOpen, setIsDayDetailModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventDto | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [modalType, setModalType] = useState<"event" | "task">("event");
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const [filterType, setFilterType] = useState<"all" | "events" | "tasks">(
    "all"
  );

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setModalType("event");
    setSelectedDate(""); // Réinitialiser pour utiliser la date actuelle
    setIsEventModalOpen(true);
  };

  const handleCreateTask = () => {
    setEditingEvent(null);
    setModalType("task");
    // selectedDate reste inchangé pour utiliser la date cliquée
    setIsEventModalOpen(true);
  };

  const handleCreateTaskGeneral = () => {
    setEditingEvent(null);
    setModalType("task");
    setSelectedDate(""); // Pas de date pré-sélectionnée
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: EventDto) => {
    setEditingEvent(event);
    setModalType(event.type === "TASK_BASED" ? "task" : "event");
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
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setIsDayDetailModalOpen(true);
  };

  const handleEventSubmit = async (
    data: CreateEventRequest | CreateTaskForm
  ) => {
    const isTask = "dueDate" in data && "priority" in data;

    if (editingEvent) {
      if (isTask) {
        // Modifier la tâche en utilisant l'API des tâches
        if (!editingEvent.relatedTaskId) {
          throw new Error("ID de tâche manquant pour la modification");
        }

        const taskData = data as CreateTaskForm;
        const updateTaskData: UpdateTaskForm = {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
        };

        await updateTask(editingEvent.relatedTaskId, updateTaskData);

        // Rafraîchir le calendrier pour refléter les changements de la tâche
        await refreshCalendarData();
      } else {
        await updateEvent(editingEvent.id, data as CreateEventRequest);
      }
      setEditingEvent(null);
    } else {
      if (isTask) {
        await createTaskFromCalendar(data as CreateEventRequest);
      } else {
        await createEvent(data as CreateEventRequest);
      }
    }

    setRefreshTrigger((prev) => prev + 1);
    setIsEventModalOpen(false);
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
        {/* Filtres pour le calendrier */}
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
              onClick={handleCreateTaskGeneral}
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
              filterType={filterType}
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
        refreshTrigger={refreshTrigger}
      />

      <ConfirmationComponent />
    </div>
  );
};

export default Calendar;
