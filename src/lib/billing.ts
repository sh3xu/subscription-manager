import {
  addDays,
  addMonths,
  addYears,
  endOfMonth,
  isAfter,
  isBefore,
  isEqual,
  parseISO,
  startOfMonth,
} from '@/lib/date-utils';
import { normalizeCurrencyAmount } from '@/lib/formatters';

import { Subscription, TimelineCharge } from '@/types/subscription';

const AVERAGE_DAYS_PER_YEAR = 365.2425;
const AVERAGE_DAYS_PER_MONTH = AVERAGE_DAYS_PER_YEAR / 12;

function advanceDate(date: Date, subscription: Subscription) {
  if (subscription.billingCycle === 'monthly') return addMonths(date, 1);
  if (subscription.billingCycle === 'yearly') return addYears(date, 1);
  return addDays(date, subscription.customCycleDays ?? 30);
}

export function getNextBillingDate(subscription: Subscription, fromDate = new Date()) {
  let current = parseISO(subscription.startDate);
  if (!isAfter(current, fromDate)) {
    while (!isAfter(current, fromDate)) {
      current = advanceDate(current, subscription);
    }
  }
  return current;
}

export function generateTimelineForSubscription(
  subscription: Subscription,
  rangeEnd: Date,
  fromDate = new Date()
) {
  const charges: TimelineCharge[] = [];
  let current = getNextBillingDate(subscription, fromDate);
  while (isBefore(current, rangeEnd) || isEqual(current, rangeEnd)) {
    charges.push({
      subscriptionId: subscription.id,
      subscriptionName: subscription.name,
      date: current.toISOString(),
      amount: subscription.amount,
      currency: subscription.currency,
    });
    current = advanceDate(current, subscription);
  }
  return charges;
}

export function generateTimeline(subscriptions: Subscription[], daysAhead = 60, fromDate = new Date()) {
  const rangeEnd = addDays(fromDate, daysAhead);
  return subscriptions
    .filter((item) => item.status === 'active')
    .flatMap((item) => generateTimelineForSubscription(item, rangeEnd, fromDate))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getMonthlySpend(subscription: Subscription) {
  if (subscription.billingCycle === 'monthly') return subscription.amount;
  if (subscription.billingCycle === 'yearly') return subscription.amount / 12;
  return (subscription.amount * AVERAGE_DAYS_PER_MONTH) / (subscription.customCycleDays ?? 30);
}

export function getYearlySpend(subscription: Subscription) {
  if (subscription.billingCycle === 'monthly') return subscription.amount * 12;
  if (subscription.billingCycle === 'yearly') return subscription.amount;
  return (subscription.amount * AVERAGE_DAYS_PER_YEAR) / (subscription.customCycleDays ?? 30);
}

// Resolver receives a subscription's native currency and returns the multiplier required to
// convert 1 unit of that currency into the base currency. Returning null indicates the rate is
// not yet cached; callers can decide to skip, fall back, or flag the projection as partial.
type RateResolver = (currency: string) => number | null;

export type ProjectedTotals = {
  monthlyTotal: number;
  yearlyTotal: number;
  mostExpensive: Subscription | undefined;
  missingCurrencies: string[];
};

export type MonthlyProjectionPoint = {
  monthStart: Date;
  total: number;
};

export function getProjectedTotals(
  subscriptions: Subscription[],
  baseCurrency: string,
  resolveRate: RateResolver,
  locale?: string
): ProjectedTotals {
  const active = subscriptions.filter((item) => item.status === 'active');
  const missingCurrencies = new Set<string>();

  let monthlyTotal = 0;
  let yearlyTotal = 0;
  const monthlyByItem = new Map<string, number>();

  for (const item of active) {
    const rate = item.currency === baseCurrency ? 1 : resolveRate(item.currency);
    const nativeMonthly = getMonthlySpend(item);
    const nativeYearly = getYearlySpend(item);
    if (rate === null) {
      missingCurrencies.add(item.currency);
      monthlyByItem.set(item.id, nativeMonthly);
      continue;
    }
    const normalizedMonthly = normalizeCurrencyAmount(nativeMonthly * rate, baseCurrency, locale);
    const normalizedYearly = normalizeCurrencyAmount(nativeYearly * rate, baseCurrency, locale);
    monthlyTotal = normalizeCurrencyAmount(monthlyTotal + normalizedMonthly, baseCurrency, locale);
    yearlyTotal = normalizeCurrencyAmount(yearlyTotal + normalizedYearly, baseCurrency, locale);
    monthlyByItem.set(item.id, normalizedMonthly);
  }

  const mostExpensive = active
    .slice()
    .sort((a, b) => (monthlyByItem.get(b.id) ?? 0) - (monthlyByItem.get(a.id) ?? 0))
    .at(0);

  return {
    monthlyTotal,
    yearlyTotal,
    mostExpensive,
    missingCurrencies: Array.from(missingCurrencies),
  };
}

export function getMonthlyProjection(
  subscriptions: Subscription[],
  baseCurrency: string,
  resolveRate: RateResolver,
  months = 6,
  fromDate = new Date(),
  locale?: string
): MonthlyProjectionPoint[] {
  const active = subscriptions.filter((item) => item.status === 'active');
  const monthStarts = Array.from({ length: months }, (_, index) =>
    startOfMonth(addMonths(fromDate, index))
  );
  const monthTotals = monthStarts.map((monthStart) => ({
    monthStart,
    total: 0,
  }));

  for (const subscription of active) {
    const rate = subscription.currency === baseCurrency ? 1 : resolveRate(subscription.currency);
    if (rate === null) continue;

    let chargeDate = getNextBillingDate(subscription, addDays(monthStarts[0], -1));
    const finalMonth = monthStarts[monthStarts.length - 1];
    const finalDate = endOfMonth(finalMonth);

    while (isBefore(chargeDate, finalDate) || isEqual(chargeDate, finalDate)) {
      const bucketIndex = monthStarts.findIndex(
        (monthStart) =>
          chargeDate.getFullYear() === monthStart.getFullYear() &&
          chargeDate.getMonth() === monthStart.getMonth()
      );
      if (bucketIndex >= 0) {
        const converted = normalizeCurrencyAmount(subscription.amount * rate, baseCurrency, locale);
        const running = monthTotals[bucketIndex].total + converted;
        monthTotals[bucketIndex].total = normalizeCurrencyAmount(running, baseCurrency, locale);
      }
      chargeDate = advanceDate(chargeDate, subscription);
    }
  }

  return monthTotals;
}

export function getCurrentMonthRange(date = new Date()) {
  return { start: startOfMonth(date), end: endOfMonth(date) };
}
