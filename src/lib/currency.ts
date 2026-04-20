import { CURRENCY_CODES } from '@/constants/currencies';
import {
  getLatestSnapshot,
  getSnapshotAt,
  isSnapshotStale,
  saveRateSnapshot,
} from '@/db/rates';

type LatestRatesResponse = {
  success?: boolean;
  base?: string;
  date?: string;
  rates: Record<string, number>;
  error?: {
    code?: number;
    type?: string;
    info?: string;
  };
};

function roundRateToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getExchangeApiBaseUrl() {
  return process.env.EXPO_PUBLIC_EXCHANGE_API_BASE_URL || 'https://api.exchangerate.host';
}

async function fetchRates(
  base: string,
  symbols: string[],
  date?: string
): Promise<Record<string, number>> {
  const endpoint = new URL(getExchangeApiBaseUrl());
  endpoint.searchParams.set('type', 'rates');
  endpoint.searchParams.set('base', base);
  endpoint.searchParams.set('symbols', symbols.join(','));
  if (date) endpoint.searchParams.set('date', date);

  const response = await fetch(endpoint.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch exchange rates');
  }
  const payload = (await response.json()) as LatestRatesResponse;
  if (!payload.rates || typeof payload.rates !== 'object') {
    const reason = payload.error?.info || payload.error?.type || 'Exchange API returned an error';
    throw new Error(reason);
  }
  const roundedRates: Record<string, number> = {};
  for (const [code, rate] of Object.entries(payload.rates)) {
    if (!Number.isFinite(rate)) continue;
    roundedRates[code] = roundRateToTwoDecimals(rate);
  }
  return roundedRates;
}

export async function fetchLatestRates(base: string, symbols: string[]): Promise<Record<string, number>> {
  return fetchRates(base, symbols);
}

async function saveSnapshotBatch(base: string, snapshotDate: string, rates: Record<string, number>) {
  const writes: Promise<void>[] = [];
  for (const [quote, rate] of Object.entries(rates)) {
    if (!Number.isFinite(rate)) continue;
    if (quote === base) continue;
    writes.push(saveRateSnapshot(base, quote, rate, snapshotDate));
  }
  await Promise.all(writes);
}

// Convert an amount using a provided multiplicative rate. `rate` is interpreted as
// the factor that converts 1 unit of `fromCurrency` into `toCurrency`.
export function convertAmount(amount: number, rate: number): number {
  return amount * rate;
}

// Returns the most recent cached rate; fetches from network if cache is stale or missing.
// Always stores the result under today's snapshot date so we accrue a historical series.
export async function ensureLatestRate(
  base: string,
  quote: string,
  ttlHours = 12
): Promise<number> {
  if (base === quote) return 1;

  const latest = await getLatestSnapshot(base, quote);
  const today = toISODateString(new Date());
  const isToday = latest?.snapshotDate === today;
  if (latest && isToday && !isSnapshotStale(latest.fetchedAt, ttlHours)) {
    return latest.rate;
  }

  try {
    const rates = await fetchLatestRates(base, [quote]);
    const rate = rates[quote];
    if (!rate) {
      throw new Error(`No FX rate available for ${base}->${quote}`);
    }
    await saveRateSnapshot(base, quote, rate, today);
    return rate;
  } catch (error) {
    if (latest) return latest.rate;
    throw error;
  }
}

// Resolve the appropriate rate for a given charge date.
// - Future charges -> the latest known rate (refreshing from network when stale).
// - Past/today charges -> the historical snapshot <= charge date.
// - If no historical snapshot exists for a past charge, falls back to latest.
export async function resolveRate(
  base: string,
  quote: string,
  chargeDate: Date
): Promise<number | null> {
  if (base === quote) return 1;
  const today = toISODateString(new Date());
  const chargeISO = toISODateString(chargeDate);

  if (chargeISO > today) {
    try {
      return await ensureLatestRate(base, quote);
    } catch {
      return null;
    }
  }

  const historical = await getSnapshotAt(base, quote, chargeISO);
  if (historical) return historical.rate;

  try {
    const symbols = CURRENCY_CODES.filter((code) => code !== base);
    const historicalRates = await fetchRates(base, symbols, chargeISO);
    await saveSnapshotBatch(base, chargeISO, historicalRates);
    const historicalRate = historicalRates[quote];
    if (!historicalRate) {
      throw new Error(`No historical FX rate available for ${base}->${quote} at ${chargeISO}`);
    }
    return historicalRate;
  } catch {
    try {
      const latest = await ensureLatestRate(base, quote);
      await saveRateSnapshot(base, quote, latest, chargeISO);
      return latest;
    } catch {
      return null;
    }
  }
}

// Batch pre-fetch latest rates for every currency used by subscriptions. Called at bootstrap
// and whenever the subscription list or base currency changes. Failures are swallowed per pair.
export async function ensureLatestRatesForCurrencies(
  base: string,
  quotes: string[]
): Promise<Record<string, number>> {
  const unique = Array.from(new Set(quotes.filter((q) => q && q !== base)));
  const result: Record<string, number> = {};
  await Promise.all(
    unique.map(async (quote) => {
      try {
        result[quote] = await ensureLatestRate(base, quote);
      } catch {
        // swallow: rate stays missing, UI falls back gracefully
      }
    })
  );
  return result;
}
