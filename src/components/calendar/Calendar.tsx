// src/components/calendar/Calendar.tsx

import React, { useState, useEffect } from "react";
import { useApiService } from "../services/apiService";
import {
  useCalendar,
  useCalendarNavigation,
  useMonthViewData,
} from "../contexts/CalendarContext";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import EventModal from "./EventModal";
import DayDetailModal from "./DayDetailModal";
import EventsList from "./EventsList";
import { CreateEventRequest, EventDto } from "../types/calendar";
import { useConfirmation } from "../dashboard/useConfirmation";

interface CalendarProps {
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({ className = "" }) => {
  const api = useApiService();
  const { state, dispatch } = useCalendar();
  const { currentMonth, currentYear } = useCalendarNavigation();
  const { currentMonthData, getMonthKey } = useMonthViewData();
  const { confirm, ConfirmationComponent } = useConfirmation();

  // États pour les modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDayDetailModalOpen, setIsDayDetailModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventDto | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [modalType, setModalType] = useState<"event" | "task">("event");

  // Charger les données du mois courant
  useEffect(() => {
    const loadMonthData = async () => {
      const monthKey = getMonthKey(currentMonth, currentYear);

      // Éviter de recharger si on a déjà les données
      if (currentMonthData.length > 0) return;

      dispatch({
        type: "SET_LOADING",
        payload: { key: "monthView", loading: { isLoading: true } },
      });

      try {
        const monthData = await api.calendar.getMonthView(
          currentYear,
          currentMonth
        );
        dispatch({
          type: "SET_MONTH_VIEW_DATA",
          payload: { key: monthKey, data: monthData },
        });
      } catch (error) {
        console.error("Erreur lors du chargement du mois:", error);
        dispatch({
          type: "SET_LOADING",
          payload: {
            key: "monthView",
            loading: { isLoading: false, error: "Erreur de chargement" },
          },
        });
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "monthView", loading: { isLoading: false } },
        });
      }
    };

    loadMonthData();
  }, [
    currentMonth,
    currentYear,
    api.calendar,
    dispatch,
    currentMonthData.length,
    getMonthKey,
  ]);

  // Gestionnaires d'événements
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
      await api.calendar.deleteEvent(eventId);
      dispatch({ type: "DELETE_EVENT", payload: eventId });

      // Recharger les données du mois pour mettre à jour l'affichage
      const monthKey = getMonthKey(currentMonth, currentYear);
      const monthData = await api.calendar.getMonthView(
        currentYear,
        currentMonth
      );
      dispatch({
        type: "SET_MONTH_VIEW_DATA",
        payload: { key: monthKey, data: monthData },
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setIsDayDetailModalOpen(true);
  };

  const handleEventSubmit = async (eventData: CreateEventRequest) => {
    try {
      if (editingEvent) {
        // Modification
        const updated = await api.calendar.updateEvent(
          editingEvent.id,
          eventData
        );
        dispatch({
          type: "UPDATE_EVENT",
          payload: { id: editingEvent.id, event: updated },
        });
      } else {
        // Création
        if (modalType === "task") {
          await api.calendar.createTaskFromCalendar(eventData);
        } else {
          const created = await api.calendar.createEvent(eventData);
          dispatch({ type: "ADD_EVENT", payload: created });
        }
      }

      // Recharger les données du mois
      const monthKey = getMonthKey(currentMonth, currentYear);
      const monthData = await api.calendar.getMonthView(
        currentYear,
        currentMonth
      );
      dispatch({
        type: "SET_MONTH_VIEW_DATA",
        payload: { key: monthKey, data: monthData },
      });

      setIsEventModalOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      throw error; // Laisser le modal gérer l'erreur
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header avec navigation et actions */}
      <CalendarHeader />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendrier principal */}
          <div className="lg:col-span-3">
            <CalendarGrid
              monthData={currentMonthData}
              onDayClick={handleDayClick}
              onEventClick={handleEditEvent}
            />
          </div>

          {/* Sidebar avec liste des événements */}
          <div className="lg:col-span-1">
            <EventsList
              events={state.events}
              onEventClick={handleEditEvent}
              onEventDelete={handleDeleteEvent}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
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
