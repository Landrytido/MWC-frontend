import {
  CurrentWeatherResponse,
  ForecastResponse,
  WeatherLocation,
  ServiceStatus,
} from "../types/weather";

const BASE = "http://localhost:8080/api/weather";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("AUTH_REQUIRED");
    }

    const text = await res.text();
    try {
      const err = JSON.parse(text);
      throw new Error(err.message || text || res.statusText);
    } catch {
      throw new Error(text || res.statusText);
    }
  }
  return (await res.json()) as T;
}

export const WeatherService = {
  async getCurrent(location: string): Promise<CurrentWeatherResponse> {
    const url = `${BASE}/current?location=${encodeURIComponent(location)}`;
    return fetchJson<CurrentWeatherResponse>(url);
  },

  async getForecast(location: string, days = 3): Promise<ForecastResponse> {
    const url = `${BASE}/forecast?location=${encodeURIComponent(
      location
    )}&days=${days}`;
    return fetchJson<ForecastResponse>(url);
  },

  async search(q: string): Promise<WeatherLocation[]> {
    const url = `${BASE}/search?q=${encodeURIComponent(q)}`;
    return fetchJson<WeatherLocation[]>(url);
  },

  async getStatus(): Promise<ServiceStatus> {
    const url = `${BASE}/status`;
    return fetchJson<ServiceStatus>(url);
  },
};
