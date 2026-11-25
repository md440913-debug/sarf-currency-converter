import { Language } from '../types/currency';

export interface Translations {
  brandName: string;
  navConverter: string;
  navChart: string;
  navOfferCheck: string;
  navFavorites: string;
  toggleLangLabel: string;
  toggleThemeLight: string;
  toggleThemeDark: string;
  heroTitle: string;
  heroSubtitle: string;
  converterHeading: string;
  amountLabel: string;
  fromLabel: string;
  toLabel: string;
  swapLabel: string;
  convertedResultLabel: string;
  saveFavorite: string;
  savedFavorite: string;
  indicativeRateBadge: string;
  rateDateLabel: string;
  sourceLabel: string;
  sourceName: string;
  inverseLabel: string;
  refreshRates: string;
  refreshing: string;
  offlineNoticeTitle: string;
  offlineNoticeCached: string;
  offlineNoticeNoCache: string;
  retry: string;
  loadingRates: string;
  pickerTitle: string;
  pickerSearchPlaceholder: string;
  pickerPopularHeading: string;
  pickerAllHeading: string;
  pickerNoResults: string;
  close: string;
  favoritesHeading: string;
  favoritesEmpty: string;
  favoritesRemove: string;
  favoritesLoadPair: string;
  favoritesCount: (count: number) => string;
  chartHeading: string;
  chartSubtitle: string;
  chart30dHigh: string;
  chart30dLow: string;
  chart30dChange: string;
  chartLoading: string;
  chartErrorCached: string;
  chartErrorEmpty: string;
  chartSameCurrency: string;
  chartSourceNote: string;
  offerHeading: string;
  offerSubtitle: string;
  offerRateLabel: string;
  offerRatePlaceholder: string;
  offerUseRefRate: string;
  offerFeeLabel: string;
  offerFeeUnitPercent: string;
  offerYouReceiveRef: string;
  offerYouReceiveShop: string;
  offerDifferenceLabel: string;
  offerEffectiveRateLabel: string;
  offerLessResult: (amount: string, code: string, pct: string) => string;
  offerMoreResult: (amount: string, code: string, pct: string) => string;
  offerEqualResult: string;
  offerEnterPrompt: string;
  offerInvalidAmount: string;
  footerDisclaimer: string;
  footerPrivacy: string;
  lastSyncedLabel: string;
}

const en: Translations = {
  brandName: 'Sarf',
  navConverter: 'Converter',
  navChart: '30-Day Chart',
  navOfferCheck: 'Offer Check',
  navFavorites: 'Favorites',
  toggleLangLabel: 'العربية',
  toggleThemeLight: 'Switch to light theme',
  toggleThemeDark: 'Switch to dark theme',
  heroTitle: 'Currency converter',
  heroSubtitle: 'Check indicative daily reference rates and compare exchange shop offers.',
  converterHeading: 'Convert currency',
  amountLabel: 'Amount',
  fromLabel: 'From',
  toLabel: 'To',
  swapLabel: 'Swap currencies',
  convertedResultLabel: 'Converted amount',
  saveFavorite: 'Save pair',
  savedFavorite: 'Saved',
  indicativeRateBadge: 'Indicative daily reference rate',
  rateDateLabel: 'Date',
  sourceLabel: 'Source',
  sourceName: 'Frankfurter API',
  inverseLabel: 'Inverse',
  refreshRates: 'Refresh',
  refreshing: 'Updating...',
  offlineNoticeTitle: 'Unable to reach Frankfurter API',
  offlineNoticeCached: 'Showing your last cached indicative daily reference rates from local storage.',
  offlineNoticeNoCache: 'No cached rates are available yet. Connect to the internet and retry.',
  retry: 'Retry',
  loadingRates: 'Loading indicative daily reference rates...',
  pickerTitle: 'Select currency',
  pickerSearchPlaceholder: 'Search by code, name, or symbol (e.g. SAR, Euro, ريال)',
  pickerPopularHeading: 'Common currencies',
  pickerAllHeading: 'All world currencies',
  pickerNoResults: 'No matching currencies found.',
  close: 'Close',
  favoritesHeading: 'Saved pairs',
  favoritesEmpty: 'No saved pairs yet. Star any pair in the converter for quick 1-tap access.',
  favoritesRemove: 'Remove saved pair',
  favoritesLoadPair: 'Load pair',
  favoritesCount: (count: number) => `${count} saved`,
  chartHeading: '30-day reference trend',
  chartSubtitle: 'Daily reference rate history',
  chart30dHigh: '30d High',
  chart30dLow: '30d Low',
  chart30dChange: '30d Change',
  chartLoading: 'Loading 30-day history...',
  chartErrorCached: 'Offline: showing cached 30-day chart data.',
  chartErrorEmpty: 'Could not load 30-day history while offline.',
  chartSameCurrency: 'Select two different currencies to view the 30-day rate trend.',
  chartSourceNote: 'Indicative daily reference rates · Source: Frankfurter',
  offerHeading: 'Exchange shop offer check',
  offerSubtitle: 'Compare an exchange counter quote and fee against the reference rate.',
  offerRateLabel: 'Offered rate',
  offerRatePlaceholder: 'Enter shop rate',
  offerUseRefRate: 'Fill reference rate',
  offerFeeLabel: 'Fee / commission',
  offerFeeUnitPercent: '%',
  offerYouReceiveRef: 'At reference rate',
  offerYouReceiveShop: 'With shop offer',
  offerDifferenceLabel: 'Net difference',
  offerEffectiveRateLabel: 'Effective rate after fee',
  offerLessResult: (amount, code, pct) => `You receive ${amount} ${code} less (${pct}) than the reference rate`,
  offerMoreResult: (amount, code, pct) => `You receive ${amount} ${code} more (${pct}) than the reference rate`,
  offerEqualResult: 'Matches the indicative daily reference rate exactly',
  offerEnterPrompt: 'Enter the exchange shop rate above to see how much more or less you receive.',
  offerInvalidAmount: 'Enter a valid conversion amount above zero to compare offers.',
  footerDisclaimer: 'All rates are indicative daily reference rates from Frankfurter (ECB & reference feeds), not live trading quotes.',
  footerPrivacy: 'No login · No ads · No tracking · Cached locally in your browser',
  lastSyncedLabel: 'Fetched',
};

