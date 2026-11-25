import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Globe, Moon, RefreshCw, Sun } from 'lucide-react';
import {
  CachedRatesSnapshot,
  CurrencyInfo,
  FavoritePair,
  HistoryPoint,
  Language,
  Theme,
} from './types/currency';
import { translations } from './i18n/translations';
import {
  computePairConversion,
  fetchLatestUsdRates,
  fetchPairHistory30d,
  fetchWorldCurrencies,
  loadCachedCurrencies,
  loadCachedHistory,
  loadCachedRates,
} from './services/frankfurter';
import { ConverterCard } from './components/ConverterCard';
import { CurrencyPickerModal } from './components/CurrencyPickerModal';
import { FavoritesCard } from './components/FavoritesCard';
import { OfferCheckCard } from './components/OfferCheckCard';
import { RateChartCard } from './components/RateChartCard';

const PREF_KEYS = {
  LANG: 'sarf_lang_v1',
  THEME: 'sarf_theme_v1',
  FAVORITES: 'sarf_favorites_v1',
  ACTIVE_PAIR: 'sarf_pair_v1',
} as const;

function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(PREF_KEYS.LANG);
    if (saved === 'ar' || saved === 'en') return saved;
  } catch {
    // ignore
  }
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('ar')) {
    return 'ar';
  }
  return 'en';
}

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(PREF_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // ignore
  }
  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }
  return 'light';
}

function getInitialPair(): { from: string; to: string } {
  try {
    const raw = localStorage.getItem(PREF_KEYS.ACTIVE_PAIR);
    if (raw) {
      const parsed = JSON.parse(raw) as { from?: string; to?: string };
      if (parsed.from && parsed.to) {
        return { from: parsed.from, to: parsed.to };
      }
    }
  } catch {
    // ignore
  }
  return { from: 'USD', to: 'EUR' };
}

