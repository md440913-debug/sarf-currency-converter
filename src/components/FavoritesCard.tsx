import React from 'react';
import { ArrowLeft, ArrowRight, Star, Trash2 } from 'lucide-react';
import {
  CachedRatesSnapshot,
  CurrencyInfo,
  FavoritePair,
  Language,
} from '../types/currency';
import { computePairConversion } from '../services/frankfurter';
import { formatRate, getCurrencyDisplayName, Translations } from '../i18n/translations';

interface FavoritesCardProps {
  favorites: FavoritePair[];
  activeFrom: string;
  activeTo: string;
  ratesSnapshot: CachedRatesSnapshot | null;
  currencies: CurrencyInfo[];
  onSelectPair: (from: string, to: string) => void;
  onRemovePair: (id: string) => void;
  lang: Language;
  t: Translations;
}

export const FavoritesCard: React.FC<FavoritesCardProps> = ({
  favorites,
  activeFrom,
  activeTo,
  ratesSnapshot,
  currencies,
  onSelectPair,
  onRemovePair,
  lang,
  t,
}) => {
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section
      id="favorites"
      aria-labelledby="favorites-heading"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6"
    >
      <div className="flex items-baseline justify-between gap-3 mb-3.5">
        <h2
          id="favorites-heading"
          className="text-base font-semibold text-slate-900 dark:text-slate-100"
        >
          {t.favoritesHeading}
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
          {t.favoritesCount(favorites.length)}
        </span>
      </div>

      {favorites.length === 0 ? (
        <div className="py-5 px-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 text-center">
          <Star className="w-5 h-5 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            {t.favoritesEmpty}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {favorites.map((pair) => {
            const isActive = pair.from === activeFrom && pair.to === activeTo;
            const conv = computePairConversion(ratesSnapshot, pair.from, pair.to, 1);
            const fromMeta = currencies.find((c) => c.code === pair.from);
            const toMeta = currencies.find((c) => c.code === pair.to);
            const fromName = getCurrencyDisplayName(pair.from, fromMeta?.name ?? pair.from, lang);
            const toName = getCurrencyDisplayName(pair.to, toMeta?.name ?? pair.to, lang);

            return (
              <div
                key={pair.id}
                className={`flex items-center justify-between gap-2 py-2.5 first:pt-1 last:pb-1 ${
                  isActive ? 'text-teal-800 dark:text-teal-300' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectPair(pair.from, pair.to)}
                  aria-label={`${t.favoritesLoadPair}: ${pair.from} to ${pair.to}`}
                  className={`flex-1 min-w-0 min-h-[48px] px-3 py-2 rounded-xl flex items-center justify-between gap-3 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-mono-num text-sm font-semibold text-slate-900 dark:text-slate-100">
                      <span>{pair.from}</span>
                      <ArrowIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{pair.to}</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {fromName} · {toName}
                    </div>
                  </div>

                  <div dir="ltr" className="text-end shrink-0">
                    <div className="font-mono-num text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {conv ? formatRate(conv.rate) : '—'}
                    </div>
                    {conv?.rateDate && (
                      <div className="font-mono-num text-[11px] text-slate-400 dark:text-slate-500">
                        {conv.rateDate}
                      </div>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onRemovePair(pair.id)}
                  aria-label={`${t.favoritesRemove} ${pair.from} ${pair.to}`}
                  title={t.favoritesRemove}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
