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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Convertisseur d'unités
        </h2>
        <p className="text-gray-600">
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
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                currentCategory === category.id
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            onClick={swapUnits}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
            title="Inverser les unités"
          >
            <svg
              className="w-5 h-5 text-gray-600"
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
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors duration-200"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {currentUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.symbol})
              </option>
            ))}
          </select>
          <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md min-h-[40px] flex items-center">
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
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
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
              className="w-24"
            />
            <span className="text-sm font-mono bg-white px-2 py-1 rounded border min-w-[2rem] text-center">
              {precision}
            </span>
          </div>
        </div>
      </div>

      {/* Historique */}
      {history.length > 0 && (
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Historique des conversions
            </h3>
            <button
              onClick={clearHistory}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
            >
              Effacer l'historique
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
            {history.slice(0, 12).map((item) => {
              const categoryInfo = categories.find(
                (cat) => cat.id === item.category
              );
              return (
                <div
                  key={item.id}
                  onClick={() => loadHistoryItem(item)}
                  className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-lg">{categoryInfo?.icon}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-800">
                      {item.fromValue} {item.fromUnit.symbol}
                    </div>
                    <div className="text-gray-600 text-xs my-1">↓</div>
                    <div className="font-medium text-blue-600">
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
