import { create } from 'zustand';

import { AppSettings, DEFAULT_SETTINGS, getAppSettings, saveAppSettings } from '@/db/settings';
import { AppThemePreference } from '@/types/subscription';

type SettingsState = AppSettings & {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  updateBaseCurrency: (baseCurrency: string) => Promise<void>;
  updateNotifications: (notificationsEnabled: boolean) => Promise<void>;
  updateThemePreference: (themePreference: AppThemePreference) => Promise<void>;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  ...DEFAULT_SETTINGS,
  hydrated: false,
  hydrate: async () => {
    const settings = await getAppSettings();
    set({ ...settings, hydrated: true });
  },
  updateBaseCurrency: async (baseCurrency) => {
    await saveAppSettings({ baseCurrency });
    set({ baseCurrency });
  },
  updateNotifications: async (notificationsEnabled) => {
    await saveAppSettings({ notificationsEnabled });
    set({ notificationsEnabled });
  },
  updateThemePreference: async (themePreference) => {
    await saveAppSettings({ themePreference });
    set({ themePreference });
  },
}));
