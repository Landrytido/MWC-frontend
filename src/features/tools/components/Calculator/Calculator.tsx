import React, { useState } from "react";
import { useCalculator } from "../../hooks/useCalculator";
import { CalculatorService } from "../../services/calculatorService";

export const Calculator: React.FC = () => {
  const {
    currentExpression,
    hasError,
    inputNumber,
    inputDecimal,
    performOperation,
    performUnaryOperation,
    calculate,
    clear,
    clearEntry,
    handleBackspace,
  } = useCalculator();

  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState(() => CalculatorService.getHistory());

  const handleHistoryToggle = () => {
    setShowHistory(!showHistory);
    if (!showHistory) {
      setHistory(CalculatorService.getHistory());
    }
  };

  const clearHistory = () => {
    CalculatorService.clearHistory();
    setHistory([]);
  };

  const buttons = [
    // Première ligne
    [
      { text: "CE", onClick: clearEntry, className: "function-btn" },
      { text: "C", onClick: clear, className: "function-btn" },
      { text: "⌫", onClick: handleBackspace, className: "function-btn" },
      {
        text: "÷",
        onClick: () => performOperation("divide"),
        className: "operator-btn",
      },
    ],
    // Deuxième ligne
    [
      { text: "7", onClick: () => inputNumber("7"), className: "number-btn" },
      { text: "8", onClick: () => inputNumber("8"), className: "number-btn" },
      { text: "9", onClick: () => inputNumber("9"), className: "number-btn" },
      {
        text: "×",
        onClick: () => performOperation("multiply"),
        className: "operator-btn",
      },
    ],
    // Troisième ligne
    [
      { text: "4", onClick: () => inputNumber("4"), className: "number-btn" },
      { text: "5", onClick: () => inputNumber("5"), className: "number-btn" },
      { text: "6", onClick: () => inputNumber("6"), className: "number-btn" },
      {
        text: "−",
        onClick: () => performOperation("subtract"),
        className: "operator-btn",
      },
    ],
    // Quatrième ligne
    [
      { text: "1", onClick: () => inputNumber("1"), className: "number-btn" },
      { text: "2", onClick: () => inputNumber("2"), className: "number-btn" },
      { text: "3", onClick: () => inputNumber("3"), className: "number-btn" },
      {
        text: "+",
        onClick: () => performOperation("add"),
        className: "operator-btn",
      },
    ],
    // Cinquième ligne
    [
      {
        text: "±",
        onClick: () => performUnaryOperation("toggleSign"),
        className: "function-btn",
      },
      { text: "0", onClick: () => inputNumber("0"), className: "number-btn" },
      { text: ".", onClick: inputDecimal, className: "number-btn" },
      { text: "=", onClick: calculate, className: "equals-btn" },
    ],
  ];

  const advancedButtons = [
    { text: "x²", onClick: () => performUnaryOperation("square") },
    { text: "√x", onClick: () => performUnaryOperation("squareRoot") },
    { text: "1/x", onClick: () => performUnaryOperation("reciprocal") },
    { text: "%", onClick: () => performUnaryOperation("percent") },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧮</span>
          <h3 className="text-lg font-semibold text-gray-800">Calculatrice</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleHistoryToggle}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Historique"
          >
            📜
          </button>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Effacer l'historique"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Affichage */}
      <div className="mb-4">
        <div
          className={`
          bg-gray-900 text-white text-right p-4 rounded-lg text-2xl font-mono min-h-[60px] 
          flex items-center justify-end border-2 
          ${hasError ? "border-red-500 bg-red-900" : "border-gray-700"}
        `}
        >
          {currentExpression}
        </div>
      </div>

      {/* Boutons avancés */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {advancedButtons.map((btn, index) => (
          <button
            key={index}
            onClick={btn.onClick}
            className="h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
          >
            {btn.text}
          </button>
        ))}
      </div>

      {/* Clavier principal */}
      <div className="grid grid-cols-4 gap-2">
        {buttons.flat().map((btn, index) => (
          <button
            key={index}
            onClick={btn.onClick}
            className={`
              h-12 rounded-lg font-medium transition-colors text-lg
              ${
                btn.className === "number-btn"
                  ? "bg-white hover:bg-gray-50 text-gray-800 border border-gray-300"
                  : btn.className === "operator-btn"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : btn.className === "function-btn"
                  ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  : btn.className === "equals-btn"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }
            `}
          >
            {btn.text}
          </button>
        ))}
      </div>

      {/* Historique */}
      {showHistory && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Historique</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {history.length === 0 ? (
              <p className="text-xs text-gray-500 italic">
                Aucun calcul effectué
              </p>
            ) : (
              history.map((entry, index) => (
                <div
                  key={index}
                  className="text-xs bg-gray-50 p-2 rounded flex justify-between"
                >
                  <span className="text-gray-600">{entry.expression}</span>
                  <span className="font-mono font-medium">{entry.result}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Aide clavier */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Utilisez votre clavier : chiffres, +, -, *, /, Entrée (=), Échap (C)
      </div>
    </div>
  );
};
