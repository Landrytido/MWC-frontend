import { useState, useCallback, useEffect } from "react";
import { CalculatorState } from "../types/calculator";
import { CalculatorService } from "../services/calculatorService";

const initialState: CalculatorState = {
  display: "0",
  previousValue: null,
  operation: null,
  waitingForNewValue: false,
  hasError: false,
  currentExpression: "0", // Nouvelle propriété
};

export const useCalculator = () => {
  const [state, setState] = useState<CalculatorState>(initialState);

  // Réinitialiser la calculatrice
  const clear = useCallback(() => {
    setState(initialState);
  }, []);

  // Effacer la dernière entrée
  const clearEntry = useCallback(() => {
    setState((prev) => {
      const newState = {
        ...prev,
        display: "0",
        waitingForNewValue: false,
        hasError: false,
      };
      return {
        ...newState,
        currentExpression: CalculatorService.buildDisplayExpression(
          newState.previousValue,
          newState.operation,
          newState.display,
          newState.waitingForNewValue
        ),
      };
    });
  }, []);

  // Ajouter un chiffre
  const inputNumber = useCallback((num: string) => {
    setState((prev) => {
      if (prev.hasError) {
        const newState = { ...initialState, display: num };
        return {
          ...newState,
          currentExpression: CalculatorService.buildDisplayExpression(
            newState.previousValue,
            newState.operation,
            newState.display,
            newState.waitingForNewValue
          ),
        };
      }

      if (prev.waitingForNewValue) {
        const newState = {
          ...prev,
          display: num,
          waitingForNewValue: false,
        };
        return {
          ...newState,
          currentExpression: CalculatorService.buildDisplayExpression(
            newState.previousValue,
            newState.operation,
            newState.display,
            newState.waitingForNewValue
          ),
        };
      }

      const newDisplay = prev.display === "0" ? num : prev.display + num;

      // Limiter la longueur de l'affichage
      if (newDisplay.length > 12) {
        return prev;
      }

      const newState = {
        ...prev,
        display: newDisplay,
      };

      return {
        ...newState,
        currentExpression: CalculatorService.buildDisplayExpression(
          newState.previousValue,
          newState.operation,
          newState.display,
          newState.waitingForNewValue
        ),
      };
    });
  }, []);

  // Ajouter le point décimal
  const inputDecimal = useCallback(() => {
    setState((prev) => {
      if (prev.hasError) {
        const newState = { ...initialState, display: "0." };
        return {
          ...newState,
          currentExpression: CalculatorService.buildDisplayExpression(
            newState.previousValue,
            newState.operation,
            newState.display,
            newState.waitingForNewValue
          ),
        };
      }

      if (prev.waitingForNewValue) {
        const newState = {
          ...prev,
          display: "0.",
          waitingForNewValue: false,
        };
        return {
          ...newState,
          currentExpression: CalculatorService.buildDisplayExpression(
            newState.previousValue,
            newState.operation,
            newState.display,
            newState.waitingForNewValue
          ),
        };
      }

      if (prev.display.includes(".")) {
        return prev;
      }

      const newState = {
        ...prev,
        display: prev.display + ".",
      };

      return {
        ...newState,
        currentExpression: CalculatorService.buildDisplayExpression(
          newState.previousValue,
          newState.operation,
          newState.display,
          newState.waitingForNewValue
        ),
      };
    });
  }, []);

  // Effectuer une opération
  const performOperation = useCallback((nextOperation: string) => {
    setState((prev) => {
      if (prev.hasError) {
        return prev;
      }

      const inputValue = parseFloat(prev.display);

      if (prev.previousValue === null) {
        const newState = {
          ...prev,
          previousValue: inputValue,
          operation: nextOperation,
          waitingForNewValue: true,
        };
        return {
          ...newState,
          currentExpression: CalculatorService.buildDisplayExpression(
            newState.previousValue,
            newState.operation,
            newState.display,
            newState.waitingForNewValue
          ),
        };
      }

      if (prev.operation && prev.waitingForNewValue) {
        const newState = {
          ...prev,
          operation: nextOperation,
        };
        return {
          ...newState,
          currentExpression: CalculatorService.buildDisplayExpression(
            newState.previousValue,
            newState.operation,
            newState.display,
            newState.waitingForNewValue
          ),
        };
      }

      try {
        const result = CalculatorService.calculate(
          prev.previousValue,
          inputValue,
          prev.operation!
        );

        const formattedResult = CalculatorService.formatDisplay(result);

        // Sauvegarder dans l'historique
        const expression = CalculatorService.buildExpression(
          prev.previousValue,
          prev.operation,
          prev.display
        );
        CalculatorService.saveToHistory(expression, formattedResult);

        const newState = {
          ...prev,
          display: formattedResult,
          previousValue: result,
          operation: nextOperation,
          waitingForNewValue: true,
          hasError: false,
        };

        return {
          ...newState,
          currentExpression: CalculatorService.buildDisplayExpression(
            newState.previousValue,
            newState.operation,
            newState.display,
            newState.waitingForNewValue
          ),
        };
      } catch {
        return {
          ...prev,
          display: "Erreur",
          hasError: true,
          currentExpression: "Erreur",
        };
      }
    });
  }, []);

  // Calculer le résultat final
  const calculate = useCallback(() => {
    setState((prev) => {
      if (prev.hasError || prev.previousValue === null || !prev.operation) {
        return prev;
      }

      const inputValue = parseFloat(prev.display);

      try {
        const result = CalculatorService.calculate(
          prev.previousValue,
          inputValue,
          prev.operation
        );

        const formattedResult = CalculatorService.formatDisplay(result);

        // Sauvegarder dans l'historique
        const expression = CalculatorService.buildExpression(
          prev.previousValue,
          prev.operation,
          prev.display
        );
        CalculatorService.saveToHistory(expression, formattedResult);

        const newState = {
          ...prev,
          display: formattedResult,
          previousValue: null,
          operation: null,
          waitingForNewValue: true,
          hasError: false,
        };

        return {
          ...newState,
          currentExpression: formattedResult, // Afficher le résultat comme expression
        };
      } catch {
        return {
          ...prev,
          display: "Erreur",
          hasError: true,
          currentExpression: "Erreur",
        };
      }
    });
  }, []);

  // Opérations unaires
  const performUnaryOperation = useCallback((operation: string) => {
    setState((prev) => {
      if (prev.hasError) {
        return prev;
      }

      const currentValue = parseFloat(prev.display);

      try {
        const result = CalculatorService.unaryOperation(
          currentValue,
          operation
        );
        const formattedResult = CalculatorService.formatDisplay(result);

        // Sauvegarder dans l'historique pour certaines opérations
        if (["square", "squareRoot"].includes(operation)) {
          const expression =
            operation === "square" ? `${prev.display}²` : `√${prev.display}`;
          CalculatorService.saveToHistory(expression, formattedResult);
        }

        const newState = {
          ...prev,
          display: formattedResult,
          waitingForNewValue: true,
          hasError: false,
        };

        return {
          ...newState,
          currentExpression: formattedResult, // Pour les opérations unaires, afficher juste le résultat
        };
      } catch {
        return {
          ...prev,
          display: "Erreur",
          hasError: true,
          currentExpression: "Erreur",
        };
      }
    });
  }, []);

  // Fonction backspace pour les boutons de l'interface
  const handleBackspace = useCallback(() => {
    setState((prev) => {
      if (prev.hasError || prev.waitingForNewValue) {
        const newState = {
          ...prev,
          display: "0",
          hasError: false,
          waitingForNewValue: false,
        };
        return {
          ...newState,
          currentExpression: CalculatorService.buildDisplayExpression(
            newState.previousValue,
            newState.operation,
            newState.display,
            newState.waitingForNewValue
          ),
        };
      }

      const newDisplay =
        prev.display.length > 1 ? prev.display.slice(0, -1) : "0";

      const newState = { ...prev, display: newDisplay };
      return {
        ...newState,
        currentExpression: CalculatorService.buildDisplayExpression(
          newState.previousValue,
          newState.operation,
          newState.display,
          newState.waitingForNewValue
        ),
      };
    });
  }, []);

  // Support du clavier
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const { key } = event;

      if ("0123456789".includes(key)) {
        inputNumber(key);
      } else if (key === ".") {
        inputDecimal();
      } else if (key === "+") {
        performOperation("add");
      } else if (key === "-") {
        performOperation("subtract");
      } else if (key === "*") {
        performOperation("multiply");
      } else if (key === "/") {
        event.preventDefault();
        performOperation("divide");
      } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
      } else if (key === "Escape") {
        clear();
      } else if (key === "Backspace") {
        setState((prev) => {
          if (prev.hasError || prev.waitingForNewValue) {
            const newState = {
              ...prev,
              display: "0",
              hasError: false,
              waitingForNewValue: false,
            };
            return {
              ...newState,
              currentExpression: CalculatorService.buildDisplayExpression(
                newState.previousValue,
                newState.operation,
                newState.display,
                newState.waitingForNewValue
              ),
            };
          }

          const newDisplay =
            prev.display.length > 1 ? prev.display.slice(0, -1) : "0";

          const newState = { ...prev, display: newDisplay };
          return {
            ...newState,
            currentExpression: CalculatorService.buildDisplayExpression(
              newState.previousValue,
              newState.operation,
              newState.display,
              newState.waitingForNewValue
            ),
          };
        });
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    inputNumber,
    inputDecimal,
    performOperation,
    calculate,
    clear,
    handleBackspace,
  ]);

  return {
    display: state.display,
    currentExpression: state.currentExpression,
    hasError: state.hasError,
    inputNumber,
    inputDecimal,
    performOperation,
    performUnaryOperation,
    calculate,
    clear,
    clearEntry,
    handleBackspace,
  };
};
