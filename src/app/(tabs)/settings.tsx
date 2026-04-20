import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CurrencySelect } from '@/components/ui/currency-select';
import { Screen } from '@/components/ui/screen';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Surface } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSettingsStore } from '@/store/settings-store';
import { AppThemePreference } from '@/types/subscription';

const themeOptions: { value: AppThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const {
    baseCurrency,
    notificationsEnabled,
    themePreference,
    updateBaseCurrency,
    updateNotifications,
    updateThemePreference,
  } = useSettingsStore();

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="small" themeColor="textSecondary">
          Preferences
        </ThemedText>
        <ThemedText style={styles.title}>Settings</ThemedText>
      </View>

      <Surface bordered padding="md" style={styles.section}>
        <ThemedText type="smallBold">Localised currency</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Every projection, total and converted amount is shown in this currency. Past charges use
          the rate from their billing date; upcoming charges use the latest rate.
        </ThemedText>
        <CurrencySelect value={baseCurrency} onChange={updateBaseCurrency} />
      </Surface>

      <Surface bordered padding="md" style={styles.section}>
        <View style={styles.rowBetween}>
          <View style={styles.rowBetweenText}>
            <ThemedText type="smallBold">Reminders</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Get a nudge a day before every renewal.
            </ThemedText>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={updateNotifications}
            trackColor={{ true: theme.accent, false: theme.border }}
            thumbColor={theme.accentText}
          />
        </View>
      </Surface>

      <Surface bordered padding="md" style={styles.section}>
        <ThemedText type="smallBold">Appearance</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Match your system or pick a fixed palette.
        </ThemedText>
        <SegmentedControl
          options={themeOptions}
          value={themePreference}
          onChange={updateThemePreference}
        />
      </Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  section: {
    gap: Spacing.two,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  rowBetweenText: {
    flex: 1,
    gap: 2,
  },
});
