import { currencySymbolMap } from './Constants';

export const currencyMap = (code: string): string | null => {
  code = code.toUpperCase();
  if (!(code in currencySymbolMap)) return null;

  return currencySymbolMap[code];
};

export const convertCurrency = (
  rates: any, fromCurrency: string, toCurrency: string, value: number
): number => value * (rates[toCurrency] * (1 / rates[fromCurrency]));
