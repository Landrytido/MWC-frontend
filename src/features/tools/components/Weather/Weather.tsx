import React, { useState, useEffect } from "react";
import { useWeather } from "../../hooks/useWeather";

export const Weather: React.FC = () => {
  const [q, setQ] = useState("");
  const {
    isLoading,
    error,
    current,
    forecast,
    searchResults,
    fetchCurrent,
    fetchCurrentByCoordinates,
    fetchForecast,
    fetchForecastByCoordinates,
    search,
    clearSearchResults,
  } = useWeather();

  const doSearch = async () => {
    if (!q) return;
    await search(q);
  };

  const selectLocation = (locName: string) => {
    fetchCurrent(locName);
    fetchForecast(locName, 3);
    clearSearchResults();
    setQ("");
  };

  useEffect(() => {
    let mounted = true;
    const fallback = async () => {
      try {
        await fetchCurrent("Brussels");
        await fetchForecast("Brussels", 3);
      } catch {
        // noop
      }
    };

    if (navigator && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (!mounted) return;
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            await fetchCurrentByCoordinates(lat, lon);
            await fetchForecastByCoordinates(lat, lon, 3);
          } catch {
            await fallback();
          }
        },
        async () => {
          await fallback();
        },
        { timeout: 5000 }
      );
    } else {
      fallback();
    }

    return () => {
      mounted = false;
    };
  }, [
    fetchCurrent,
    fetchForecast,
    fetchCurrentByCoordinates,
    fetchForecastByCoordinates,
  ]);

  // Fonction pour traduire les conditions météo en français
  const translateWeatherCondition = (condition: string): string => {
    const translations: { [key: string]: string } = {
      // Conditions ensoleillées
      sunny: "Ensoleillé",
      clear: "Dégagé",
      bright: "Lumineux",

      // Conditions nuageuses
      cloudy: "Nuageux",
      overcast: "Couvert",
      "partly cloudy": "Partiellement nuageux",
      "mostly cloudy": "Majoritairement nuageux",
      "scattered clouds": "Nuages épars",
      "broken clouds": "Nuages fragmentés",
      "few clouds": "Quelques nuages",

      // Conditions pluvieuses
      rainy: "Pluvieux",
      rain: "Pluie",
      "light rain": "Pluie légère",
      "moderate rain": "Pluie modérée",
      "heavy rain": "Pluie forte",
      drizzle: "Bruine",
      showers: "Averses",
      thunderstorm: "Orage",
      storm: "Tempête",

      // Conditions neigeuses
      snow: "Neige",
      "light snow": "Neige légère",
      "heavy snow": "Neige forte",
      sleet: "Grésil",
      "freezing rain": "Pluie verglaçante",

      // Autres conditions
      fog: "Brouillard",
      mist: "Brume",
      haze: "Brume de chaleur",
      windy: "Venteux",
      breezy: "Légère brise",
    };

    const lowerCondition = condition.toLowerCase();

    // Chercher une traduction exacte
    if (translations[lowerCondition]) {
      return translations[lowerCondition];
    }

    // Chercher une traduction partielle
    for (const [english, french] of Object.entries(translations)) {
      if (lowerCondition.includes(english)) {
        return french;
      }
    }

    // Si aucune traduction trouvée, retourner la condition originale
    return condition;
  };

  // Fonction pour obtenir l'icône météo selon la condition
  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();

    if (
      lowerCondition.includes("sunny") ||
      lowerCondition.includes("clear") ||
      lowerCondition.includes("bright")
    ) {
      return (
        <svg
          className="w-8 h-8 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else if (
      lowerCondition.includes("cloud") ||
      lowerCondition.includes("overcast")
    ) {
      return (
        <svg
          className="w-8 h-8 text-gray-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.938-1.07A2.5 2.5 0 0113.5 16h-8z" />
        </svg>
      );
    } else if (
      lowerCondition.includes("rain") ||
      lowerCondition.includes("drizzle") ||
      lowerCondition.includes("shower")
    ) {
      return (
        <svg
          className="w-8 h-8 text-blue-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.938-1.07A2.5 2.5 0 0113.5 16h-8zm2.5 1.5a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zm3 0a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else if (
      lowerCondition.includes("snow") ||
      lowerCondition.includes("sleet")
    ) {
      return (
        <svg
          className="w-8 h-8 text-blue-300"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v.323l.707-.707a1 1 0 011.414 1.414L12.414 4.737a1 1 0 01-1.414 0L10.293 4.03A1 1 0 0111.707 2.616L11 3.323V3a1 1 0 011-1zM6 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else if (
      lowerCondition.includes("storm") ||
      lowerCondition.includes("thunder")
    ) {
      return (
        <svg
          className="w-8 h-8 text-purple-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else {
      // Icône par défaut (nuages)
      return (
        <svg
          className="w-8 h-8 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.938-1.07A2.5 2.5 0 0113.5 16h-8z" />
        </svg>
      );
    }
  };

  const goToCurrentLocation = async () => {
    if (navigator && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            await fetchCurrentByCoordinates(lat, lon);
            await fetchForecastByCoordinates(lat, lon, 3);
          } catch {
            await fetchCurrent("Brussels");
            await fetchForecast("Brussels", 3);
          }
        },
        async () => {
          await fetchCurrent("Brussels");
          await fetchForecast("Brussels", 3);
        },
        { timeout: 5000 }
      );
    } else {
      await fetchCurrent("Brussels");
      await fetchForecast("Brussels", 3);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-w-2xl mx-auto border border-gray-200">
      {/* Header avec bouton de localisation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-teal-100 p-2 rounded-lg">
            <svg
              className="w-5 h-5 text-teal-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.938-1.07A2.5 2.5 0 0113.5 16h-8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Météo</h3>
        </div>

        <button
          onClick={goToCurrentLocation}
          className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          title="Revenir à ma localisation"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          Ma position
        </button>
      </div>

      {/* Barre de recherche compacte */}
      <div className="relative mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une ville..."
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors text-sm"
            />
            <svg
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={doSearch}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Rechercher
          </button>
        </div>
      </div>

      {/* Résultats de recherche */}
      {searchResults.length > 0 && (
        <div className="mb-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-gray-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              Résultats :
            </div>
            <button
              onClick={() => {
                clearSearchResults();
                setQ("");
              }}
              className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
              title="Fermer les résultats"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {searchResults.map((s) => (
              <li key={`${s.name}-${s.lat}-${s.lon}`}>
                <button
                  className="w-full text-left p-2 bg-white hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded text-sm transition-colors"
                  onClick={() => selectLocation(s.name)}
                >
                  <div className="font-medium text-gray-800">{s.name}</div>
                  <div className="text-xs text-gray-500">
                    {s.region ? `${s.region}, ` : ""}
                    {s.country}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* État de chargement */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700 text-sm">Chargement...</span>
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Erreur: {error}</span>
          </div>
        </div>
      )}

      {/* Météo actuelle */}
      {current && (
        <div className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                Maintenant
              </div>
              <div className="text-base font-semibold text-gray-800">
                {current.location.name}
                {current.location.region && (
                  <span className="text-gray-600">
                    , {current.location.region}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              {getWeatherIcon(current.current.condition)}
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {current.current.temperature}°C
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {translateWeatherCondition(current.current.condition)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded border text-center">
                <div className="text-xs text-gray-500 mb-1">Humidité</div>
                <div className="text-sm font-semibold text-teal-600">
                  {current.current.humidity}%
                </div>
              </div>
              <div className="bg-white p-2 rounded border text-center">
                <div className="text-xs text-gray-500 mb-1">Vent</div>
                <div className="text-sm font-semibold text-blue-600">
                  {current.current.windSpeed} km/h
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prévisions */}
      {forecast && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-1 mb-3">
            <svg
              className="w-4 h-4 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            <h4 className="text-sm font-semibold text-gray-700">
              Prévisions 3 jours
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {forecast.forecast.map((d, index) => (
              <div
                key={d.date}
                className="p-3 bg-white rounded border hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-700">
                    {index === 0 ? "Aujourd'hui" : d.date}
                  </div>
                  {getWeatherIcon(d.condition)}
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {translateWeatherCondition(d.condition)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-800">
                    {d.maxTemp}°
                  </span>
                  <span className="text-xs text-gray-500">{d.minTemp}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
