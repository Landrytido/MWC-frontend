import { useState, useCallback } from "react";
import { WeatherService } from "../services/weatherService";
import {
  CurrentWeatherResponse,
  ForecastResponse,
  WeatherLocation,
  ServiceStatus,
} from "../types/weather";

export function useWeather() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<CurrentWeatherResponse | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [searchResults, setSearchResults] = useState<WeatherLocation[]>([]);
  const [status, setStatus] = useState<ServiceStatus | null>(null);

  const fetchCurrent = useCallback(async (location: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await WeatherService.getCurrent(location);
      setCurrent(res);
    } catch {
      setError("Erreur lors de la récupération des données météo");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchForecast = useCallback(async (location: string, days = 3) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await WeatherService.getForecast(location, days);
      setForecast(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await WeatherService.search(q);
      setSearchResults(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStatus = useCallback(async () => {
    try {
      const s = await WeatherService.getStatus();
      setStatus(s);
    } catch {
      /* empty */
    }
  }, []);

  return {
    isLoading,
    error,
    current,
    forecast,
    searchResults,
    status,
    fetchCurrent,
    fetchForecast,
    search,
    getStatus,
  };
}
