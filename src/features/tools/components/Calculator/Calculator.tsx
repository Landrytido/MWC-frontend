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
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/50 p-4 max-w-sm mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg opacity-70">🧮</span>
          <h3 className="text-base font-medium text-gray-700">Calculatrice</h3>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleHistoryToggle}
            className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200 text-sm"
            title="Historique"
          >
            📜
          </button>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 text-sm"
              title="Effacer l'historique"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Affichage */}
      <div className="mb-3">
        <div
          className={`
          bg-gray-800/95 text-white text-right p-3 rounded-xl text-xl font-mono min-h-[50px] 
          flex items-center justify-end border backdrop-blur-sm
          ${hasError ? "border-red-400/50 bg-red-900/80" : "border-gray-600/30"}
        `}
        >
          {currentExpression}
        </div>
      </div>

      {/* Boutons avancés */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {advancedButtons.map((btn, index) => (
          <button
            key={index}
            onClick={btn.onClick}
            className="h-8 bg-gray-100/80 hover:bg-gray-200/80 text-gray-600 rounded-lg font-medium transition-all duration-200 text-xs backdrop-blur-sm"
          >
            {btn.text}
          </button>
        ))}
      </div>

      {/* Clavier principal */}
      <div className="grid grid-cols-4 gap-1.5">
        {buttons.flat().map((btn, index) => (
          <button
            key={index}
            onClick={btn.onClick}
            className={`
              h-10 rounded-lg font-medium transition-all duration-200 text-base backdrop-blur-sm
              ${
                btn.className === "number-btn"
                  ? "bg-white/80 hover:bg-white/90 text-gray-700 border border-gray-200/50 shadow-sm"
                  : btn.className === "operator-btn"
                  ? "bg-teal-500/90 hover:bg-teal-600/90 text-white shadow-sm"
                  : btn.className === "function-btn"
                  ? "bg-gray-200/80 hover:bg-gray-300/80 text-gray-600"
                  : btn.className === "equals-btn"
                  ? "bg-teal-600/90 hover:bg-teal-700/90 text-white shadow-sm"
                  : "bg-gray-100/80 hover:bg-gray-200/80 text-gray-600"
              }
            `}
          >
            {btn.text}
          </button>
        ))}
      </div>

      {/* Historique */}
      {showHistory && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Historique</h4>
          <div className="max-h-28 overflow-y-auto space-y-1">
            {history.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                Aucun calcul effectué
              </p>
            ) : (
              history.map((entry, index) => (
                <div
                  key={index}
                  className="text-xs bg-gray-50/70 p-2 rounded-lg flex justify-between hover:bg-gray-100/70 transition-colors duration-200"
                >
                  <span className="text-gray-500">{entry.expression}</span>
                  <span className="font-mono font-medium text-gray-700">
                    {entry.result}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Aide clavier */}
      <div className="mt-3 text-xs text-gray-400 text-center">
        Clavier : chiffres, +, -, *, /, Entrée (=), Échap (C)
      </div>
    </div>
  );
};
