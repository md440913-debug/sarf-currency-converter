import {
  CachedHistoryEntry,
  CachedRatesSnapshot,
  CurrencyInfo,
  HistoryPoint,
  UsdRateEntry,
} from '../types/currency';

const FRANKFURTER_BASE = 'https://api.frankfurter.dev/v2';

const STORAGE_KEYS = {
  RATES: 'sarf_rates_cache_v1',
  CURRENCIES: 'sarf_currencies_cache_v1',
  HISTORY: 'sarf_history_cache_v1',
} as const;

interface RawCurrencyResponse {
  iso_code: string;
  name: string;
  symbol?: string | null;
  type: string;
}

interface RawRateResponse {
  date: string;
  base: string;
  quote: string;
  rate: number;
}

async function fetchJsonWithTimeout<T>(url: string, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timer);
  }
}

export function loadCachedCurrencies(): CurrencyInfo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENCIES);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CurrencyInfo[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCachedCurrencies(currencies: CurrencyInfo[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENCIES, JSON.stringify(currencies));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadCachedRates(): CachedRatesSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RATES);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRatesSnapshot;
    if (!parsed || !parsed.rates || typeof parsed.rates !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveCachedRates(snapshot: CachedRatesSnapshot): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(snapshot));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadCachedHistory(from: string, to: string): CachedHistoryEntry | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, CachedHistoryEntry>;
    const key = `${from}->${to}`;
    return map[key] ?? null;
  } catch {
    return null;
  }
}

function saveCachedHistory(entry: CachedHistoryEntry): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    const map: Record<string, CachedHistoryEntry> = raw ? JSON.parse(raw) : {};
    map[entry.pairKey] = entry;

    // Keep at most 20 most recent pairs in localStorage
    const keys = Object.keys(map);
    if (keys.length > 20) {
      const sorted = keys.sort(
        (a, b) =>
          new Date(map[b].fetchedAt).getTime() - new Date(map[a].fetchedAt).getTime()
      );
      const trimmed: Record<string, CachedHistoryEntry> = {};
      for (const k of sorted.slice(0, 20)) {
        trimmed[k] = map[k];
      }
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
      return;
    }

    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(map));
  } catch {
    // Ignore storage quota errors
  }
}

export async function fetchWorldCurrencies(): Promise<CurrencyInfo[]> {
  const raw = await fetchJsonWithTimeout<RawCurrencyResponse[]>(`${FRANKFURTER_BASE}/currencies`);
  const list: CurrencyInfo[] = raw
    .filter((item) => item.type === 'currency' && item.iso_code)
    .map((item) => ({
      code: item.iso_code.toUpperCase(),
      name: item.name,
      symbol: item.symbol || item.iso_code.toUpperCase(),
      type: item.type,
    }))
    .sort((a, b) => a.code.localeCompare(b.code));

  if (list.length > 0) {
    saveCachedCurrencies(list);
  }
  return list;
}

export async function fetchLatestUsdRates(): Promise<CachedRatesSnapshot> {
  const raw = await fetchJsonWithTimeout<RawRateResponse[]>(
    `${FRANKFURTER_BASE}/rates?base=USD`
  );

  const rates: Record<string, UsdRateEntry> = {};
  let latestDate = '';

  for (const row of raw) {
    if (!row.quote || typeof row.rate !== 'number' || !Number.isFinite(row.rate)) {
      continue;
    }
    const code = row.quote.toUpperCase();
    rates[code] = {
      rate: row.rate,
      date: row.date,
    };
    if (row.date > latestDate) {
      latestDate = row.date;
    }
  }

  if (!latestDate) {
    latestDate = new Date().toISOString().slice(0, 10);
  }

  // Ensure USD base entry is always present as 1
  rates['USD'] = {
    rate: 1,
    date: latestDate,
  };

  const snapshot: CachedRatesSnapshot = {
    base: 'USD',
    fetchedAt: new Date().toISOString(),
    latestDate,
    rates,
  };

  saveCachedRates(snapshot);
  return snapshot;
}

function subtractDaysIso(isoDate: string, days: number): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    const fallback = new Date();
    fallback.setUTCDate(fallback.getUTCDate() - days);
    return fallback.toISOString().slice(0, 10);
  }
  parsed.setUTCDate(parsed.getUTCDate() - days);
  return parsed.toISOString().slice(0, 10);
}

export async function fetchPairHistory30d(
  from: string,
  to: string,
  referenceEndDate?: string
): Promise<HistoryPoint[]> {
  if (from === to) {
    return [];
  }

  const endDate = referenceEndDate || new Date().toISOString().slice(0, 10);
  const startDate = subtractDaysIso(endDate, 30);

  const url = `${FRANKFURTER_BASE}/rates?base=${encodeURIComponent(
    from
  )}&quotes=${encodeURIComponent(to)}&from=${encodeURIComponent(
    startDate
  )}&to=${encodeURIComponent(endDate)}`;

  const raw = await fetchJsonWithTimeout<RawRateResponse[]>(url);

  const points: HistoryPoint[] = raw
    .filter((row) => row.date && typeof row.rate === 'number' && Number.isFinite(row.rate))
    .map((row) => ({
      date: row.date,
      rate: row.rate,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (points.length > 0) {
    saveCachedHistory({
      pairKey: `${from}->${to}`,
      from,
      to,
      fetchedAt: new Date().toISOString(),
      points,
    });
  }

  return points;
}

export function computePairConversion(
  snapshot: CachedRatesSnapshot | null,
  from: string,
  to: string,
  amount: number
): { rate: number; inverseRate: number; convertedAmount: number; rateDate: string } | null {
  if (!snapshot) return null;
  if (from === to) {
    return {
      rate: 1,
      inverseRate: 1,
      convertedAmount: Number.isFinite(amount) ? amount : 0,
      rateDate: snapshot.latestDate,
    };
  }

  const fromEntry = snapshot.rates[from];
  const toEntry = snapshot.rates[to];
  if (!fromEntry || !toEntry || fromEntry.rate <= 0 || toEntry.rate <= 0) {
    return null;
  }

  const rate = toEntry.rate / fromEntry.rate;
  const inverseRate = fromEntry.rate / toEntry.rate;
  const convertedAmount = Number.isFinite(amount) ? amount * rate : 0;

  let rateDate = snapshot.latestDate;
  if (from === 'USD') {
    rateDate = toEntry.date;
  } else if (to === 'USD') {
    rateDate = fromEntry.date;
  } else {
    rateDate = fromEntry.date < toEntry.date ? fromEntry.date : toEntry.date;
  }

  return {
    rate,
    inverseRate,
    convertedAmount,
    rateDate,
  };
}
