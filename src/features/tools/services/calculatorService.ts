import { CalculationHistory } from "../types/calculator";

export class CalculatorService {
  // Effectuer un calcul
  static calculate(first: number, second: number, operation: string): number {
    switch (operation) {
      case "add":
        return first + second;
      case "subtract":
        return first - second;
      case "multiply":
        return first * second;
      case "divide":
        if (second === 0) {
          throw new Error("Division par zéro impossible");
        }
        return first / second;
      case "percentage":
        return first * (second / 100);
      default:
        throw new Error(`Opération inconnue: ${operation}`);
    }
  }

  // Opérations unaires
  static unaryOperation(value: number, operation: string): number {
    switch (operation) {
      case "square":
        return value * value;
      case "squareRoot":
        if (value < 0) {
          throw new Error("Racine carrée d'un nombre négatif");
        }
        return Math.sqrt(value);
      case "toggleSign":
        return -value;
      case "reciprocal":
        if (value === 0) {
          throw new Error("Division par zéro");
        }
        return 1 / value;
      case "percent":
      case "percentage":
        return value / 100;
      default:
        throw new Error(`Opération unaire inconnue: ${operation}`);
    }
  }

  // Formater le nombre pour l'affichage
  static formatDisplay(value: number): string {
    if (isNaN(value) || !isFinite(value)) {
      return "Erreur";
    }

    // Gérer les très grands et très petits nombres
    if (Math.abs(value) >= 1e15 || (Math.abs(value) < 1e-6 && value !== 0)) {
      return value.toExponential(6);
    }

    // Limiter à 12 chiffres significatifs
    const str = value.toString();
    if (str.length > 12) {
      if (str.includes(".")) {
        const decimalPlaces = 12 - str.split(".")[0].length - 1;
        return value.toFixed(Math.max(0, decimalPlaces));
      }
      return value.toExponential(6);
    }

    return str;
  }

  // Construire l'expression d'affichage en temps réel
  static buildDisplayExpression(
    previousValue: number | null,
    operation: string | null,
    currentDisplay: string,
    waitingForNewValue: boolean
  ): string {
    if (!previousValue || !operation) {
      return currentDisplay;
    }

    const operatorSymbol = this.getOperatorSymbol(operation);

    if (waitingForNewValue) {
      return `${this.formatDisplay(previousValue)} ${operatorSymbol}`;
    } else {
      return `${this.formatDisplay(
        previousValue
      )} ${operatorSymbol} ${currentDisplay}`;
    }
  }

  // Convertir l'opération en symbole d'affichage
  static getOperatorSymbol(operation: string): string {
    switch (operation) {
      case "add":
        return "+";
      case "subtract":
        return "−";
      case "multiply":
        return "×";
      case "divide":
        return "÷";
      default:
        return operation;
    }
  }

  // Gérer l'historique dans localStorage
  static saveToHistory(expression: string, result: string): void {
    const history = this.getHistory();
    const newEntry: CalculationHistory = {
      id: Date.now().toString(),
      expression,
      result,
      timestamp: new Date(),
    };

    const updatedHistory = [newEntry, ...history.slice(0, 19)]; // Garder 20 entrées max
    localStorage.setItem("calculator-history", JSON.stringify(updatedHistory));
  }

  static getHistory(): CalculationHistory[] {
    const stored = localStorage.getItem("calculator-history");
    if (!stored) return [];

    try {
      return JSON.parse(stored).map(
        (item: CalculationHistory & { timestamp: string }) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })
      );
    } catch {
      return [];
    }
  }

  static clearHistory(): void {
    localStorage.removeItem("calculator-history");
  }

  // Validation des entrées
  static isValidNumber(input: string): boolean {
    return !isNaN(parseFloat(input)) && isFinite(parseFloat(input));
  }

  // Construire l'expression pour l'historique
  static buildExpression(
    previousValue: number | null,
    operation: string | null,
    currentValue: string
  ): string {
    if (!previousValue || !operation) {
      return currentValue;
    }

    const operatorSymbols: { [key: string]: string } = {
      add: "+",
      subtract: "−",
      multiply: "×",
      divide: "÷",
      percentage: "%",
    };

    return `${this.formatDisplay(previousValue)} ${
      operatorSymbols[operation] || operation
    } ${currentValue}`;
  }
}
