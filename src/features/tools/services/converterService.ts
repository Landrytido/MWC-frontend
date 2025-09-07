import {
  Unit,
  UnitCategory,
  UnitCategory_Info,
  ConversionResult,
} from "../types/converter";

export class ConverterService {
  private static readonly STORAGE_KEY = "converter-history";

  static getCategories(): UnitCategory_Info[] {
    return [
      {
        id: "length",
        name: "Longueur",
        icon: "📏",
        baseUnit: "mètre",
        description: "Distance, hauteur, largeur",
      },
      {
        id: "weight",
        name: "Poids",
        icon: "⚖️",
        baseUnit: "kilogramme",
        description: "Masse, poids",
      },
      {
        id: "volume",
        name: "Volume",
        icon: "🥤",
        baseUnit: "litre",
        description: "Capacité, volume",
      },
      {
        id: "temperature",
        name: "Température",
        icon: "🌡️",
        baseUnit: "Celsius",
        description: "Chaleur, froid",
      },
      {
        id: "area",
        name: "Surface",
        icon: "📐",
        baseUnit: "mètre carré",
        description: "Aire, superficie",
      },
      {
        id: "speed",
        name: "Vitesse",
        icon: "🏃",
        baseUnit: "mètre/seconde",
        description: "Rapidité, vélocité",
      },
      {
        id: "time",
        name: "Temps",
        icon: "⏰",
        baseUnit: "seconde",
        description: "Durée, période",
      },
    ];
  }

  static getUnits(): Record<UnitCategory, Unit[]> {
    return {
      length: [
        {
          id: "mm",
          name: "Millimètre",
          symbol: "mm",
          toBase: 0.001,
          category: "length",
        },
        {
          id: "cm",
          name: "Centimètre",
          symbol: "cm",
          toBase: 0.01,
          category: "length",
        },
        { id: "m", name: "Mètre", symbol: "m", toBase: 1, category: "length" },
        {
          id: "km",
          name: "Kilomètre",
          symbol: "km",
          toBase: 1000,
          category: "length",
        },
        {
          id: "in",
          name: "Pouce",
          symbol: "in",
          toBase: 0.0254,
          category: "length",
        },
        {
          id: "ft",
          name: "Pied",
          symbol: "ft",
          toBase: 0.3048,
          category: "length",
        },
        {
          id: "yd",
          name: "Yard",
          symbol: "yd",
          toBase: 0.9144,
          category: "length",
        },
        {
          id: "mi",
          name: "Mile",
          symbol: "mi",
          toBase: 1609.344,
          category: "length",
        },
        {
          id: "nmi",
          name: "Mile nautique",
          symbol: "nmi",
          toBase: 1852,
          category: "length",
        },
      ],

      weight: [
        {
          id: "mg",
          name: "Milligramme",
          symbol: "mg",
          toBase: 0.000001,
          category: "weight",
        },
        {
          id: "g",
          name: "Gramme",
          symbol: "g",
          toBase: 0.001,
          category: "weight",
        },
        {
          id: "kg",
          name: "Kilogramme",
          symbol: "kg",
          toBase: 1,
          category: "weight",
        },
        {
          id: "t",
          name: "Tonne",
          symbol: "t",
          toBase: 1000,
          category: "weight",
        },
        {
          id: "oz",
          name: "Once",
          symbol: "oz",
          toBase: 0.0283495,
          category: "weight",
        },
        {
          id: "lb",
          name: "Livre",
          symbol: "lb",
          toBase: 0.453592,
          category: "weight",
        },
        {
          id: "st",
          name: "Stone",
          symbol: "st",
          toBase: 6.35029,
          category: "weight",
        },
      ],

      volume: [
        {
          id: "ml",
          name: "Millilitre",
          symbol: "ml",
          toBase: 0.001,
          category: "volume",
        },
        {
          id: "cl",
          name: "Centilitre",
          symbol: "cl",
          toBase: 0.01,
          category: "volume",
        },
        {
          id: "dl",
          name: "Décilitre",
          symbol: "dl",
          toBase: 0.1,
          category: "volume",
        },
        { id: "l", name: "Litre", symbol: "l", toBase: 1, category: "volume" },
        {
          id: "m3",
          name: "Mètre cube",
          symbol: "m³",
          toBase: 1000,
          category: "volume",
        },
        {
          id: "tsp",
          name: "Cuillère à café",
          symbol: "tsp",
          toBase: 0.00492892,
          category: "volume",
        },
        {
          id: "tbsp",
          name: "Cuillère à soupe",
          symbol: "tbsp",
          toBase: 0.0147868,
          category: "volume",
        },
        {
          id: "fl_oz",
          name: "Once liquide",
          symbol: "fl oz",
          toBase: 0.0295735,
          category: "volume",
        },
        {
          id: "cup",
          name: "Tasse",
          symbol: "cup",
          toBase: 0.236588,
          category: "volume",
        },
        {
          id: "pt",
          name: "Pinte",
          symbol: "pt",
          toBase: 0.473176,
          category: "volume",
        },
        {
          id: "qt",
          name: "Quart",
          symbol: "qt",
          toBase: 0.946353,
          category: "volume",
        },
        {
          id: "gal",
          name: "Gallon",
          symbol: "gal",
          toBase: 3.78541,
          category: "volume",
        },
      ],

      temperature: [
        {
          id: "c",
          name: "Celsius",
          symbol: "°C",
          toBase: 1,
          category: "temperature",
          fromBase: (value: number) => value,
        },
        {
          id: "f",
          name: "Fahrenheit",
          symbol: "°F",
          toBase: 1,
          category: "temperature",
          fromBase: (celsius: number) => (celsius * 9) / 5 + 32,
        },
        {
          id: "k",
          name: "Kelvin",
          symbol: "K",
          toBase: 1,
          category: "temperature",
          fromBase: (celsius: number) => celsius + 273.15,
        },
      ],

      area: [
        {
          id: "mm2",
          name: "Millimètre carré",
          symbol: "mm²",
          toBase: 0.000001,
          category: "area",
        },
        {
          id: "cm2",
          name: "Centimètre carré",
          symbol: "cm²",
          toBase: 0.0001,
          category: "area",
        },
        {
          id: "m2",
          name: "Mètre carré",
          symbol: "m²",
          toBase: 1,
          category: "area",
        },
        {
          id: "ha",
          name: "Hectare",
          symbol: "ha",
          toBase: 10000,
          category: "area",
        },
        {
          id: "km2",
          name: "Kilomètre carré",
          symbol: "km²",
          toBase: 1000000,
          category: "area",
        },
        {
          id: "in2",
          name: "Pouce carré",
          symbol: "in²",
          toBase: 0.00064516,
          category: "area",
        },
        {
          id: "ft2",
          name: "Pied carré",
          symbol: "ft²",
          toBase: 0.092903,
          category: "area",
        },
        {
          id: "ac",
          name: "Acre",
          symbol: "ac",
          toBase: 4046.86,
          category: "area",
        },
      ],

      speed: [
        {
          id: "ms",
          name: "Mètre/seconde",
          symbol: "m/s",
          toBase: 1,
          category: "speed",
        },
        {
          id: "kmh",
          name: "Kilomètre/heure",
          symbol: "km/h",
          toBase: 0.277778,
          category: "speed",
        },
        {
          id: "mph",
          name: "Mile/heure",
          symbol: "mph",
          toBase: 0.44704,
          category: "speed",
        },
        {
          id: "kn",
          name: "Nœud",
          symbol: "kn",
          toBase: 0.514444,
          category: "speed",
        },
        {
          id: "fps",
          name: "Pied/seconde",
          symbol: "ft/s",
          toBase: 0.3048,
          category: "speed",
        },
      ],

      time: [
        {
          id: "ms_time",
          name: "Milliseconde",
          symbol: "ms",
          toBase: 0.001,
          category: "time",
        },
        { id: "s", name: "Seconde", symbol: "s", toBase: 1, category: "time" },
        {
          id: "min",
          name: "Minute",
          symbol: "min",
          toBase: 60,
          category: "time",
        },
        { id: "h", name: "Heure", symbol: "h", toBase: 3600, category: "time" },
        { id: "d", name: "Jour", symbol: "j", toBase: 86400, category: "time" },
        {
          id: "w",
          name: "Semaine",
          symbol: "sem",
          toBase: 604800,
          category: "time",
        },
        {
          id: "month",
          name: "Mois",
          symbol: "mois",
          toBase: 2629746,
          category: "time",
        },
        {
          id: "y",
          name: "Année",
          symbol: "an",
          toBase: 31556952,
          category: "time",
        },
      ],
    };
  }

