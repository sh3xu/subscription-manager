import { getDb } from '@/db';
import { AppThemePreference } from '@/types/subscription';

export type AppSettings = {
  baseCurrency: string;
  notificationsEnabled: boolean;
  themePreference: AppThemePreference;
};

const DEFAULT_SETTINGS: AppSettings = {
  baseCurrency: 'INR',
  notificationsEnabled: true,
  themePreference: 'system',
};

const ENSURE_SETTINGS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
)`;

async function ensureSettingsTable() {
  await getDb().runAsync(ENSURE_SETTINGS_TABLE_SQL);
}

export async function getSetting(key: string) {
  await ensureSettingsTable();
  const row = await getDb().getFirstAsync('SELECT value FROM settings WHERE key = ?', [key]);
  return row ? String((row as any).value) : null;
}

export async function setSetting(key: string, value: string) {
  await ensureSettingsTable();
  await getDb().runAsync(
    `INSERT INTO settings (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value]
  );
}

export async function getAppSettings(): Promise<AppSettings> {
  const [baseCurrency, notificationsEnabled, themePreference] = await Promise.all([
    getSetting('base_currency'),
    getSetting('notifications_enabled'),
    getSetting('theme_preference'),
  ]);

  return {
    baseCurrency: baseCurrency ?? DEFAULT_SETTINGS.baseCurrency,
    notificationsEnabled: notificationsEnabled
      ? notificationsEnabled === 'true'
      : DEFAULT_SETTINGS.notificationsEnabled,
    themePreference: (themePreference as AppThemePreference) ?? DEFAULT_SETTINGS.themePreference,
  };
}

export async function saveAppSettings(settings: Partial<AppSettings>) {
  const writes: Promise<void>[] = [];
  if (settings.baseCurrency) writes.push(setSetting('base_currency', settings.baseCurrency));
  if (settings.notificationsEnabled !== undefined) {
    writes.push(setSetting('notifications_enabled', String(settings.notificationsEnabled)));
  }
  if (settings.themePreference) writes.push(setSetting('theme_preference', settings.themePreference));
  await Promise.all(writes);
}

export { DEFAULT_SETTINGS };
