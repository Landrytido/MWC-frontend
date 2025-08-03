import React, { useState, useEffect } from "react";
import { useCalendarEvents } from "../hooks/useCalendarEvents";

import {
  useCalendar,
  useCalendarNavigation,
  useMonthViewData,
} from "../CalendarContext";

import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import EventModal from "./EventModal";
import DayDetailModal from "./DayDetailModal";
import EventsList from "./EventsList";
import { CreateEventRequest, EventDto } from "../types";
import { CreateTaskForm } from "../../tasks";
import { useConfirmation } from "../../../shared/hooks/useConfirmation";

interface CalendarProps {
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({ className = "" }) => {
  const {
    loadMonthData,
    createEvent,
    updateEvent,
    deleteEvent,
    createTaskFromCalendar,
  } = useCalendarEvents();

  const { state, dispatch } = useCalendar();
  const { currentMonth, currentYear } = useCalendarNavigation();
  const { currentMonthData, getMonthKey } = useMonthViewData();
  const { confirm, ConfirmationComponent } = useConfirmation();

  // États locaux inchangés
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDayDetailModalOpen, setIsDayDetailModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventDto | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [modalType, setModalType] = useState<"event" | "task">("event");

  useEffect(() => {
    loadMonthData(currentMonth, currentYear);
  }, [currentMonth, currentYear, loadMonthData]);

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
      message:
        "Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.",
      confirmText: "Supprimer",
      cancelText: "Annuler",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      // ✅ NOUVEAU : Utilise le hook au lieu de l'API directement
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
        if (modalType === "task" && editingEvent.relatedTaskId) {
          // ✅ NOUVEAU : Gestion des tâches via le hook
          await updateEvent(editingEvent.id, data as CreateEventRequest);
        } else {
          // ✅ NOUVEAU : Utilise le hook pour la mise à jour
          await updateEvent(editingEvent.id, data as CreateEventRequest);
        }
      } else {
        if (modalType === "task") {
          // ✅ NOUVEAU : Création de tâche via le hook
          await createTaskFromCalendar(data as CreateTaskForm);
        } else {
          // ✅ NOUVEAU : Création d'événement via le hook
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
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      <CalendarHeader />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <CalendarGrid
              monthData={currentMonthData}
              onDayClick={handleDayClick}
              onEventClick={handleEditEvent}
            />
          </div>

          <div className="lg:col-span-1">
            <EventsList
              events={state.events}
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
          setSelectedDate(selectedDate);
          handleCreateEvent();
        }}
        onCreateTask={() => {
          setIsDayDetailModalOpen(false);
          setSelectedDate(selectedDate);
          handleCreateTask();
        }}
      />

      <ConfirmationComponent />
    </div>
  );
};

export default Calendar;
