import { currencySymbolMap } from '.';

export const currencyMap = (code: string): string | null => {
    code = code.toUpperCase();
    if (!(code in currencySymbolMap)) return null;

    return currencySymbolMap[code];
};

export const convertCurrency = (rates: any, fromCurrency: string, toCurrency: string, value: number) => value * (rates[toCurrency] * (1 / rates[fromCurrency]));
