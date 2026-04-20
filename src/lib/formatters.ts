import { dayDistanceFromNow, formatWeekdayMonthDay, parseISO } from '@/lib/date-utils';

export function getCurrencyFractionDigits(currency: string, locale?: string) {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  });
  return formatter.resolvedOptions().maximumFractionDigits;
}

export function normalizeCurrencyAmount(amount: number, currency: string, locale?: string) {
  const digits = getCurrencyFractionDigits(currency, locale);
  const factor = 10 ** digits;
  const epsilon = amount >= 0 ? Number.EPSILON : -Number.EPSILON;
  return Math.round((amount + epsilon) * factor) / factor;
}

export function formatMoney(amount: number, currency: string, locale?: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(isoDate: string) {
  return formatWeekdayMonthDay(parseISO(isoDate));
}

export function daysUntil(isoDate: string) {
  return dayDistanceFromNow(parseISO(isoDate));
}
