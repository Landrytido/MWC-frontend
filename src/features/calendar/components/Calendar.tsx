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
  // 🎣 HOOK PRINCIPAL - Pattern identique aux autres features
  const {
    currentMonth,
    currentYear,
    currentMonthData,
    events,
    loading,
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

  // 🗄️ ÉTAT LOCAL DU COMPOSANT (modales uniquement)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDayDetailModalOpen, setIsDayDetailModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventDto | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [modalType, setModalType] = useState<"event" | "task">("event");

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

  const handleEventSubmit = async (
    data: CreateEventRequest | CreateTaskForm
  ) => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, data as CreateEventRequest);
      } else {
        if (modalType === "task") {
          const eventData = data as CreateTaskForm;
          await createTaskFromCalendar({
            title: eventData.title,
            description: eventData.description,
            scheduledDate: eventData.scheduledDate,
            dueDate: eventData.dueDate,
            priority: eventData.priority,
          });
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Grille du calendrier */}
          <div className="lg:col-span-3">
            <CalendarGrid
              monthData={currentMonthData}
              onDayClick={handleDayClick}
              onEventClick={handleEditEvent}
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