const ar: Translations = {
  brandName: 'صرف',
  navConverter: 'المحول',
  navChart: 'رسم 30 يوماً',
  navOfferCheck: 'فحص العرض',
  navFavorites: 'المفضلة',
  toggleLangLabel: 'English',
  toggleThemeLight: 'التبديل إلى الوضع الفاتح',
  toggleThemeDark: 'التبديل إلى الوضع الداكن',
  heroTitle: 'محول العملات',
  heroSubtitle: 'تحقق من الأسعار المرجعية اليومية الاسترشادية وقارن عروض مكاتب الصرافة.',
  converterHeading: 'تحويل العملة',
  amountLabel: 'المبلغ',
  fromLabel: 'من',
  toLabel: 'إلى',
  swapLabel: 'تبديل العملتين',
  convertedResultLabel: 'المبلغ المحوّل',
  saveFavorite: 'حفظ الزوج',
  savedFavorite: 'محفوظ',
  indicativeRateBadge: 'سعر مرجعي يومي استرشادي',
  rateDateLabel: 'التاريخ',
  sourceLabel: 'المصدر',
  sourceName: 'Frankfurter API',
  inverseLabel: 'المعكوس',
  refreshRates: 'تحديث',
  refreshing: 'جاري التحديث...',
  offlineNoticeTitle: 'تعذر الاتصال بخدمة Frankfurter',
  offlineNoticeCached: 'يتم عرض آخر أسعار مرجعية يومية استرشادية محفوظة محلياً على جهازك.',
  offlineNoticeNoCache: 'لا توجد أسعار محفوظة بعد. يرجى الاتصال بالإنترنت وإعادة المحاولة.',
  retry: 'إعادة المحاولة',
  loadingRates: 'جاري تحميل الأسعار المرجعية اليومية الاسترشادية...',
  pickerTitle: 'اختر العملة',
  pickerSearchPlaceholder: 'ابحث بالرمز أو الاسم أو الرمز المالي (مثل SAR أو يورو)',
  pickerPopularHeading: 'عملات شائعة',
  pickerAllHeading: 'جميع العملات العالمية',
  pickerNoResults: 'لم يتم العثور على عملات مطابقة.',
  close: 'إغلاق',
  favoritesHeading: 'الأزواج المحفوظة',
  favoritesEmpty: 'لا توجد أزواج محفوظة بعد. اضغط على أيقونة النجمة في المحول لحفظ الزوج.',
  favoritesRemove: 'إزالة من المحفوظات',
  favoritesLoadPair: 'تحميل الزوج',
  favoritesCount: (count: number) => `${count} محفوظ`,
  chartHeading: 'اتجاه السعر خلال 30 يوماً',
  chartSubtitle: 'سجل السعر المرجعي اليومي',
  chart30dHigh: 'أعلى سعر (30 يوم)',
  chart30dLow: 'أدنى سعر (30 يوم)',
  chart30dChange: 'التغير (30 يوم)',
  chartLoading: 'جاري تحميل بيانات 30 يوماً...',
  chartErrorCached: 'غير متصل: يتم عرض بيانات الرسم المحفوظة مسبقاً.',
  chartErrorEmpty: 'تعذر تحميل رسم 30 يوماً أثناء عدم الاتصال.',
  chartSameCurrency: 'اختر عملتين مختلفتين لعرض اتجاه السعر خلال 30 يوماً.',
  chartSourceNote: 'أسعار مرجعية يومية استرشادية · المصدر: Frankfurter',
  offerHeading: 'فحص عرض الصرافة',
  offerSubtitle: 'قارن سعر مكتب الصرافة والرسوم مقابل السعر المرجعي اليومي.',
  offerRateLabel: 'السعر المعروض',
  offerRatePlaceholder: 'أدخل سعر الصرافة',
  offerUseRefRate: 'استخدام السعر المرجعي',
  offerFeeLabel: 'الرسوم / العمولة',
  offerFeeUnitPercent: '%',
  offerYouReceiveRef: 'حسب السعر المرجعي',
  offerYouReceiveShop: 'حسب عرض الصرافة',
  offerDifferenceLabel: 'صافي الفرق',
  offerEffectiveRateLabel: 'السعر الفعلي بعد الرسوم',
  offerLessResult: (amount, code, pct) => `ستستلم أقل بـ ${amount} ${code} (${pct}) مقارنة بالسعر المرجعي`,
  offerMoreResult: (amount, code, pct) => `ستستلم أكثر بـ ${amount} ${code} (${pct}) مقارنة بالسعر المرجعي`,
  offerEqualResult: 'يطابق السعر المرجعي اليومي الاسترشادي تماماً',
  offerEnterPrompt: 'أدخل سعر الصرف المعروض أعلاه لمعرفة مقدار الزيادة أو النقصان.',
  offerInvalidAmount: 'أدخل مبلغ تحويل صالح أكبر من الصفر لمقارنة العروض.',
  footerDisclaimer: 'جميع الأسعار هي أسعار مرجعية يومية استرشادية من Frankfurter وليست أسعار تداول فورية.',
  footerPrivacy: 'بدون تسجيل دخول · بدون إعلانات · بدون تتبع · يُحفظ محلياً في متصفحك',
  lastSyncedLabel: 'آخر جلب',
};