  static convert(value: number, fromUnit: Unit, toUnit: Unit): number {
    if (fromUnit.category !== toUnit.category) {
      throw new Error("Les unités doivent être de la même catégorie");
    }

    if (fromUnit.category === "temperature") {
      return this.convertTemperature(value, fromUnit, toUnit);
    }

    const baseValue = value * fromUnit.toBase;
    return baseValue / toUnit.toBase;
  }

  private static convertTemperature(
    value: number,
    fromUnit: Unit,
    toUnit: Unit
  ): number {
    let celsius: number;

    switch (fromUnit.id) {
      case "c":
        celsius = value;
        break;
      case "f":
        celsius = ((value - 32) * 5) / 9;
        break;
      case "k":
        celsius = value - 273.15;
        break;
      default:
        throw new Error(`Unité de température inconnue: ${fromUnit.id}`);
    }

    if (toUnit.fromBase) {
      return toUnit.fromBase(celsius);
    }
    return celsius;
  }

  static formatResult(value: number, precision: number = 6): string {
    if (
      Math.abs(value) >= 1000000 ||
      (Math.abs(value) < 0.001 && value !== 0)
    ) {
      return value.toExponential(precision);
    }

    const rounded =
      Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
    return rounded.toString();
  }

  static saveToHistory(result: ConversionResult): void {
    const history = this.getHistory();
    history.unshift(result);

    if (history.length > 20) {
      history.splice(20);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
  }

  static getHistory(): ConversionResult[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static clearHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static getUnitsByCategory(category: UnitCategory): Unit[] {
    return this.getUnits()[category] || [];
  }

  static findUnit(unitId: string, category: UnitCategory): Unit | null {
    const units = this.getUnitsByCategory(category);
    return units.find((unit) => unit.id === unitId) || null;
  }

  static getDefaultUnits(category: UnitCategory): { from: Unit; to: Unit } {
    const units = this.getUnitsByCategory(category);
    if (units.length < 2) {
      throw new Error(`Pas assez d'unités pour la catégorie ${category}`);
    }

    const baseUnit = units.find((unit) => unit.toBase === 1) || units[0];
    const secondUnit =
      units.find((unit) => unit.id !== baseUnit.id) || units[1];

    return { from: baseUnit, to: secondUnit };
  }
}
