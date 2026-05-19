import React, { useState } from "react";
import { Calculator } from "./Calculator";
import { Timer } from "./Timer";
import { Converter } from "./Converter";
import { Weather } from "./Weather/Weather";
import {
  Calculator as CalculatorIcon,
  Cloud,
  Timer as TimerIcon,
  ArrowLeftRight,
  ArrowLeft,
  ChevronRight,
  Wrench,
  type LucideIcon,
} from "lucide-react";

interface ToolsManagerProps {
  className?: string;
}

type ToolType = "calculator" | "weather" | "timer" | "converter";

interface Tool {
  key: ToolType;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
  available: boolean;
}

const ToolsManager: React.FC<ToolsManagerProps> = ({ className = "" }) => {
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);

  const tools: Tool[] = [
    {
      key: "calculator",
      name: "Calculatrice",
      icon: CalculatorIcon,
      description: "Calculatrice simple pour vos calculs rapides",
      color: "bg-blue-50 border-blue-200 text-blue-800",
      available: true,
    },
    {
      key: "weather",
      name: "Météo",
      icon: Cloud,
      description: "Prévisions météorologiques locales",
      color: "bg-sky-50 border-sky-200 text-sky-800",
      available: true,
    },
    {
      key: "timer",
      name: "Timer",
      icon: TimerIcon,
      description: "Chronomètre et minuteur avec alarmes",
      color: "bg-orange-50 border-orange-200 text-orange-800",
      available: true,
    },
    {
      key: "converter",
      name: "Convertisseur",
      icon: ArrowLeftRight,
      description: "Conversion d'unités (longueur, poids, etc.)",
      color: "bg-green-50 border-green-200 text-green-800",
      available: true,
    },
  ];

  const renderActiveTool = () => {
    if (!activeTool) return null;

    const selectedTool = tools.find((tool) => tool.key === activeTool);
    const SelectedIcon = selectedTool?.icon;

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setActiveTool(null)}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </button>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            {SelectedIcon && <SelectedIcon className="w-5 h-5 mr-2" />}
            {selectedTool?.name}
          </h2>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTool === "calculator" ? (
            <Calculator />
          ) : activeTool === "timer" ? (
            <Timer />
          ) : activeTool === "converter" ? (
            <Converter />
          ) : activeTool === "weather" ? (
            <Weather />
          ) : null}
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
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center">
              <Wrench className="w-6 h-6 mr-2" />
              Boîte à outils
            </h2>
            <p className="text-gray-600">
              Outils utiles pour votre productivité quotidienne
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.key}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                    tool.available
                      ? `${tool.color} hover:scale-105`
                      : "bg-gray-50 border-gray-200 text-gray-500"
                  }`}
                  onClick={() => {
                    if (tool.available) {
                      setActiveTool(tool.key);
                    }
                  }}
                >
                  {!tool.available && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-semibold rounded-full">
                      Bientôt
                    </div>
                  )}

                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <Icon className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{tool.name}</h3>
                    <p className="text-sm opacity-75">{tool.description}</p>
                  </div>

                  {tool.available && (
                    <div className="absolute bottom-4 right-4 opacity-50">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsManager;
