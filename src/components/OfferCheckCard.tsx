import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Scale } from 'lucide-react';
import { ConversionResult, FeeUnit } from '../types/currency';
import { formatNumber, formatRate, Translations } from '../i18n/translations';

interface OfferCheckCardProps {
  amount: number;
  fromCode: string;
  toCode: string;
  conversion: ConversionResult | null;
  t: Translations;
}

export const OfferCheckCard: React.FC<OfferCheckCardProps> = ({
  amount,
  fromCode,
  toCode,
  conversion,
  t,
}) => {
  const [offeredRateInput, setOfferedRateInput] = useState('');
  const [feeInput, setFeeInput] = useState('0');
  const [feeUnit, setFeeUnit] = useState<FeeUnit>('from');

  // Reset offered rate when the currency pair changes so user never compares stale rates across pairs
  useEffect(() => {
    setOfferedRateInput('');
  }, [fromCode, toCode]);

  const sanitizeDecimal = (raw: string): string | null => {
    const normalized = raw
      .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
      .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
      .replace(/,/g, '.');
    if (normalized === '' || /^\d*\.?\d*$/.test(normalized)) {
      return normalized;
    }
    return null;
  };

  const handleUseReferenceRate = () => {
    if (!conversion) return;
    setOfferedRateInput(String(Number(conversion.rate.toPrecision(6))));
  };

  const offeredRate = Number.parseFloat(offeredRateInput);
  const feeValue = feeInput.trim() === '' ? 0 : Number.parseFloat(feeInput);

  const hasValidAmount = Number.isFinite(amount) && amount > 0;
  const hasValidOfferRate = Number.isFinite(offeredRate) && offeredRate > 0;
  const safeFee = Number.isFinite(feeValue) && feeValue >= 0 ? feeValue : 0;

  let refReceive = 0;
  let shopReceive = 0;
  let diffAmount = 0;
  let diffPct = 0;
  let effectiveRate = 0;

  if (conversion && hasValidAmount && hasValidOfferRate) {
    refReceive = amount * conversion.rate;

    if (feeUnit === 'from') {
      const netFrom = Math.max(0, amount - safeFee);
      shopReceive = netFrom * offeredRate;
    } else if (feeUnit === 'to') {
      shopReceive = Math.max(0, amount * offeredRate - safeFee);
    } else {
      const feeFactor = Math.max(0, 1 - safeFee / 100);
      shopReceive = amount * feeFactor * offeredRate;
    }

    diffAmount = shopReceive - refReceive;
    diffPct = refReceive > 0 ? (diffAmount / refReceive) * 100 : 0;
    effectiveRate = amount > 0 ? shopReceive / amount : 0;
  }

  const isEqual = Math.abs(diffAmount) < 0.005;
  const isMore = diffAmount >= 0.005;

  return (
    <section
      id="offer-check"
      aria-labelledby="offer-heading"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6"
    >
      <div className="mb-4">
        <h2
          id="offer-heading"
          className="text-base font-semibold text-slate-900 dark:text-slate-100"
        >
          {t.offerHeading}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          {t.offerSubtitle}
        </p>
      </div>

      <div className="space-y-4">
        {/* Offered Rate Input */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-1.5">
            <label
              htmlFor="offer-rate-input"
              className="text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              {t.offerRateLabel} (
              <span dir="ltr" className="font-mono-num">
                1 {fromCode} = ? {toCode}
              </span>
              )
            </label>
            {conversion && (
              <button
                type="button"
                onClick={handleUseReferenceRate}
                className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded px-1 py-0.5 whitespace-nowrap"
              >
                {t.offerUseRefRate}
              </button>
            )}
          </div>
          <div
            dir="ltr"
            className="w-full min-h-[48px] flex items-center rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus-within:border-teal-600 dark:focus-within:border-teal-400 focus-within:bg-white dark:focus-within:bg-slate-950 transition-colors"
          >
            <input
              id="offer-rate-input"
              type="text"
              inputMode="decimal"
              dir="ltr"
              value={offeredRateInput}
              onChange={(e) => {
                const v = sanitizeDecimal(e.target.value);
                if (v !== null) setOfferedRateInput(v);
              }}
              placeholder={
                conversion
                  ? `${t.offerRatePlaceholder} (${formatRate(conversion.rate)})`
                  : t.offerRatePlaceholder
              }
              className="flex-1 min-w-0 min-h-[46px] bg-transparent pl-3.5 pr-2 py-2.5 font-mono-num text-base font-semibold text-slate-900 dark:text-slate-100 placeholder:font-sans placeholder:font-normal placeholder:text-sm placeholder:text-slate-400 focus:outline-none text-left"
            />
            <span className="pr-3.5 pl-1 font-mono-num text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 select-none pointer-events-none">
              {toCode}
            </span>
          </div>
        </div>

        {/* Fee Input + Unit Selector */}
        <div>
          <label
            htmlFor="offer-fee-input"
            className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"
          >
            {t.offerFeeLabel}
          </label>
          <div className="flex items-stretch gap-2">
            <input
              id="offer-fee-input"
              type="text"
              inputMode="decimal"
              dir="ltr"
              value={feeInput}
              onChange={(e) => {
                const v = sanitizeDecimal(e.target.value);
                if (v !== null) setFeeInput(v);
              }}
              placeholder="0"
              className="flex-1 min-w-0 min-h-[48px] px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 font-mono-num text-base font-semibold text-slate-900 dark:text-slate-100 focus:border-teal-600 dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-950 focus:outline-none transition-colors text-start"
            />
            <div
              className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0"
              role="group"
              aria-label={t.offerFeeLabel}
            >
              {(['from', 'to', 'percent'] as const).map((unit) => {
                const active = feeUnit === unit;
                const label =
                  unit === 'from' ? fromCode : unit === 'to' ? toCode : t.offerFeeUnitPercent;
                return (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setFeeUnit(unit)}
                    className={`min-h-[40px] px-2.5 rounded-lg text-xs font-mono-num font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                      active
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Output */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
        {!conversion ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.loadingRates}
          </p>
        ) : !hasValidAmount ? (
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {t.offerInvalidAmount}
          </p>
        ) : !hasValidOfferRate ? (
          <div className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 py-1">
            <Scale className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
            <span>{t.offerEnterPrompt}</span>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Explicit text + icon verdict (never color alone) */}
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                isEqual
                  ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  : isMore
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/70 text-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/70 text-amber-900 dark:text-amber-200'
              }`}
              role="status"
            >
              {isMore || isEqual ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-700 dark:text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
              )}
              <p className="text-sm font-medium leading-snug">
                {isEqual
                  ? t.offerEqualResult
                  : isMore
                  ? t.offerMoreResult(
                      formatNumber(Math.abs(diffAmount)),
                      toCode,
                      `+${Math.abs(diffPct).toFixed(2)}%`
                    )
                  : t.offerLessResult(
                      formatNumber(Math.abs(diffAmount)),
                      toCode,
                      `-${Math.abs(diffPct).toFixed(2)}%`
                    )}
              </p>
            </div>

            {/* Clean comparison rows */}
            <dl className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">{t.offerYouReceiveRef}</dt>
                <dd dir="ltr" className="font-mono-num font-semibold text-slate-900 dark:text-slate-100">
                  {formatNumber(refReceive)} {toCode}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">{t.offerYouReceiveShop}</dt>
                <dd dir="ltr" className="font-mono-num font-semibold text-slate-900 dark:text-slate-100">
                  {formatNumber(shopReceive)} {toCode}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <dt className="text-slate-500 dark:text-slate-400">{t.offerDifferenceLabel}</dt>
                <dd
                  dir="ltr"
                  className={`font-mono-num font-bold ${
                    isEqual
                      ? 'text-slate-700 dark:text-slate-300'
                      : isMore
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {diffAmount >= 0 ? '+' : '-'}
                  {formatNumber(Math.abs(diffAmount))} {toCode} ({diffPct >= 0 ? '+' : ''}
                  {diffPct.toFixed(2)}%)
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">{t.offerEffectiveRateLabel}</dt>
                <dd dir="ltr" className="font-mono-num text-xs text-slate-600 dark:text-slate-300">
                  1 {fromCode} = {formatRate(effectiveRate)} {toCode}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </section>
  );
};
