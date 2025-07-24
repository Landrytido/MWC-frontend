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
import { CreateTaskForm } from "../../features/tasks";
import { useConfirmation } from "../../shared/hooks/useConfirmation";

interface CalendarProps {
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({ className = "" }) => {
  const api = useApiService();
  const { state, dispatch } = useCalendar();
  const { currentMonth, currentYear } = useCalendarNavigation();
  const { currentMonthData, getMonthKey } = useMonthViewData();
  const { confirm, ConfirmationComponent } = useConfirmation();
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDayDetailModalOpen, setIsDayDetailModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventDto | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [modalType, setModalType] = useState<"event" | "task">("event");

  useEffect(() => {
    const loadMonthData = async () => {
      const monthKey = getMonthKey(currentMonth, currentYear);
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

  useEffect(() => {
    const loadAllEvents = async () => {
      try {
        const allEvents = await api.calendar.getAllEvents();
        dispatch({ type: "SET_EVENTS", payload: allEvents });
      } catch (error) {
        console.error("Erreur chargement événements:", error);
      }
    };

    if (state.events.length === 0) {
      loadAllEvents();
    }
  }, [api.calendar, dispatch, state.events.length]);
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
      await api.calendar.deleteEvent(eventId);
      dispatch({ type: "DELETE_EVENT", payload: eventId });
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

  const handleEventSubmit = async (
    data: CreateEventRequest | CreateTaskForm
  ) => {
    try {
      if (editingEvent) {
        if (modalType === "task" && editingEvent.relatedTaskId) {
          await api.tasks.update(
            editingEvent.relatedTaskId,
            data as CreateTaskForm
          );
        } else {
          const updated = await api.calendar.updateEvent(
            editingEvent.id,
            data as CreateEventRequest
          );
          dispatch({
            type: "UPDATE_EVENT",
            payload: { id: editingEvent.id, event: updated },
          });
        }
      } else {
        if (modalType === "task") {
          await api.calendar.createTaskFromCalendar(data as CreateTaskForm);
        } else {
          const created = await api.calendar.createEvent(
            data as CreateEventRequest
          );
          dispatch({ type: "ADD_EVENT", payload: created });
        }
      }

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
