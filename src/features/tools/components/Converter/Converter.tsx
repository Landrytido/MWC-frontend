import React from "react";
import { useConverter } from "../../hooks/useConverter";

export const Converter: React.FC = () => {
  const {
    currentCategory,
    fromUnit,
    toUnit,
    inputValue,
    result,
    precision,
    isLoading,
    error,
    history,
    categories,
    changeCategory,
    setFromUnit,
    setToUnit,
    setInputValue,
    setPrecision,
    swapUnits,
    clearInput,
    clearHistory,
    loadHistoryItem,
    getCurrentUnits,
  } = useConverter();

  const currentUnits = getCurrentUnits();
  const currentCategoryInfo = categories.find(
    (cat) => cat.id === currentCategory
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-teal-100 p-2 rounded-lg">
            <svg
              className="w-5 h-5 text-teal-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Convertisseur d'unités
          </h2>
        </div>
        <p className="text-gray-600 text-sm">
          Convertissez facilement entre différentes unités physiques
        </p>
      </div>

      {/* Sélection de catégorie */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Catégorie d'unités
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => changeCategory(category.id)}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                currentCategory === category.id
                  ? "border-teal-500 bg-teal-100 text-teal-700"
                  : "border-gray-200 hover:border-teal-300 hover:bg-gray-50 text-gray-700"
              }`}
              title={category.description}
            >
              <div className="text-lg mb-1">{category.icon}</div>
              <div className="text-xs font-medium">{category.name}</div>
            </button>
          ))}
        </div>
        {currentCategoryInfo && (
          <p className="text-sm text-gray-500 mt-2">
            {currentCategoryInfo.description} • Unité de base:{" "}
            {currentCategoryInfo.baseUnit}
          </p>
        )}
      </div>

      {/* Zone de conversion principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Unité source */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Convertir de
          </label>
          <select
            value={fromUnit.id}
            onChange={(e) => {
              const unit = currentUnits.find((u) => u.id === e.target.value);
              if (unit) setFromUnit(unit);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {currentUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.symbol})
              </option>
            ))}
          </select>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Entrez une valeur"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          {inputValue && (
            <p className="text-xs text-gray-500">
              {inputValue} {fromUnit.symbol}
            </p>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <button
            onClick={() => {
              swapUnits();
            }}
            className="p-2 bg-teal-100 hover:bg-teal-200 rounded-lg transition-colors duration-200"
            title="Inverser les unités"
          >
            <svg
              className="w-5 h-5 text-teal-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </button>
          <button
            onClick={clearInput}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            title="Effacer"
          >
            Effacer
          </button>
        </div>

        {/* Unité cible */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Convertir vers
          </label>
          <select
            value={toUnit.id}
            onChange={(e) => {
              const unit = currentUnits.find((u) => u.id === e.target.value);
              if (unit) setToUnit(unit);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {currentUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.symbol})
              </option>
            ))}
          </select>
          <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg min-h-[40px] flex items-center">
            {isLoading ? (
              <span className="text-gray-500">Conversion...</span>
            ) : error ? (
              <span className="text-red-500 text-sm">{error}</span>
            ) : result ? (
              <span className="font-medium text-gray-900">
                {result.formattedResult}
              </span>
            ) : (
              <span className="text-gray-400">Résultat</span>
            )}
          </div>
          {result && (
            <p className="text-xs text-gray-500">
              {result.formattedResult} {toUnit.symbol}
            </p>
          )}
        </div>
      </div>

      {/* Options de précision */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Précision (décimales)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="15"
              value={precision}
              onChange={(e) => setPrecision(Number(e.target.value))}
              className="w-24 accent-teal-600"
            />
            <span className="text-sm font-mono bg-white px-2 py-1 rounded-lg border border-gray-200 min-w-[2rem] text-center">
              {precision}
            </span>
          </div>
        </div>
      </div>

      {/* Historique */}
      {history.length > 0 && (
        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700">Historique</h3>
            <button
              onClick={clearHistory}
              className="px-2 py-1 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
            >
              Effacer
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 max-h-48 overflow-y-auto">
            {history.slice(0, 15).map((item) => {
              const categoryInfo = categories.find(
                (cat) => cat.id === item.category
              );
              return (
                <div
                  key={item.id}
                  onClick={() => loadHistoryItem(item)}
                  className="p-2 bg-gray-50/70 hover:bg-gray-100/80 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200 group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm opacity-60 group-hover:opacity-80">
                      {categoryInfo?.icon}
                    </span>
                    <span className="text-[10px] text-gray-400 group-hover:text-gray-500">
                      {new Date(item.timestamp).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="text-xs space-y-0.5">
                    <div className="font-medium text-gray-700 truncate">
                      {item.fromValue} {item.fromUnit.symbol}
                    </div>
                    <div className="text-teal-600 font-medium truncate">
                      {item.formattedResult} {item.toUnit.symbol}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
