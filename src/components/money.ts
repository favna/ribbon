/* tslint:disable:object-literal-sort-keys */

import { currencySymbolMap } from '.';

export const currencymap = (code: string) => {
    code = code.toUpperCase();
    if (!(code in currencySymbolMap)) return null;

    return currencySymbolMap[code];
};

export const convert = (rates: any, fromCurrency: string, toCurrency: string, value: number) => value * (rates[toCurrency] * (1 / rates[fromCurrency]));
