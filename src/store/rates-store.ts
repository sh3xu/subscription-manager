import { create } from 'zustand';

import { ensureLatestRate, ensureLatestRatesForCurrencies } from '@/lib/currency';

type RatesCache = Record<string, Record<string, number>>;

type RatesState = {
  // latest[base][quote] = rate
  latest: RatesCache;
  loading: boolean;
  ensureLatest: (base: string, quote: string) => Promise<number | null>;
  ensureForCurrencies: (base: string, quotes: string[]) => Promise<void>;
};

function setRate(cache: RatesCache, base: string, quote: string, rate: number): RatesCache {
  return {
    ...cache,
    [base]: { ...(cache[base] ?? {}), [quote]: rate },
  };
}

export const useRatesStore = create<RatesState>((set, get) => ({
  latest: {},
  loading: false,
  ensureLatest: async (base, quote) => {
    if (base === quote) return 1;
    try {
      const rate = await ensureLatestRate(base, quote);
      set({ latest: setRate(get().latest, base, quote, rate) });
      return rate;
    } catch {
      return null;
    }
  },
  ensureForCurrencies: async (base, quotes) => {
    set({ loading: true });
    try {
      const resolved = await ensureLatestRatesForCurrencies(base, quotes);
      let next = get().latest;
      for (const [quote, rate] of Object.entries(resolved)) {
        next = setRate(next, base, quote, rate);
      }
      set({ latest: next });
    } finally {
      set({ loading: false });
    }
  },
}));

// NOTE: pure selector so components can derive cached rates without subscribing to actions.
export function selectLatestRate(
  state: RatesState,
  base: string,
  quote: string
): number | null {
  if (base === quote) return 1;
  return state.latest[base]?.[quote] ?? null;
}
