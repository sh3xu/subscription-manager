import { getDb } from '@/db';

export type RateSnapshot = {
  base: string;
  quote: string;
  rate: number;
  snapshotDate: string;
  fetchedAt: number;
};

function mapSnapshot(row: any): RateSnapshot {
  return {
    base: String(row.base),
    quote: String(row.quote),
    rate: Number(row.rate),
    snapshotDate: String(row.snapshot_date),
    fetchedAt: Number(row.fetched_at),
  };
}

export async function getLatestSnapshot(base: string, quote: string): Promise<RateSnapshot | null> {
  const row = await getDb().getFirstAsync(
    `SELECT * FROM rates WHERE base = ? AND quote = ? ORDER BY snapshot_date DESC LIMIT 1`,
    [base, quote]
  );
  return row ? mapSnapshot(row) : null;
}

export async function getSnapshotAt(
  base: string,
  quote: string,
  snapshotDate: string
): Promise<RateSnapshot | null> {
  const row = await getDb().getFirstAsync(
    `SELECT * FROM rates
      WHERE base = ? AND quote = ? AND snapshot_date <= ?
      ORDER BY snapshot_date DESC LIMIT 1`,
    [base, quote, snapshotDate]
  );
  return row ? mapSnapshot(row) : null;
}

export async function saveRateSnapshot(
  base: string,
  quote: string,
  rate: number,
  snapshotDate: string,
  fetchedAt = Date.now()
): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO rates (base, quote, rate, snapshot_date, fetched_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(base, quote, snapshot_date)
      DO UPDATE SET rate = excluded.rate, fetched_at = excluded.fetched_at`,
    [base, quote, rate, snapshotDate, fetchedAt]
  );
}

export function isSnapshotStale(fetchedAt: number, ttlHours = 12): boolean {
  return Date.now() - fetchedAt > ttlHours * 60 * 60 * 1000;
}
