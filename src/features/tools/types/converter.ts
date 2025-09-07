export type UnitCategory =
  | "length"
  | "weight"
  | "volume"
  | "temperature"
  | "area"
  | "speed"
  | "time";

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  toBase: number; // Facteur de conversion vers l'unité de base
  fromBase?: (value: number) => number; // Fonction personnalisée si nécessaire (pour températures)
  category: UnitCategory;
}

export interface UnitCategory_Info {
  id: UnitCategory;
  name: string;
  icon: string;
  baseUnit: string;
  description: string;
}

export interface ConversionResult {
  id: string;
  timestamp: Date;
  fromValue: number;
  fromUnit: Unit;
  toValue: number;
  toUnit: Unit;
  formattedResult: string;
  category: UnitCategory;
}

export interface ConverterState {
  currentCategory: UnitCategory;
  fromUnit: Unit;
  toUnit: Unit;
  inputValue: string;
  result: ConversionResult | null;
  precision: number;
  isLoading: boolean;
  error: string | null;
}
