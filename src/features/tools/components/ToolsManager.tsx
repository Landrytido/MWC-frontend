import React, { useState } from "react";
import { Calculator } from "./Calculator";
import { Timer } from "./Timer";
import { Converter } from "./Converter";
import { Weather } from "./Weather/Weather";

interface ToolsManagerProps {
  className?: string;
}

type ToolType = "calculator" | "weather" | "timer" | "converter";

const ToolsManager: React.FC<ToolsManagerProps> = ({ className = "" }) => {
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const tools = [
    {
      key: "calculator",
      name: "Calculatrice",
      icon: "🧮",
      description: "Calculatrice simple pour vos calculs rapides",
      color: "bg-blue-50 border-blue-200 text-blue-800",
      available: true,
    },
    {
      key: "weather",
      name: "Météo",
      icon: "🌤️",
      description: "Prévisions météorologiques locales",
      color: "bg-sky-50 border-sky-200 text-sky-800",
      available: true,
    },
    {
      key: "timer",
      name: "Timer",
      icon: "⏱️",
      description: "Chronomètre et minuteur avec alarmes",
      color: "bg-orange-50 border-orange-200 text-orange-800",
      available: true, // Maintenant disponible
    },
    {
      key: "converter",
      name: "Convertisseur",
      icon: "🔄",
      description: "Conversion d'unités (longueur, poids, etc.)",
      color: "bg-green-50 border-green-200 text-green-800",
      available: true,
    },
  ];

  const renderActiveTool = () => {
    if (!activeTool) return null;
    const ToolPlaceholder: React.FC<{ toolName: string }> = ({ toolName }) => (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">🚧</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          {toolName} - En développement
        </h3>
        <p className="text-gray-500 mb-4">
          Ce composant sera bientôt disponible !
        </p>
        <button
          onClick={() => setActiveTool(null)}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Retour aux outils
        </button>
      </div>
    );

    const selectedTool = tools.find((tool) => tool.key === activeTool);

    return (
      <div className="space-y-4">
        {/* Header avec retour */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setActiveTool(null)}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Retour
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedTool?.icon} {selectedTool?.name}
          </h2>
        </div>

        {/* Composant de l'outil */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTool === "calculator" ? (
            <Calculator />
          ) : activeTool === "timer" ? (
            <Timer />
          ) : activeTool === "converter" ? (
            <Converter />
          ) : activeTool === "weather" ? (
            <Weather />
          ) : (
            <ToolPlaceholder toolName={selectedTool?.name || ""} />
          )}

          {/* Exemple d'implementation future :
          {activeTool === "weather" && <Weather />}
          */}
        </div>
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      {activeTool ? (
        renderActiveTool()
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🛠️ Boîte à outils
            </h2>
            <p className="text-gray-600">
              Outils utiles pour votre productivité quotidienne
            </p>
          </div>

          {/* Grille des outils */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div
                key={tool.key}
                className={`relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                  tool.available
                    ? `${tool.color} hover:scale-105`
                    : "bg-gray-50 border-gray-200 text-gray-500"
                }`}
                onClick={() => {
                  if (tool.available) {
                    setActiveTool(tool.key as ToolType);
                  }
                }}
              >
                {/* Badge "Bientôt" pour les outils non disponibles */}
                {!tool.available && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-semibold rounded-full">
                    Bientôt
                  </div>
                )}

                <div className="text-center">
                  <div className="text-4xl mb-4">{tool.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{tool.name}</h3>
                  <p className="text-sm opacity-75">{tool.description}</p>
                </div>

                {/* Indicateur cliquable */}
                {tool.available && (
                  <div className="absolute bottom-4 right-4 opacity-50">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsManager;
