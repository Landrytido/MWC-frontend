export interface WeatherLocation {
  name: string;
  country: string;
  region?: string;
  lat: number;
  lon: number;
}

export interface CurrentWeather {
  temperature: number;
  condition: string;
  conditionIcon?: string | number;
  humidity?: number;
  windSpeed?: number;
  windDirection?: string;
  feelsLike?: number;
  uvIndex?: number;
  visibility?: number;
  pressure?: number;
}

export interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  conditionIcon?: string | number;
  chanceOfRain?: number;
  humidity?: number;
  windSpeed?: number;
}

export interface CurrentWeatherResponse {
  timestamp: string;
  location: WeatherLocation;
  current: CurrentWeather;
}

export interface ForecastResponse {
  location: WeatherLocation;
  forecast: ForecastDay[];
}

export interface ServiceStatus {
  status: string;
  message?: string;
  timestamp?: string;
  apiConfigured?: boolean;
}
