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
    fetchForecast,
    search,
  } = useWeather();

  const doSearch = async () => {
    if (!q) return;
    await search(q);
  };

  const selectLocation = (locName: string) => {
    fetchCurrent(locName);
    fetchForecast(locName, 3);
  };

  // Sur le montage, essayer de récupérer la position de l'utilisateur
  useEffect(() => {
    let mounted = true;
    const fallback = async () => {
      // fallback léger si l'utilisateur refuse la géoloc
      try {
        await fetchCurrent("Paris");
        await fetchForecast("Paris", 3);
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
          // Try to convert coordinates to a city name (reverse geocoding)
          try {
            const city = await (async function reverseGeocode(latNum: number, lonNum: number) {
              try {
                const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latNum)}&lon=${encodeURIComponent(lonNum)}`;
                const res = await fetch(url, {
                  headers: {
                    Accept: 'application/json'
                  }
                });
                if (!res.ok) return null;
                const data = await res.json();
                const addr = data?.address ?? {};
                return addr.city || addr.town || addr.village || addr.hamlet || addr.county || data?.display_name || null;
              } catch {
                return null;
              }
            })(lat, lon);

            if (city) {
              await fetchCurrent(city);
              await fetchForecast(city, 3);
            } else {
              // si reverse-geocode échoue, retomber sur une ville par défaut
              await fallback();
            }
          } catch {
            // fallback to text city
            await fallback();
          }
        },
        async () => {
          // permission denied or error
          await fallback();
        },
        { timeout: 5000 }
      );
    } else {
      // pas de géoloc disponible
      fallback();
    }

    return () => {
      mounted = false;
    };
  }, [fetchCurrent, fetchForecast]);

  return (
    <div className="bg-white rounded-lg shadow p-4 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-3">Météo</h3>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher une ville"
          className="flex-1 px-2 py-1 border rounded"
        />
        <button
          onClick={doSearch}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Rechercher
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="mb-3">
          <div className="text-sm text-gray-600 mb-1">Résultats :</div>
          <ul className="grid grid-cols-2 gap-2">
            {searchResults.map((s) => (
              <li key={`${s.name}-${s.lat}-${s.lon}`}>
                <button
                  className="w-full text-left p-2 border rounded"
                  onClick={() => selectLocation(s.name)}
                >
                  {s.name} {s.region ? `(${s.region})` : ""} — {s.country}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isLoading && <div>Chargement…</div>}
      {error && <div className="text-red-600">Erreur: {error}</div>}

      {current && (
        <div className="mb-3">
          <div className="text-sm text-gray-600">
            Actuel — {current.location.name}, {current.location.region ?? ""}
          </div>
          <div className="text-2xl font-bold">
            {current.current.temperature}°C — {current.current.condition}
          </div>
          <div className="text-xs text-gray-500">
            Humidité {current.current.humidity}% — Vent{" "}
            {current.current.windSpeed} km/h
          </div>
        </div>
      )}

      {forecast && (
        <div>
          <div className="text-sm text-gray-600 mb-2">Prévisions</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {forecast.forecast.map((d) => (
              <div key={d.date} className="p-2 border rounded">
                <div className="font-medium">{d.date}</div>
                <div className="text-sm">{d.condition}</div>
                <div className="text-sm">
                  {d.maxTemp}° / {d.minTemp}°
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