export const translations: Record<Language, Translations> = { en, ar };

const displayNamesCache: Partial<Record<Language, Intl.DisplayNames>> = {};

function getDisplayNames(lang: Language): Intl.DisplayNames | null {
  if (typeof Intl === 'undefined' || typeof Intl.DisplayNames === 'undefined') {
    return null;
  }
  if (!displayNamesCache[lang]) {
    try {
      displayNamesCache[lang] = new Intl.DisplayNames([lang === 'ar' ? 'ar' : 'en'], {
        type: 'currency',
      });
    } catch {
      return null;
    }
  }
  return displayNamesCache[lang] ?? null;
}

export function getCurrencyDisplayName(
  code: string,
  englishFallback: string,
  lang: Language
): string {
  if (lang === 'en') {
    return englishFallback;
  }
  const dn = getDisplayNames('ar');
  if (!dn) return englishFallback;
  try {
    const localized = dn.of(code);
    return localized && localized !== code ? localized : englishFallback;
  } catch {
    return englishFallback;
  }
}

export function formatNumber(
  value: number,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(value);
}

export function formatRate(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '—';
  if (value >= 100) {
    return formatNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }
  if (value >= 1) {
    return formatNumber(value, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  }
  if (value >= 0.01) {
    return formatNumber(value, { minimumFractionDigits: 4, maximumFractionDigits: 5 });
  }
  return formatNumber(value, { minimumFractionDigits: 6, maximumFractionDigits: 6 });
}
