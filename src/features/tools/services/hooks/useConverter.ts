import { useState, useCallback, useEffect } from "react";
import { ConverterService } from "../converterService";
import {
  ConverterState,
  UnitCategory,
  Unit,
  ConversionResult,
  UnitCategory_Info,
} from "../../types/converter";

export function useConverter() {
  const [state, setState] = useState<ConverterState>(() => {
    const defaultCategory: UnitCategory = "length";
    const defaultUnits = ConverterService.getDefaultUnits(defaultCategory);

    return {
      currentCategory: defaultCategory,
      fromUnit: defaultUnits.from,
      toUnit: defaultUnits.to,
      inputValue: "",
      result: null,
      precision: 6,
      isLoading: false,
      error: null,
    };
  });

  const [history, setHistory] = useState<ConversionResult[]>([]);
  const [categories] = useState<UnitCategory_Info[]>(
    ConverterService.getCategories()
  );

  useEffect(() => {
    setHistory(ConverterService.getHistory());
  }, []);

  useEffect(() => {
    if (state.inputValue && !isNaN(Number(state.inputValue))) {
      performConversion();
    } else {
      setState((prev) => ({ ...prev, result: null, error: null }));
    }
  }, [state.inputValue, state.fromUnit, state.toUnit, state.precision]);

  const performConversion = useCallback(() => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const numericValue = Number(state.inputValue);
      if (isNaN(numericValue)) {
        throw new Error("Valeur invalide");
      }

      const convertedValue = ConverterService.convert(
        numericValue,
        state.fromUnit,
        state.toUnit
      );

      const formattedResult = ConverterService.formatResult(
        convertedValue,
        state.precision
      );

      const result: ConversionResult = {
        id: Date.now().toString(),
        timestamp: new Date(),
        fromValue: numericValue,
        fromUnit: state.fromUnit,
        toValue: convertedValue,
        toUnit: state.toUnit,
        formattedResult,
        category: state.currentCategory,
      };

      setState((prev) => ({
        ...prev,
        result,
        isLoading: false,
        error: null,
      }));

      // Sauvegarder dans l'historique
      ConverterService.saveToHistory(result);
      setHistory(ConverterService.getHistory());
    } catch (error) {
      setState((prev) => ({
        ...prev,
        result: null,
        isLoading: false,
        error: error instanceof Error ? error.message : "Erreur de conversion",
      }));
    }
  }, [
    state.inputValue,
    state.fromUnit,
    state.toUnit,
    state.precision,
    state.currentCategory,
  ]);

  const changeCategory = useCallback((category: UnitCategory) => {
    const defaultUnits = ConverterService.getDefaultUnits(category);
    setState((prev) => ({
      ...prev,
      currentCategory: category,
      fromUnit: defaultUnits.from,
      toUnit: defaultUnits.to,
      inputValue: "",
      result: null,
      error: null,
    }));
  }, []);

  const setFromUnit = useCallback((unit: Unit) => {
    setState((prev) => ({ ...prev, fromUnit: unit }));
  }, []);

  const setToUnit = useCallback((unit: Unit) => {
    setState((prev) => ({ ...prev, toUnit: unit }));
  }, []);

  const setInputValue = useCallback((value: string) => {
    setState((prev) => ({ ...prev, inputValue: value }));
  }, []);

  const setPrecision = useCallback((precision: number) => {
    const clampedPrecision = Math.max(0, Math.min(15, precision));
    setState((prev) => ({ ...prev, precision: clampedPrecision }));
  }, []);

  const swapUnits = useCallback(() => {
    setState((prev) => {
      const newState = {
        ...prev,
        fromUnit: prev.toUnit,
        toUnit: prev.fromUnit,
      };

      // Si on a un résultat, utiliser la valeur convertie comme nouvelle entrée
      if (prev.result) {
        newState.inputValue = prev.result.formattedResult;
      }

      return newState;
    });
  }, []);

  const clearInput = useCallback(() => {
    setState((prev) => ({
      ...prev,
      inputValue: "",
      result: null,
      error: null,
    }));
  }, []);

  const clearHistory = useCallback(() => {
    ConverterService.clearHistory();
    setHistory([]);
  }, []);

  const useHistoryItem = useCallback((item: ConversionResult) => {
    setState((prev) => ({
      ...prev,
      currentCategory: item.category,
      fromUnit: item.fromUnit,
      toUnit: item.toUnit,
      inputValue: item.fromValue.toString(),
    }));
  }, []);

  const getCurrentUnits = useCallback(() => {
    return ConverterService.getUnitsByCategory(state.currentCategory);
  }, [state.currentCategory]);

  const getFormattedInput = useCallback(() => {
    if (!state.inputValue) return "";

    const numValue = Number(state.inputValue);
    if (isNaN(numValue)) return state.inputValue;

    return ConverterService.formatResult(numValue, state.precision);
  }, [state.inputValue, state.precision]);

  return {
    // État
    ...state,
    history,
    categories,

    // Actions
    changeCategory,
    setFromUnit,
    setToUnit,
    setInputValue,
    setPrecision,
    swapUnits,
    clearInput,
    clearHistory,
    useHistoryItem,

    // Utilitaires
    getCurrentUnits,
    getFormattedInput,
    performConversion,
  };
}
