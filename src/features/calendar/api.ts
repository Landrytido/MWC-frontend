import { httpService } from "../../shared/services/httpService";
import type {
  CalendarViewDto,
  EventDto,
  CreateEventRequest,
  TaskDto,
} from "./types";

export const calendarApi = {
  getMonthView: (year: number, month: number): Promise<CalendarViewDto[]> =>
    httpService.get(`/calendar/month/${year}/${month}`),

  getDayView: (date: string): Promise<CalendarViewDto> =>
    httpService.get(`/calendar/day/${date}`),

  getAllEvents: (): Promise<EventDto[]> => httpService.get("/calendar/events"),

  getEventById: (id: number): Promise<EventDto> =>
    httpService.get(`/calendar/events/${id}`),

  createEvent: (event: CreateEventRequest): Promise<EventDto> =>
    httpService.post("/calendar/events", event),

  updateEvent: (id: number, event: CreateEventRequest): Promise<EventDto> =>
    httpService.put(`/calendar/events/${id}`, event),

  deleteEvent: (id: number): Promise<void> =>
    httpService.delete(`/calendar/events/${id}`),

  createTaskFromCalendar: (taskData: CreateEventRequest): Promise<TaskDto> =>
    httpService.post("/calendar/create-task", taskData),

  getEventsInRange: (startDate: string, endDate: string): Promise<EventDto[]> =>
    httpService.get("/calendar/events/range", { startDate, endDate }),

  searchEvents: (query: string): Promise<EventDto[]> =>
    httpService.get("/calendar/events/search", { query }),

  testEmail: (): Promise<{ message: string; success: boolean }> =>
    httpService.post("/calendar/test-email"),
};
