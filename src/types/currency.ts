export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';
export type FeeUnit = 'from' | 'to' | 'percent';

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  type: string;
}

export interface UsdRateEntry {
  rate: number;
  date: string;
}

export interface CachedRatesSnapshot {
  base: 'USD';
  fetchedAt: string;
  latestDate: string;
  rates: Record<string, UsdRateEntry>;
}

export interface HistoryPoint {
  date: string;
  rate: number;
}

export interface CachedHistoryEntry {
  pairKey: string;
  from: string;
  to: string;
  fetchedAt: string;
  points: HistoryPoint[];
}

export interface FavoritePair {
  id: string;
  from: string;
  to: string;
  addedAt: string;
}

export interface ConversionResult {
  rate: number;
  inverseRate: number;
  convertedAmount: number;
  rateDate: string;
}