function getInitialFavorites(): FavoritePair[] {
  try {
    const raw = localStorage.getItem(PREF_KEYS.FAVORITES);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FavoritePair[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [lang, setLang] = useState<Language>(getInitialLanguage);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const initialPair = useMemo(() => getInitialPair(), []);
  const [fromCode, setFromCode] = useState<string>(initialPair.from);
  const [toCode, setToCode] = useState<string>(initialPair.to);
  const [amountInput, setAmountInput] = useState<string>('100');

  const [favorites, setFavorites] = useState<FavoritePair[]>(getInitialFavorites);

  const [currencies, setCurrencies] = useState<CurrencyInfo[]>(() => loadCachedCurrencies());
  const [ratesSnapshot, setRatesSnapshot] = useState<CachedRatesSnapshot | null>(() =>
    loadCachedRates()
  );

  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(() => !loadCachedRates());
  const [isRefreshingRates, setIsRefreshingRates] = useState<boolean>(false);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  const [historyPoints, setHistoryPoints] = useState<HistoryPoint[]>(
    () => loadCachedHistory(initialPair.from, initialPair.to)?.points ?? []
  );
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isHistoryCached, setIsHistoryCached] = useState<boolean>(false);

  const [pickerTarget, setPickerTarget] = useState<'from' | 'to' | null>(null);

  const t = translations[lang];

  // Sync HTML dir, lang, and theme classes
  useEffect(() => {
    const root = document.documentElement;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    root.lang = lang;
    try {
      localStorage.setItem(PREF_KEYS.LANG, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(PREF_KEYS.THEME, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(
        PREF_KEYS.ACTIVE_PAIR,
        JSON.stringify({ from: fromCode, to: toCode })
      );
    } catch {
      // ignore
    }
  }, [fromCode, toCode]);

  useEffect(() => {
    try {
      localStorage.setItem(PREF_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  const loadRatesAndCurrencies = useCallback(async (manual = false) => {
    if (manual) {
      setIsRefreshingRates(true);
    } else if (!loadCachedRates()) {
      setIsLoadingRates(true);
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOffline(true);
      setRatesError('offline');
      setIsLoadingRates(false);
      setIsRefreshingRates(false);
      return;
    }

    try {
      const [fetchedRates, fetchedCurrencies] = await Promise.all([
        fetchLatestUsdRates(),
        fetchWorldCurrencies(),
      ]);
      setRatesSnapshot(fetchedRates);
      if (fetchedCurrencies.length > 0) {
        setCurrencies(fetchedCurrencies);
      }
      setRatesError(null);
      setIsOffline(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      setRatesError(message);
    } finally {
      setIsLoadingRates(false);
      setIsRefreshingRates(false);
    }
  }, []);

  const loadHistory = useCallback(
    async (from: string, to: string, refDate?: string) => {
      if (from === to) {
        setHistoryPoints([]);
        setHistoryError(null);
        setIsHistoryCached(false);
        setIsLoadingHistory(false);
        return;
      }

      const cached = loadCachedHistory(from, to);
      if (cached && cached.points.length > 0) {
        setHistoryPoints(cached.points);
        setIsHistoryCached(true);
      } else {
        setHistoryPoints([]);
        setIsHistoryCached(false);
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setHistoryError('offline');
        setIsLoadingHistory(false);
        return;
      }

      setIsLoadingHistory(true);
      setHistoryError(null);
      try {
        const fresh = await fetchPairHistory30d(from, to, refDate);
        setHistoryPoints(fresh);
        setIsHistoryCached(false);
        setHistoryError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'History fetch failed';
        setHistoryError(message);
      } finally {
        setIsLoadingHistory(false);
      }
    },
    []
  );

  // Initial fetch & browser online/offline listeners
  useEffect(() => {
    loadRatesAndCurrencies(false);

    const handleOnline = () => {
      setIsOffline(false);
      loadRatesAndCurrencies(false);
    };
    const handleOffline = () => {
      setIsOffline(true);
      setRatesError('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadRatesAndCurrencies]);

  // Fetch 30-day history when pair or latest rate date updates
  useEffect(() => {
    loadHistory(fromCode, toCode, ratesSnapshot?.latestDate);
  }, [fromCode, toCode, ratesSnapshot?.latestDate, loadHistory]);

  // Ensure selectable currencies only include currencies with available USD conversion rates
  const selectableCurrencies = useMemo(() => {
    if (!ratesSnapshot) return currencies;
    const rateKeys = Object.keys(ratesSnapshot.rates);

    if (currencies.length === 0) {
      return rateKeys
        .map((code) => ({
          code,
          name: code,
          symbol: code,
          type: 'currency',
        }))
        .sort((a, b) => a.code.localeCompare(b.code));
    }

    return currencies.filter((c) => Boolean(ratesSnapshot.rates[c.code]));
  }, [currencies, ratesSnapshot]);

  const numericAmount = useMemo(() => {
    if (!amountInput.trim()) return 0;
    const parsed = Number.parseFloat(amountInput);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amountInput]);

  const conversion = useMemo(
    () => computePairConversion(ratesSnapshot, fromCode, toCode, numericAmount),
    [ratesSnapshot, fromCode, toCode, numericAmount]
  );

  const activePairId = `${fromCode}->${toCode}`;
  const isFavorite = favorites.some((f) => f.id === activePairId);

  const handleToggleFavorite = () => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === activePairId)) {
        return prev.filter((f) => f.id !== activePairId);
      }
      const next: FavoritePair = {
        id: activePairId,
        from: fromCode,
        to: toCode,
        addedAt: new Date().toISOString(),
      };
      return [next, ...prev];
    });
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSwap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const handleSelectCurrency = (code: string) => {
    if (pickerTarget === 'from') {
      if (code === toCode) {
        setToCode(fromCode);
      }
      setFromCode(code);
    } else if (pickerTarget === 'to') {
      if (code === fromCode) {
        setFromCode(toCode);
      }
      setToCode(code);
    }
  };

  const handleRetryAll = () => {
    loadRatesAndCurrencies(true);
    loadHistory(fromCode, toCode, ratesSnapshot?.latestDate);
  };

  const showOfflineOrErrorBanner = isOffline || Boolean(ratesError);

  return (
    <div className="min-h-screen overflow-x-clip flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-150">
      {/* Compact Sticky Top Bar (56px, <= 15% mobile height) */}
      <header className="sticky top-0 z-30 h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Single-line Wordmark */}
          <a
            href="#converter"
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0"
          >
            {t.brandName}
          </a>

          {/* Zone 2: Clean single-line section links on desktop */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400"
          >
            <a
              href="#converter"
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              {t.navConverter}
            </a>
            <a
              href="#chart"
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              {t.navChart}
            </a>
            <a
              href="#offer-check"
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              {t.navOfferCheck}
            </a>
            <a
              href="#favorites"
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              {t.navFavorites}
            </a>
          </nav>

          {/* Zone 3: Language & Theme Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <Globe className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              <span>{t.toggleLangLabel}</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
              aria-label={theme === 'dark' ? t.toggleThemeLight : t.toggleThemeDark}
              title={theme === 'dark' ? t.toggleThemeLight : t.toggleThemeDark}
              className="min-h-[40px] min-w-[40px] rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 inline-flex items-center justify-center transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        {/* Page Heading */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 [text-wrap:balance]">
            {t.heroTitle}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            {t.heroSubtitle}
          </p>
        </div>

        {/* Clear Error & Cached Fallback Banner */}
        {showOfflineOrErrorBanner && (
          <div
            role="alert"
            className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-amber-950 dark:text-amber-200">
                  {t.offlineNoticeTitle}
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                  {ratesSnapshot ? (
                    <>
                      {t.offlineNoticeCached}{' '}
                      <span className="font-mono-num font-semibold">
                        ({t.rateDateLabel}: <bdi dir="ltr">{ratesSnapshot.latestDate}</bdi>)
                      </span>
                    </>
                  ) : (
                    t.offlineNoticeNoCache
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRetryAll}
              disabled={isRefreshingRates}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-amber-800 dark:hover:bg-amber-400 inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingRates ? 'animate-spin' : ''}`} />
              <span>{isRefreshingRates ? t.refreshing : t.retry}</span>
            </button>
          </div>
        )}

        {/* Responsive 2-column Desktop / 1-column Mobile Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Primary Column: Converter + 30-Day Chart */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <ConverterCard
              amountInput={amountInput}
              onAmountChange={setAmountInput}
              fromCode={fromCode}
              toCode={toCode}
              currencies={selectableCurrencies}
              conversion={conversion}
              isFavorite={isFavorite}
              onToggleFavorite={handleToggleFavorite}
              onSwap={handleSwap}
              onOpenPicker={(target) => setPickerTarget(target)}
              onRefresh={handleRetryAll}
              isLoading={isLoadingRates}
              isRefreshing={isRefreshingRates}
              lang={lang}
              t={t}
            />

            <RateChartCard
              fromCode={fromCode}
              toCode={toCode}
              points={historyPoints}
              isLoading={isLoadingHistory}
              errorMessage={historyError}
              isUsingCache={isHistoryCached}
              t={t}
            />
          </div>

          {/* Secondary Column: Offer Check + Saved Favorites */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            <OfferCheckCard
              amount={numericAmount}
              fromCode={fromCode}
              toCode={toCode}
              conversion={conversion}
              t={t}
            />

            <FavoritesCard
              favorites={favorites}
              activeFrom={fromCode}
              activeTo={toCode}
              ratesSnapshot={ratesSnapshot}
              currencies={selectableCurrencies}
              onSelectPair={(from, to) => {
                setFromCode(from);
                setToCode(to);
              }}
              onRemovePair={handleRemoveFavorite}
              lang={lang}
              t={t}
            />
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <p>{t.footerDisclaimer}</p>
          <p className="shrink-0">{t.footerPrivacy}</p>
        </div>
      </footer>

      {/* Searchable Currency Picker Modal / Bottom Sheet */}
      <CurrencyPickerModal
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={handleSelectCurrency}
        selectedCode={pickerTarget === 'from' ? fromCode : toCode}
        otherCode={pickerTarget === 'from' ? toCode : fromCode}
        currencies={selectableCurrencies}
        lang={lang}
        t={t}
      />
    </div>
  );
}
