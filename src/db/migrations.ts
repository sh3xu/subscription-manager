import { SQLiteDatabase } from 'expo-sqlite';

const CREATE_SUBSCRIPTIONS_TABLE = `
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,
  custom_cycle_days INTEGER,
  start_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  service_key TEXT,
  color TEXT,
  notification_ids TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)`;

const CREATE_RATES_TABLE = `
CREATE TABLE IF NOT EXISTS rates (
  base TEXT NOT NULL,
  quote TEXT NOT NULL,
  rate REAL NOT NULL,
  snapshot_date TEXT NOT NULL,
  fetched_at INTEGER NOT NULL,
  PRIMARY KEY (base, quote, snapshot_date)
)`;

const CREATE_RATES_INDEX = `
CREATE INDEX IF NOT EXISTS idx_rates_base_quote_date
  ON rates (base, quote, snapshot_date)`;

const CREATE_SETTINGS_TABLE = `
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
)`;

// NOTE: early versions shipped a rates table keyed by (base, quote). If that legacy schema is
// detected we drop it so the new (base, quote, snapshot_date) PK can take effect. Rate data is
// safe to discard since we can always refetch.
async function migrateLegacyRatesTable(db: SQLiteDatabase) {
  try {
    const cols = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(rates)`);
    if (cols.length && !cols.some((c) => c.name === 'snapshot_date')) {
      await db.runAsync(`DROP TABLE rates`);
    }
  } catch {
    // table may not exist yet; safe to ignore
  }
}

export async function runMigrations(db: SQLiteDatabase) {
  await db.runAsync(CREATE_SUBSCRIPTIONS_TABLE);
  await migrateLegacyRatesTable(db);
  await db.runAsync(CREATE_RATES_TABLE);
  await db.runAsync(CREATE_RATES_INDEX);
  await db.runAsync(CREATE_SETTINGS_TABLE);
}
