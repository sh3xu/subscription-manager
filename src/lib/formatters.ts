import { dayDistanceFromNow, formatWeekdayMonthDay, parseISO } from '@/lib/date-utils';

export function formatMoney(amount: number, currency: string, locale = 'en-IN') {
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
