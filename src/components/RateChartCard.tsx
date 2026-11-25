import React, { useMemo, useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { HistoryPoint } from '../types/currency';
import { formatRate, Translations } from '../i18n/translations';

interface RateChartCardProps {
  fromCode: string;
  toCode: string;
  points: HistoryPoint[];
  isLoading: boolean;
  errorMessage: string | null;
  isUsingCache: boolean;
  t: Translations;
}

export const RateChartCard: React.FC<RateChartCardProps> = ({
  fromCode,
  toCode,
  points,
  isLoading,
  errorMessage,
  isUsingCache,
  t,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const stats = useMemo(() => {
    if (points.length === 0) return null;
    let min = points[0].rate;
    let max = points[0].rate;
    for (const p of points) {
      if (p.rate < min) min = p.rate;
      if (p.rate > max) max = p.rate;
    }
    const first = points[0].rate;
    const last = points[points.length - 1].rate;
    const changePct = first > 0 ? ((last - first) / first) * 100 : 0;
    return { min, max, first, last, changePct };
  }, [points]);

  const yLabels = useMemo(() => {
    if (!stats) return null;
    const mid = (stats.max + stats.min) / 2;
    return {
      max: formatRate(stats.max),
      mid: formatRate(mid),
      min: formatRate(stats.min),
    };
  }, [stats]);

  // SVG chart coordinate system (always rendered chronologically left-to-right)
  const width = 340;
  const height = 200;
  const maxLabelChars = yLabels
    ? Math.max(yLabels.max.length, yLabels.mid.length, yLabels.min.length)
    : 6;
  const padLeft = Math.min(84, Math.max(52, Math.ceil(maxLabelChars * 8) + 12));
  const padRight = 12;
  const padTop = 18;
  const padBottom = 26;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const chartGeometry = useMemo(() => {
    if (points.length < 2 || !stats) return null;
    const range = stats.max - stats.min;
    const effectiveRange = range === 0 ? stats.max * 0.01 || 1 : range;

    const coords = points.map((p, idx) => {
      const x = padLeft + (idx / (points.length - 1)) * plotW;
      const normY =
        range === 0
          ? 0.5
          : (p.rate - stats.min) / effectiveRange;
      const y = padTop + (1 - normY) * plotH;
      return { x, y, point: p };
    });

    const linePath = coords
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
      .join(' ');

    const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(2)} ${(
      padTop + plotH
    ).toFixed(2)} L ${coords[0].x.toFixed(2)} ${(padTop + plotH).toFixed(2)} Z`;

    return { coords, linePath, areaPath };
  }, [points, stats, padLeft, plotW, plotH]);

  const activeCoord =
    chartGeometry && activeIndex !== null && chartGeometry.coords[activeIndex]
      ? chartGeometry.coords[activeIndex]
      : chartGeometry
      ? chartGeometry.coords[chartGeometry.coords.length - 1]
      : null;

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!chartGeometry || chartGeometry.coords.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const rawRelX = ((e.clientX - rect.left) / rect.width) * width;
    const relX = Math.max(padLeft, Math.min(width - padRight, rawRelX));
    let nearest = 0;
    let minDist = Infinity;
    for (let i = 0; i < chartGeometry.coords.length; i++) {
      const dist = Math.abs(chartGeometry.coords[i].x - relX);
      if (dist < minDist) {
        minDist = dist;
        nearest = i;
      }
    }
    setActiveIndex(nearest);
  };

  const isSameCurrency = fromCode === toCode;
  const changePositive = (stats?.changePct ?? 0) >= 0;

  return (
    <section
      id="chart"
      aria-labelledby="chart-heading"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2
            id="chart-heading"
            className="text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            {t.chartHeading}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span dir="ltr" className="font-mono-num font-medium text-slate-700 dark:text-slate-300">
              {fromCode}/{toCode}
            </span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>{t.chartSubtitle}</span>
          </p>
        </div>

        {activeCoord && !isSameCurrency && (
          <div dir="ltr" className="text-end">
            <div className="font-mono-num text-sm font-semibold text-slate-900 dark:text-slate-100">
              {formatRate(activeCoord.point.rate)} {toCode}
            </div>
            <div className="font-mono-num text-xs text-slate-500 dark:text-slate-400">
              {activeCoord.point.date}
            </div>
          </div>
        )}
      </div>

      {isSameCurrency ? (
        <div className="h-[200px] flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 px-4 text-center text-sm text-slate-500 dark:text-slate-400">
          {t.chartSameCurrency}
        </div>
      ) : isLoading && points.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
          {t.chartLoading}
        </div>
      ) : errorMessage && points.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 px-4 text-center text-sm text-amber-700 dark:text-amber-300">
          {t.chartErrorEmpty}
        </div>
      ) : chartGeometry && stats && yLabels ? (
        <>
          {isUsingCache && errorMessage && (
            <div className="mb-3 text-xs text-amber-700 dark:text-amber-300">
              {t.chartErrorCached}
            </div>
          )}

          {/* Chronological SVG Chart (always LTR) */}
          <div dir="ltr" className="relative select-none touch-none overflow-hidden">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-[200px] block"
              onPointerMove={handlePointerMove}
              onPointerDown={handlePointerMove}
              onPointerLeave={() => setActiveIndex(null)}
              role="img"
              aria-label={`${fromCode} to ${toCode} 30-day rate trend`}
            >
              <defs>
                <linearGradient id="sarfChartArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f766e" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Y-axis numeric tick labels (max, mid, min) */}
              <text
                x={padLeft - 8}
                y={padTop}
                dominantBaseline="middle"
                textAnchor="end"
                className="fill-slate-500 dark:fill-slate-400 text-[13px] font-mono-num"
              >
                {yLabels.max}
              </text>
              <text
                x={padLeft - 8}
                y={padTop + plotH / 2}
                dominantBaseline="middle"
                textAnchor="end"
                className="fill-slate-500 dark:fill-slate-400 text-[13px] font-mono-num"
              >
                {yLabels.mid}
              </text>
              <text
                x={padLeft - 8}
                y={padTop + plotH}
                dominantBaseline="middle"
                textAnchor="end"
                className="fill-slate-500 dark:fill-slate-400 text-[13px] font-mono-num"
              >
                {yLabels.min}
              </text>

              {/* Subtle horizontal reference gridlines */}
              <line
                x1={padLeft}
                y1={padTop}
                x2={width - padRight}
                y2={padTop}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <line
                x1={padLeft}
                y1={padTop + plotH / 2}
                x2={width - padRight}
                y2={padTop + plotH / 2}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <line
                x1={padLeft}
                y1={padTop + plotH}
                x2={width - padRight}
                y2={padTop + plotH}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="1"
              />

              <path d={chartGeometry.areaPath} fill="url(#sarfChartArea)" />
              <path
                d={chartGeometry.linePath}
                fill="none"
                className="stroke-teal-700 dark:stroke-teal-400"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Active scrub crosshair and marker */}
              {activeCoord && (
                <g>
                  <line
                    x1={activeCoord.x}
                    y1={padTop}
                    x2={activeCoord.x}
                    y2={padTop + plotH}
                    className="stroke-slate-400 dark:stroke-slate-600"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                  />
                  <circle
                    cx={activeCoord.x}
                    cy={activeCoord.y}
                    r="4.5"
                    className="fill-teal-700 dark:fill-teal-400 stroke-white dark:stroke-slate-900"
                    strokeWidth="2"
                  />
                </g>
              )}

              {/* X-axis start and end dates */}
              <text
                x={padLeft}
                y={height - 4}
                className="fill-slate-400 dark:fill-slate-500 text-[13px] font-mono-num"
                textAnchor="start"
              >
                {points[0].date}
              </text>
              <text
                x={width - padRight}
                y={height - 4}
                className="fill-slate-400 dark:fill-slate-500 text-[13px] font-mono-num"
                textAnchor="end"
              >
                {points[points.length - 1].date}
              </text>
            </svg>
          </div>

          {/* 30d Summary Metrics */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {t.chart30dLow}
              </div>
              <div dir="ltr" className="font-mono-num text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5 text-start">
                {formatRate(stats.min)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {t.chart30dHigh}
              </div>
              <div dir="ltr" className="font-mono-num text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5 text-start">
                {formatRate(stats.max)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {t.chart30dChange}
              </div>
              <div
                dir="ltr"
                className={`font-mono-num text-sm font-semibold mt-0.5 inline-flex items-center gap-1 ${
                  changePositive
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-700 dark:text-rose-400'
                }`}
              >
                {changePositive ? (
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>
                  {changePositive ? '+' : ''}
                  {stats.changePct.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {t.chartSourceNote}
          </div>
        </>
      ) : null}
    </section>
  );
};
