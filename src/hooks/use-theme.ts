/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettingsStore } from '@/store/settings-store';

export function useTheme() {
  const scheme = useColorScheme();
  const preference = useSettingsStore((state) => state.themePreference);
  const resolvedScheme = preference === 'system' ? scheme : preference;
  const theme = resolvedScheme === 'unspecified' ? 'light' : resolvedScheme;

  return Colors[theme];
}
