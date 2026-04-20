import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { initializeDb } from '@/db';
import { requestNotificationPermissions, scheduleWeeklySummary } from '@/lib/notifications';
import { useRatesStore } from '@/store/rates-store';
import { useSettingsStore } from '@/store/settings-store';
import { useSubscriptionsStore } from '@/store/subscriptions-store';

export default function RootLayout() {
  const [ready, setReady] = React.useState(false);
  const hasBootstrappedRef = React.useRef(false);
  const colorScheme = useColorScheme();
  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const themePreference = useSettingsStore((state) => state.themePreference);
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled);
  const hydrateSubscriptions = useSubscriptionsStore((state) => state.hydrate);
  const subscriptions = useSubscriptionsStore((state) => state.items);
  const baseCurrency = useSettingsStore((state) => state.baseCurrency);
  const ensureRatesFor = useRatesStore((state) => state.ensureForCurrencies);

  React.useEffect(() => {
    if (hasBootstrappedRef.current) return;
    hasBootstrappedRef.current = true;

    const bootstrap = async () => {
      try {
        await initializeDb();
      } catch (error) {
        console.warn('Failed to initialize database', error);
      }
      try {
        await hydrateSettings();
      } catch (error) {
        console.warn('Failed to hydrate settings', error);
      }
      try {
        await hydrateSubscriptions();
      } catch (error) {
        console.warn('Failed to hydrate subscriptions', error);
      }
      setReady(true);
    };
    void bootstrap();
  }, [hydrateSettings, hydrateSubscriptions]);

  // NOTE: whenever subscriptions or base currency change, silently refresh cached rates for every
  // currency currently in use. This removes the need for a manual "refresh" button and makes sure
  // conversions are available as soon as the user opens the app or adds a subscription.
  React.useEffect(() => {
    if (!ready) return;
    const currencies = Array.from(new Set(subscriptions.map((s) => s.currency)));
    if (!currencies.length) return;
    void ensureRatesFor(baseCurrency, currencies);
  }, [ready, subscriptions, baseCurrency, ensureRatesFor]);

  React.useEffect(() => {
    if (!ready || !notificationsEnabled) return;
    const bootstrapNotifications = async () => {
      try {
        if (await requestNotificationPermissions()) {
          await scheduleWeeklySummary();
        }
      } catch (error) {
        // NOTE: notifications are best-effort; never block the UI if native module is unavailable.
        console.warn('Notification bootstrap failed', error);
      }
    };
    void bootstrapNotifications();
  }, [ready, notificationsEnabled]);

  const resolvedScheme = themePreference === 'system' ? colorScheme : themePreference;
  const navigationTheme = resolvedScheme === 'dark' ? DarkTheme : DefaultTheme;

  if (!ready) {
    return <AnimatedSplashOverlay />;
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="subscription/new"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Add subscription',
          }}
        />
        <Stack.Screen
          name="subscription/[id]"
          options={{
            headerShown: true,
            title: 'Edit subscription',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
