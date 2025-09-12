import React, { useState } from "react";
import { useCalendar } from "../hooks/useCalendar";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import EventModal from "./EventModal";
import DayDetailModal from "./DayDetailModal";
import EventsList from "./EventsList";
import {
  EventDto,
  CreateEventRequest,
  CreateCalendarTaskRequest,
} from "../types";
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

  const { updateTask, createTask } = useTasks();

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
    // Réinitialiser pour utiliser la date actuelle quand on clique sur le bouton de l'en-tête
    setSelectedDate("");
    setIsEventModalOpen(true);
  };

  const handleCreateEventOnDate = (date: string) => {
    setEditingEvent(null);
    setModalType("event");
    setSelectedDate(date); // Utiliser la date spécifique de la cellule
    setIsEventModalOpen(true);
  };

  const handleCreateTask = () => {
    setEditingEvent(null);
    setModalType("task");
    setIsEventModalOpen(true);
  };

  const handleCreateTaskGeneral = () => {
    setEditingEvent(null);
    setModalType("task");
    setSelectedDate("");
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
    try {
      // Vérifier si c'est une tâche basée sur la présence de 'priority' et 'dueDate'
      const isTask = "priority" in data && data.priority !== undefined;

      if (editingEvent) {
        if (isTask) {
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
          await refreshCalendarData();
        } else {
          await updateEvent(editingEvent.id, data as CreateEventRequest);
        }
        setEditingEvent(null);
      } else {
        if (isTask) {
          const taskData = data as CreateTaskForm;

          // Essayer d'abord de créer via l'API des tâches directement
          try {
            await createTask(taskData);
          } catch {
            // Fallback vers l'API calendrier - Format correct pour le backend
            const calendarTaskData: CreateCalendarTaskRequest = {
              title: taskData.title,
              description: taskData.description,
              dueDate: taskData.dueDate,
              priority: taskData.priority || 2,
              orderIndex: taskData.orderIndex || 0,
            };

            await createTaskFromCalendar(calendarTaskData);
          }
        } else {
          // Améliorer le format des données pour les événements
          const eventData = data as CreateEventRequest;
          const improvedEventData: CreateEventRequest = {
            ...eventData,
            // S'assurer que les dates sont au bon format
            startDate: eventData.startDate.includes("T")
              ? eventData.startDate.length === 16
                ? eventData.startDate + ":00"
                : eventData.startDate
              : eventData.startDate + "T09:00:00",
            endDate: eventData.endDate.includes("T")
              ? eventData.endDate.length === 16
                ? eventData.endDate + ":00"
                : eventData.endDate
              : eventData.endDate + "T10:00:00",
            // S'assurer que le type est correct
            type: "EVENT",
            // Nettoyer les champs optionnels vides
            description: eventData.description?.trim() || undefined,
            location: eventData.location?.trim() || undefined,
            meetingLink: eventData.meetingLink?.trim() || undefined,
          };

          await createEvent(improvedEventData);
        }
      }

      setRefreshTrigger((prev) => prev + 1);
      setIsEventModalOpen(false);
    } catch (error) {
      console.error("❌ Erreur lors de la soumission:", error);
      // L'erreur sera gérée par le hook useCalendar qui mettra à jour l'état d'erreur
      throw error;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
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
          <div className="lg:col-span-3">
            <CalendarGrid
              monthData={currentMonthData}
              onDayClick={handleDayClick}
              onEventClick={handleEditEvent}
              filterType={filterType}
            />
          </div>

          <div className="lg:col-span-1">
            <EventsList
              events={events}
              onEventClick={handleEditEvent}
              onEventDelete={handleDeleteEvent}
            />
          </div>
        </div>
      </div>

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
          handleCreateEventOnDate(selectedDate);
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
