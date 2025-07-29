import { CalendarViewDto, EventDto, CreateEventRequest } from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message || `Erreur ${response.status}: ${response.statusText}`
    );
  }

  const text = await response.text();
  return text && text.trim() !== "" ? JSON.parse(text) : null;
};

export const calendarApi = {
  getMonthView: async (
    year: number,
    month: number
  ): Promise<CalendarViewDto[]> => {
    const response = await fetch(
      `${API_BASE_URL}/calendar/month/${year}/${month}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  getDayView: async (date: string): Promise<CalendarViewDto> => {
    const response = await fetch(`${API_BASE_URL}/calendar/day/${date}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getAllEvents: async (): Promise<EventDto[]> => {
    const response = await fetch(`${API_BASE_URL}/calendar/events`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getEventById: async (id: number): Promise<EventDto> => {
    const response = await fetch(`${API_BASE_URL}/calendar/events/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createEvent: async (event: CreateEventRequest): Promise<EventDto> => {
    const response = await fetch(`${API_BASE_URL}/calendar/events`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(event),
    });
    return handleResponse(response);
  },

  updateEvent: async (
    id: number,
    event: CreateEventRequest
  ): Promise<EventDto> => {
    const response = await fetch(`${API_BASE_URL}/calendar/events/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(event),
    });
    return handleResponse(response);
  },

  deleteEvent: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/calendar/events/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    await handleResponse(response);
  },

  createTaskFromCalendar: async (taskData: {
    title: string;
    description?: string;
    scheduledDate?: string;
    dueDate?: string;
    priority?: number;
  }): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/calendar/create-task`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse(response);
  },

  getEventsInRange: async (
    startDate: string,
    endDate: string
  ): Promise<EventDto[]> => {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await fetch(
      `${API_BASE_URL}/calendar/events/range?${params.toString()}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },

  searchEvents: async (query: string): Promise<EventDto[]> => {
    const params = new URLSearchParams({ query });
    const response = await fetch(
      `${API_BASE_URL}/calendar/events/search?${params.toString()}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(response);
  },

  testEmail: async (): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/calendar/test-email`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
