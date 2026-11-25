import React from 'react';
import { ArrowUpDown, ChevronDown, RefreshCw, Star } from 'lucide-react';
import {
  ConversionResult,
  CurrencyInfo,
  Language,
} from '../types/currency';
import {
  formatNumber,
  formatRate,
  getCurrencyDisplayName,
  Translations,
} from '../i18n/translations';

interface ConverterCardProps {
  amountInput: string;
  onAmountChange: (val: string) => void;
  fromCode: string;
  toCode: string;
  currencies: CurrencyInfo[];
  conversion: ConversionResult | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSwap: () => void;
  onOpenPicker: (target: 'from' | 'to') => void;
  onRefresh: () => void;
  isLoading: boolean;
  isRefreshing: boolean;
  lang: Language;
  t: Translations;
}

export const ConverterCard: React.FC<ConverterCardProps> = ({
  amountInput,
  onAmountChange,
  fromCode,
  toCode,
  currencies,
  conversion,
  isFavorite,
  onToggleFavorite,
  onSwap,
  onOpenPicker,
  onRefresh,
  isLoading,
  isRefreshing,
  lang,
  t,
}) => {
  const fromInfo = currencies.find((c) => c.code === fromCode);
  const toInfo = currencies.find((c) => c.code === toCode);

  const fromName = getCurrencyDisplayName(fromCode, fromInfo?.name ?? fromCode, lang);
  const toName = getCurrencyDisplayName(toCode, toInfo?.name ?? toCode, lang);

  const handleAmountInput = (raw: string) => {
    // Allow Arabic/Persian digits or standard decimal input cleanly
    const normalized = raw
      .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
      .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
      .replace(/,/g, '.');
    if (normalized === '' || /^\d*\.?\d*$/.test(normalized)) {
      onAmountChange(normalized);
    }
  };

  return (
    <section
      id="converter"
      aria-labelledby="converter-heading"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6"
    >
      {/* Card Top Row */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2
          id="converter-heading"
          className="text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          {t.converterHeading}
        </h2>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
              isFavorite
                ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                : 'bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Star
              className={`w-4 h-4 ${
                isFavorite
                  ? 'fill-teal-600 text-teal-600 dark:fill-teal-400 dark:text-teal-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            />
            <span>{isFavorite ? t.savedFavorite : t.saveFavorite}</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label={t.refreshRates}
            title={t.refreshRates}
            className="min-h-[44px] min-w-[44px] px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center justify-center transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Amount + From Currency */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="converter-amount"
            className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"
          >
            {t.amountLabel} · {t.fromLabel}
          </label>
          <div className="flex items-stretch gap-2.5">
            <input
              id="converter-amount"
              type="text"
              inputMode="decimal"
              dir="ltr"
              value={amountInput}
              onChange={(e) => handleAmountInput(e.target.value)}
              placeholder="100"
              className="flex-1 min-w-0 min-h-[54px] px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-2xl font-semibold font-mono-num text-slate-900 dark:text-slate-100 focus:border-teal-600 dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-950 focus:outline-none transition-colors text-start"
            />

            <button
              type="button"
              onClick={() => onOpenPicker('from')}
              className="min-h-[54px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-teal-600/60 dark:hover:border-teal-400/60 flex items-center gap-2.5 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              aria-label={`${t.fromLabel}: ${fromCode} ${fromName}`}
            >
              <div className="text-start">
                <div className="font-mono-num text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {fromCode}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[92px] truncate leading-tight mt-0.5">
                  {fromName}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* Swap Divider Row */}
        <div className="relative flex items-center justify-center py-0.5">
          <div className="absolute inset-x-0 h-px bg-slate-100 dark:bg-slate-800" aria-hidden="true" />
          <button
            type="button"
            onClick={onSwap}
            aria-label={t.swapLabel}
            className="relative z-10 min-h-[44px] min-w-[44px] px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 hover:border-teal-600/50 dark:hover:border-teal-400/50 active:scale-95 inline-flex items-center justify-center gap-2 text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span className="whitespace-nowrap">{t.swapLabel}</span>
          </button>
        </div>

        {/* Converted Result + To Currency */}
        <div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            {t.convertedResultLabel} · {t.toLabel}
          </div>
          <div className="flex items-stretch gap-2.5">
            <div
              className="flex-1 min-w-0 min-h-[54px] px-4 py-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/25 border border-teal-200/80 dark:border-teal-900/60 flex items-center justify-between gap-2"
              aria-live="polite"
            >
              {isLoading && !conversion ? (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {t.loadingRates}
                </span>
              ) : conversion ? (
                <span
                  dir="ltr"
                  className="text-2xl sm:text-3xl font-bold font-mono-num text-teal-900 dark:text-teal-200 truncate"
                >
                  {formatNumber(conversion.convertedAmount, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: conversion.convertedAmount < 1 && conversion.convertedAmount > 0 ? 4 : 2,
                  })}
                </span>
              ) : (
                <span className="text-xl font-mono-num text-slate-400">—</span>
              )}
              {toInfo?.symbol && toInfo.symbol !== toCode && (
                <span className="text-sm font-medium text-teal-700/80 dark:text-teal-400/80 shrink-0">
                  {toInfo.symbol}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => onOpenPicker('to')}
              className="min-h-[54px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-teal-600/60 dark:hover:border-teal-400/60 flex items-center gap-2.5 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              aria-label={`${t.toLabel}: ${toCode} ${toName}`}
            >
              <div className="text-start">
                <div className="font-mono-num text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {toCode}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[92px] truncate leading-tight mt-0.5">
                  {toName}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Indicative Daily Reference Rate Metadata (Unboxed, clean typographic separators) */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
        {conversion && (
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <div dir="ltr" className="font-mono-num text-sm font-semibold text-slate-900 dark:text-slate-100">
              1 {fromCode} = {formatRate(conversion.rate)} {toCode}
            </div>
            <div dir="ltr" className="font-mono-num text-xs text-slate-500 dark:text-slate-400">
              1 {toCode} = {formatRate(conversion.inverseRate)} {fromCode}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {t.indicativeRateBadge}
          </span>
          {conversion?.rateDate && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                {t.rateDateLabel}: <bdi dir="ltr"><span className="font-mono-num">{conversion.rateDate}</span></bdi>
              </span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>
            {t.sourceLabel}: {t.sourceName}
          </span>
        </div>
      </div>
    </section>
  );
};
