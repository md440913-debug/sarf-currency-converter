import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { CurrencyInfo, Language } from '../types/currency';
import { getCurrencyDisplayName, Translations } from '../i18n/translations';

interface CurrencyPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (code: string) => void;
  selectedCode: string;
  otherCode: string;
  currencies: CurrencyInfo[];
  lang: Language;
  t: Translations;
}

const POPULAR_CODES = ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'EGP', 'JOD', 'KWD', 'QAR', 'JPY', 'CHF', 'TRY'];

export const CurrencyPickerModal: React.FC<CurrencyPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedCode,
  otherCode,
  currencies,
  lang,
  t,
}) => {
  const [query, setQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 60);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const enrichedCurrencies = useMemo(() => {
    return currencies.map((c) => ({
      ...c,
      localizedName: getCurrencyDisplayName(c.code, c.name, lang),
    }));
  }, [currencies, lang]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return enrichedCurrencies;
    return enrichedCurrencies.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.localizedName.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [enrichedCurrencies, query]);

  const popularCurrencies = useMemo(() => {
    const map = new Map(enrichedCurrencies.map((c) => [c.code, c]));
    return POPULAR_CODES.map((code) => map.get(code)).filter(
      (c): c is (typeof enrichedCurrencies)[number] => Boolean(c)
    );
  }, [enrichedCurrencies]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={t.pickerTitle}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col max-h-[85vh] sm:max-h-[78vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" aria-hidden="true" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t.pickerTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="min-h-[44px] min-w-[44px] -me-2 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute start-3.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.pickerSearchPlaceholder}
              className="w-full min-h-[44px] ps-10 pe-10 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 border border-transparent focus:border-teal-600 dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={t.close}
                className="absolute end-1 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {!query.trim() && popularCurrencies.length > 0 && (
            <div className="mb-3">
              <div className="px-2.5 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                {t.pickerPopularHeading}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 px-1.5">
                {popularCurrencies.map((c) => {
                  const isSelected = c.code === selectedCode;
                  return (
                    <button
                      key={`pop-${c.code}`}
                      type="button"
                      onClick={() => {
                        onSelect(c.code);
                        onClose();
                      }}
                      className={`min-h-[44px] px-2.5 py-2 rounded-xl text-start flex items-center justify-between gap-1 border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                        isSelected
                          ? 'bg-teal-700 text-white border-teal-700 dark:bg-teal-600 dark:border-teal-500'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 border-slate-200/80 dark:border-slate-700/80 hover:border-teal-600/50 dark:hover:border-teal-400/50'
                      }`}
                    >
                      <span className="font-mono-num text-xs font-semibold tracking-tight">
                        {c.code}
                      </span>
                      <span
                        className={`text-xs truncate ${
                          isSelected ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {c.symbol}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="px-2.5 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            {t.pickerAllHeading}
          </div>

          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              {t.pickerNoResults}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.map((c) => {
                const isSelected = c.code === selectedCode;
                const isOther = c.code === otherCode;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onSelect(c.code);
                      onClose();
                    }}
                    className={`w-full min-h-[54px] px-3 py-2.5 flex items-center justify-between gap-3 rounded-xl text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-12 h-9 rounded-lg flex items-center justify-center font-mono-num text-xs font-semibold shrink-0 ${
                          isSelected
                            ? 'bg-teal-700 text-white dark:bg-teal-500 dark:text-slate-950'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {c.code}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {c.localizedName}
                        </div>
                        {lang === 'ar' && c.localizedName !== c.name && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {c.name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs font-mono-num text-slate-500 dark:text-slate-400">
                        {c.symbol}
                      </span>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                      ) : isOther ? (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          ↔
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
