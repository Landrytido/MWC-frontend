// Types pour la calculatrice
export interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForNewValue: boolean;
  hasError: boolean;
  currentExpression: string; // Nouvelle propriété pour l'expression courante
}

export interface CalculationHistory {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

export type CalculatorOperation =
  | "add"
  | "subtract"
  | "multiply"
  | "divide"
  | "equals"
  | "percentage"
  | "square"
  | "squareRoot"
  | "toggleSign"
  | "clear"
  | "clearEntry";
